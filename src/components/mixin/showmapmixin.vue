
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { Shape, Container, Stage, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { APP, DISP, DEV } from '../../sub/constant/config.js'
import { SHAPE, SENSOR, POSITION } from '../../sub/constant/Constants'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import reloadmixinVue from './reloadmixin.vue'
import moment from 'moment'
import * as mock from '../../assets/mock/mock'

export default {
  mixins: [reloadmixinVue],
  data() {
    return {
      isShownMapImage: false,
      positionedExb: [],
      realWidth: null,
      isFirstTime: true,
      showTryCount: 0,
      tempMapFitMobile: DISP.MAP_FIT_MOBILE,
      oldMapImageScale: 0,
      ICON_FONTSIZE_RATIO: 0.7,
      showIconMinWidth: POSITION.SHOW_ICON_MIN_WIDTH,
      reloadSelectedTx: {},
      showReady: false,
      count: 0, // for mock test
      meditagSensors: [],
      selectedGroup: null,
      selectedCategory: null,
      showingDetailTime: null,
    }
  },
  computed: {
    areaOptions() {
      return StateHelper.getOptionsFromState('area', false, true)
    },
    ...mapState('app_service', [
      'areas',
      'exbs',
      'txs',
    ]),
    ...mapState('main', [
      'orgPositions',
      'positionHistores',
    ]),
    ...mapState([
      'loginId'
    ]),
    selectedArea: {
      get() { return this.$store.state.main.selectedArea},
      set(val) { this.replaceMain({'selectedArea': val})},
    },
  },
  created() {
    if (this.$route.path.startsWith('/main')) {      
      let timer = 0
      let path = this.$route.path
      let currentWidth = window.innerWidth
      let onResize = () => {
        if (path != this.$route.path) {
          window.removeEventListener('resize', onResize)
          clearTimeout(timer)
          return
        }
        if (timer > 0) {
          clearTimeout(timer)
        } 
        timer = setTimeout(() => {
          if (currentWidth === window.innerWidth && Util.isAndroidOrIOS()) {
            // モバイル端末だと表示の直後にリサイズイベントが発生してしまうため、
            // 画面横幅が変わっていなければ処理をキャンセル
            return
          } else {
            currentWidth = window.innerWidth
          }
          console.log(path + ' : ' + this.$route.path, this)
          this.reset()
          if (this.stage) {
            this.stage.removeAllChildren()
            if (this.resetDetail) {
              this.resetDetail()
            }
            this.stage.update()
            this.fetchData()
          }
        }, 200)
      }
      window.addEventListener('resize', onResize)
    }
  },
  mounted() {
    Util.debug('In showmapmixin mounted.')
    this.addDblTapListener(() => {
      Util.debug('in Listener')
      this.toggleCallBack && this.toggleCallBack()
      this.isShownMapImage = false
      this.toggleMapFitMobile()
      this.showMapImage && this.showMapImage()
    })
  },
  beforeDestroy() {
    this.tempMapFitMobile = DISP.MAP_FIT_MOBILE
  },
  methods: {
    ...mapActions('main', [
      'pushOrgPositions',
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    mapImage() {
      let area = _.find(this.areas, (area) => {
        if (this.selectedArea == null) {
          this.selectedArea = area.areaId // nullの場合、最初のものにする
        }
        return area.areaId == this.selectedArea
      })
      return area && this.getMapImage(area.areaId)
    },
    getMapImage(areaId) {
      let areaImage = _.find(this.$store.state.app_service.areaImages, (areaImage) => {
        return areaImage.areaId == areaId
      })
      return areaImage && areaImage.mapImage
    },
    async fetchAreaExbs(tx) {
      if (this.isFirstTime) {
        await StateHelper.load('area')
        this.selectedArea = this.selectedArea ? this.selectedArea : Util.getValue(this, 'areas.0.areaId', null)
        await StateHelper.loadAreaImage(this.selectedArea)
        console.log('after loadAreas. selectedArea=' + this.selectedArea)
        await StateHelper.load('exb')
        if (tx) {
          await StateHelper.load('tx')
        }
        this.isFirstTime = false
      }
    },
    showMapImageDef(callback) {
      this.showTryCount++
      console.log('showMapImageDef', this.selectedArea, this.isShownMapImage)
      if (this.isShownMapImage) {
        if (callback) {
          callback()
        }
        return
      }
      if (!this.mapImage()) {
        if (this.showTryCount < 10) {
          this.$nextTick(() => {
            console.warn('again because no image')
            this.showMapImage()
          })
        }
        else {
          Util.debug('No mapImage in showMapImageDef.')
          this.noImageErrorKey && this.loginId && this.showErrorModal({key: this.noImageErrorKey})
        }
        return
      }

      var bg = new Image()
      bg.src = this.mapImage()
      bg.onload = (evt) => {
        this.drawMapImage(bg)
        if (callback) {
          callback()
        }
      }
    },
    calcFitSize(target, parent, top = 82) {
      const parentHeight = document.documentElement.clientHeight - parent.offsetTop - top
      const isMapWidthLarger = parentHeight / parent.clientWidth > target.height / target.width
      let fitWidth
      if (HtmlUtil.isMobile()) {
        fitWidth = (this.tempMapFitMobile == 'both' && isMapWidthLarger) || this.tempMapFitMobile == 'width'
      } else {
        fitWidth = (DISP.MAP_FIT == 'both' && isMapWidthLarger) || DISP.MAP_FIT == 'width'
      }
      const result = {}
      if (fitWidth) {
        result.width = parent.clientWidth
        result.height = parent.clientWidth * target.height / target.width
      } else {
        result.width = parentHeight * target.width / target.height
        result.height = parentHeight
      }
      this.oldMapImageScale = this.mapImageScale
      this.mapImageScale = result.width / target.width
      console.debug(fitWidth, result.width, result.height, parentHeight)
      if (this.onMapImageScale) {
        this.onMapImageScale()
      }
      return result
    },
    drawMapImage(bg) {
      let canvas = this.$refs.map
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      let parent = document.getElementById('map').parentElement

      const size = this.calcFitSize(bg, parent)
      canvas.width = size.width
      canvas.height = size.height

      if (this.stage) { 
        this.stage.removeAllChildren()
        if (this.txCont) {
          this.txCont.removeAllChildren()
          this.txCont = null
        }
        if (this.exbCon) {
          this.exbCon.removeAllChildren()
          this.stage.update()
          this.exbCon = null
        }
      }
      this.stage = new Stage('map')
      this.stage.canvas = canvas
      this.stage.mouseEnabled = true
      if (Touch.isSupported()) {
        Touch.enable(this.stage)
      }

      var bitmap = new Bitmap(bg)
      bitmap.scaleY = bitmap.scaleX = this.mapImageScale
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update() 
      this.bitmap = bitmap
      this.oldSelectedArea = this.selectedArea
    },
    changeArea(val) {
      if (val) {
        let area = _.find(this.areas, (area) => {
          return area.areaId == val
        })
        if (this.getMapImage(area.areaId)) {
          this.reset()
          this.selectedArea = val
          this.fetchData()
        }
        else {
          Util.debug('No mapImage in changeArea.')
          this.noImageErrorKey && this.showErrorModal({key: this.noImageErrorKey})
          this.$nextTick(() => {
            this.selectedArea = this.oldSelectedArea
          })
        }
      }      
    },
    forceUpdateRealWidth() {
      if (!this.realWidth) { // Due to force update computed property mapRatio
        this.realWidth = 1
        this.$nextTick(() => {
          this.realWidth = ''
        })
      }
    },
    replaceExb(exb, nokeep) {
      if (this.keepExbPosition) {
        exb.x = exb.x / this.oldMapImageScale * this.mapImageScale
        exb.y = exb.y / this.oldMapImageScale * this.mapImageScale
      } else {
        nokeep(exb)
      }
    },
    toggleMapFitMobile() {
      if (this.tempMapFitMobile === 'both') {
        this.tempMapFitMobile = 'width'
      } else {
        this.tempMapFitMobile = 'both'
      }
      Util.debug('tempMapFitMobile: ' + this.tempMapFitMobile)
    },
    getDblTapListener(callback) {
      let dblTap = false
      return (evt) => {
        if (dblTap) {
          Util.debug('second tap!')
          Util.debug(evt)
          callback && callback()
        } else {
          Util.debug('first tap!')
          dblTap = true
          setTimeout(() => {dblTap = false}, 500)
        }
      }
    },
    addDblTapListener(callback) {
      Util.debug('add listener')
      const listener = this.getDblTapListener(callback)
      const map = this.$refs.map
      map && map.addEventListener('touchstart', (evt) => listener(evt))
    },
    positionFilter(positions, groupId, categoryId) {
      return _(positions).filter((pos) => {
        const tx = _.find(this.txs, tx => tx.btxId == pos.btx_id)
        let grpHit
        let catHit
        if (groupId) {
          const posGroupId = Util.getValue(tx, 'group.groupId', null)
          grpHit = groupId == posGroupId
        } else {
          grpHit = true
        }
        if (categoryId) {
          const posCategoryId = Util.getValue(tx, 'category.categoryId', null)
          catHit = categoryId == posCategoryId
        } else {
          catHit = true
        }
        return grpHit && catHit
      }).value()
    },
    isMagnetOn(magnet) {
      return magnet && magnet.magnet === SENSOR.MAGNET_STATUS.ON
    },
    async storePositionHistory(count){
      const pMock = DEV.USE_MOCK_EXC? mock.positions[count]: null
      if (APP.USE_POSITION_HISTORY) {
        // Serverで計算された位置情報を得る
        const positionHistores = await EXCloudHelper.fetchPositionHistory(this.exbs, this.txs, pMock)
        this.replaceMain({positionHistores})
      } else {
        // 移動平均数分のポジションデータを保持する
        this.pushOrgPositions(await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock))
      }
    },
    setPositionedExb(){
      Util.debug('Raw exb', this.exbs, this.selectedArea)
      this.positionedExb = _(this.exbs).filter((exb) => {
        return exb.enabled && exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
      }).value()
      Util.debug('positionedExb', this.positionedExb)
      if (this.positionedExb.length == 0) {
        console.warn('positionedExb is empty. check if exbs are enabled')
      }
    },
    getDisplay(tx) {
      const catOrGr = tx[DISP.DISPLAY_PRIORITY[0]] || tx[DISP.DISPLAY_PRIORITY[1]]
      const display = catOrGr && catOrGr.display || {}
      return {
        color: display.color || DISP.TX_COLOR,
        bgColor: display.bgColor || DISP.TX_BGCOLOR,
        shape: display.shape || SHAPE.CIRCLE
      }
    },
    getFinalReceiveTime (time) {
      return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : ''
    },
    isShowModal() {
      return window.innerWidth < this.showIconMinWidth
    },
    getMeditagSensor(btxId) {
      if (this.meditagSensors) {
        return this.meditagSensors.find((val) => btxId == val.btx_id)
      }
      return null
    },
    positions() {
      let positions = []
      if (APP.USE_POSITION_HISTORY) {
        positions = this.positionHistores
      } else {
        const now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
        positions = PositionHelper.correctPosId(this.orgPositions, now)
      }
      if (APP.USE_MEDITAG && this.meditagSensors) {
        positions = SensorHelper.setStress(positions, this.meditagSensors)
      }
      positions = this.positionFilter(positions, this.selectedGroup, this.selectedCategory)
      return positions
    },
    showDetail(btxId, x, y) {
      const tipOffsetY = 15
      const popupHeight = this.getMeditagSensor(btxId)? 236: 135
      const tx = this.txs.find((tx) => tx.btxId == btxId)
      const display = this.getDisplay(tx)
      const map = HtmlUtil.getRect('#map')
      const containerParent = HtmlUtil.getRect('#mapContainer', 'parentNode')
      const offsetX = map.left - containerParent.left
      const offsetY = map.top - containerParent.top
      const isDispRight = x + offsetX + 100 < window.innerWidth
      // rev === trueの場合、ポップアップを上に表示
      const rev = y + map.top + DISP.TX_R + tipOffsetY + popupHeight > window.innerHeight
      const p = tx.pot? tx.pot: {}

      const position = this.positions().find((e) => {
        return e.btx_id === btxId
      })
      const balloonClass = !btxId ? '': 'balloon' + (rev ? '-u': '-b')
      const selectedTx = {
        btxId,
        minor: 'minor:' + btxId,
        major: tx.major? 'major:' + tx.major : '',
        // TX詳細ポップアップ内部で表示座標計算する際に必要
        orgLeft: x + offsetX,
        orgTop: y + offsetY,
        isAbove: rev,
        containerWidth: containerParent.width,
        containerHeight: containerParent.height,
        class: balloonClass,
        name: tx.txName? tx.txName: p.potName ? p.potName : '',
        timestamp: position ? this.getFinalReceiveTime(position.timestamp) : '',
        thumbnail: p.thumbnail ? p.thumbnail : '',
        category: p.potCategoryList && p.potCategoryList.length > 0 ? p.potCategoryList[0].category.categoryName : '',
        group: p.potGroupList && p.potGroupList.length > 0 ? p.potGroupList[0].group.groupName : '',
        bgColor: '#' + display.bgColor,
        color: '#' + display.color,
        isDispRight: isDispRight,
      }
      this.replaceMain({selectedTx})
      this.showReady = true
      if (this.isShowModal()) {
        this.$root.$emit('bv::show::modal', 'detailModal')
      }
    },
    createBtnBg(pos, shape, bgColor){
      const btnBg = new Shape()
      btnBg.graphics.beginStroke('#ccc').beginFill('#' + bgColor)
      switch(shape) {
      case SHAPE.CIRCLE:
        btnBg.graphics.drawCircle(0, 0, DISP.TX_R)
        break
      case SHAPE.SQUARE:
        btnBg.graphics.drawRect(-DISP.TX_R, -DISP.TX_R, DISP.TX_R * 2, DISP.TX_R * 2)
        break
      case SHAPE.ROUND_SQUARE:
        btnBg.graphics.drawRoundRect(-DISP.TX_R, -DISP.TX_R, DISP.TX_R * 2, DISP.TX_R * 2, DISP.ROUNDRECT_RADIUS)
        break
      }
      if (pos.transparent) {
        btnBg.alpha = 0.6
      }
      return btnBg
    },
    createBtnLabel(pos, color){
      const label = new Text(pos.label)
      label.font = `${DISP.TX_R * this.ICON_FONTSIZE_RATIO}px Arial`
      label.color = '#' + color
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      return label
    },
    createTxBtn(pos, shape, color, bgColor){
      const txBtn = new Container()
      txBtn.addChild(this.createBtnBg(pos, shape, bgColor))
      txBtn.addChild(this.createBtnLabel(pos, color))

      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) => {
        evt.stopPropagation()
        this.showingDetailTime = new Date().getTime()
        const txBtn = evt.currentTarget
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      })
      return txBtn
    },
    disableExbsCheck(){
      // for debug
      const disabledExbs = _.filter(this.exbs, (exb) => !exb.enabled || !exb.location.x || exb.location.y <= 0)
      this.positions().forEach((pos) => {
        const exb = disabledExbs.find((exb) => exb.posId == pos.pos_id)
        if (exb) {
          console.error('Found at disabled exb', pos, exb)
        }
      })
    },
    reShowTx(position){
      if (this.selectedTx.btxId) {
        const tx = this.selectedTx
        const selectedTxPosition = position.find((pos) => pos.btx_id == tx.btxId)
        if (selectedTxPosition) {
          this.showDetail(tx.btxId, selectedTxPosition.x, selectedTxPosition.y)
        }
      }
    },
    reset() {
      this.isShownMapImage = false
      this.resetDetail()
    },
    resetDetail() {
      if (!this.showingDetailTime || new Date().getTime() - this.showingDetailTime > 100) {
        const selectedTx = {}
        this.replaceMain({selectedTx})
      }
    },
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

#map {
  margin: 0 auto;
}

</style>

