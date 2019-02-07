
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { Shape, Container, Stage, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { APP, DISP, DEV } from '../../sub/constant/config.js'
import { SHAPE, SENSOR, POSITION, TX } from '../../sub/constant/Constants'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import reloadmixinVue from './reloadmixin.vue'
import listmixinVue from './listmixin.vue'
import moment from 'moment'
import * as mock from '../../assets/mock/mock'

export default {
  mixins: [reloadmixinVue, listmixinVue],
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
      defaultDisplay: {
        color: DISP.TX_COLOR,
        bgColor: DISP.TX_BGCOLOR,
        shape: SHAPE.CIRCLE,
      },
      oldSelectedArea: null,
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
  async created() {
    if (this.$route.path.startsWith('/main')) {      
      await StateHelper.loadAreaImages()
      let timer = 0
      const path = this.$route.path
      let currentWidth = window.innerWidth
      const onResize = () => {
        if (path != this.$route.path) {
          window.removeEventListener('resize', onResize)
          clearTimeout(timer)
          return
        }
        if (timer > 0) {
          clearTimeout(timer)
        } 
        timer = setTimeout( async () => {
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
            await this.fetchData(null, true)
          }
        }, 200)
      }
      window.addEventListener('resize', onResize)
    }
  },
  mounted() {
    this.oldSelectedArea = this.getInitAreaOption()
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
    getInitAreaOption(){
      const areaOptions = this.areaOptions
      return this.selectedArea? this.selectedArea : Util.hasValue(areaOptions)? areaOptions[0].value: null
    },
    mapImage() {
      this.selectedArea = this.getInitAreaOption()
      const area = _.find(this.areas, (area) => {
        return area.areaId == this.selectedArea
      })
      return area && this.getMapImage(area.areaId)
    },
    getMapImage(areaId) {
      const areaImage = _.find(this.$store.state.app_service.areaImages, (areaImage) => {
        return areaImage.areaId == areaId
      })
      return areaImage && areaImage.mapImage
    },
    async fetchAreaExbs(tx) {
      if (this.isFirstTime) {
        await StateHelper.load('area')
        this.selectedArea = this.getInitAreaOption()
        await StateHelper.loadAreaImage(this.selectedArea)
        console.log('after loadAreas. selectedArea=' + this.selectedArea)
        await StateHelper.load('exb')
        if (tx) {
          await StateHelper.load('tx')
        }
        this.isFirstTime = false
      }
    },
    showMapImageDef(callback, disableErrorPopup) {
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
            this.showMapImage(disableErrorPopup)
          })
        }
        else {
          Util.debug('No mapImage in showMapImageDef.')
          if (this.$route.path.startsWith('/main') && !disableErrorPopup) {
            this.noImageErrorKey && this.loginId && this.showErrorModal({key: this.noImageErrorKey})
          }
        }
        return
      }

      const bg = new Image()
      bg.src = this.mapImage()
      bg.onload = (evt) => {
        this.drawMapImage(bg)
        if (callback) {
          this.$nextTick(() => {
            callback()
          })
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
      const canvas = this.$refs.map
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      const parent = document.getElementById('map').parentElement

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

      const bitmap = new Bitmap(bg)
      bitmap.scaleY = bitmap.scaleX = this.mapImageScale
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update() 
      this.bitmap = bitmap
      this.oldSelectedArea = this.selectedArea
    },
    async changeArea(val) {
      if (val) {
        const area = _.find(this.areas, (area) => {
          return area.areaId == val
        })
        if (this.getMapImage(area.areaId)) {
          this.reset()
          this.selectedArea = val
          await this.fetchData()
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
      if (this.keepExbPosition || this.keepTxPosition) {
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
      let positions = []
      if (APP.USE_POSITION_HISTORY) {
        // Serverで計算された位置情報を得る
        positions = await EXCloudHelper.fetchPositionHistory(this.exbs, this.txs, pMock)
        this.replaceMain({positionHistores: positions})
      } else {
        // 移動平均数分のポジションデータを保持する
        positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock)
        this.pushOrgPositions(positions)
      }
      // 検知状態の取得
      PositionHelper.setDetectState(positions, APP.USE_POSITION_HISTORY)
      // 在席表示と同じ、表示txを取得する。
      positions = this.getShowTxPositions(positions)
      // スタイルをセット
      positions = this.setPositionStyle(positions)
      if (APP.USE_POSITION_HISTORY) {
        this.replaceMain({positionHistores: positions})
      } else {
        this.replaceMain({orgPositions: []})
        this.pushOrgPositions(positions)
      }
      return positions
    },
    getShowTxPositions(positions){
      const now = !DEV.USE_MOCK_EXC ? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval
      const correctPositions = APP.USE_POSITION_HISTORY? this.positionHistores: PositionHelper.correctPosId(this.orgPositions, now)
      return _(positions).filter((pos) => pos.tx && Util.bitON(pos.tx.disp, TX.DISP.POS)).map((pos) => {
        let cPos = _.find(correctPositions, (cPos) => pos.btx_id == cPos.btx_id)
        if (cPos) {
          return {...pos, transparent: cPos.transparent? cPos.transparent: PositionHelper.isTransparent(cPos.timestamp, now)}
        }
        return null
      }).compact().value()
    },
    setPositionStyle(positions){
      return _.map(positions, pos => {
        // 設定により、カテゴリとグループのどちらの設定で表示するかが変わる。
        let display
        if (pos.tx) {
          const styleSrc = pos.tx[DISP.DISPLAY_PRIORITY[0]] || pos.tx[DISP.DISPLAY_PRIORITY[1]]
          display = styleSrc && styleSrc.display
        }
        display = display || this.defaultDisplay
        display = this.getStyleDisplay1(display, {fixSize: false})        
        if (pos.transparent) {
          display.opacity = 0.6
        }
        return {
          ...pos,
          display,
        }
      })
    },
    setPositionedExb(){
      Util.debug('Raw exb', this.exbs, this.selectedArea)
      this.positionedExb = _(_.cloneDeep(this.exbs)).filter((exb) => {
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
    getPositions() {
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
      const p = Util.getValue(tx, 'potTxList.0.pot', {})

      const position = this.getPositions().find((e) => {
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
        name: p.potName ? p.potName : tx.txName? tx.txName: '',
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
      this.getPositions().forEach((pos) => {
        const exb = disabledExbs.find((exb) => exb.posId == pos.pos_id)
        if (exb) {
          console.debug('Found at disabled exb', pos, exb)
        }
      })
    },
    reShowTx(position){
      if (this.selectedTx.btxId) {
        const tx = this.selectedTx
        const selectedTxPosition = position.find((pos) => pos.btx_id == tx.btxId)
        if (selectedTxPosition) {
          const location = selectedTxPosition.tx? selectedTxPosition.tx.location: null
          this.showDetail(tx.btxId, location? location.x * this.mapImageScale: selectedTxPosition.x, location? location.y * this.mapImageScale: selectedTxPosition.y)
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
    resetExb() {
      if (this.exbCon) {
        this.exbCon.removeAllChildren()
      }
      this.positionedExb.forEach((exb) => {
        this.replaceExb(exb, (exb) => {
          exb.x *= this.mapImageScale
          exb.y *= this.mapImageScale
        })
        this.showExb(exb)
      })
      this.keepExbPosition = false
    },
    getPositionedExb(sensorFilterFunc, findSensorFunc, showSensorFunc){
      this.positionedExb = _(this.exbs).filter((exb) => {
        return exb.location && exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
      })
        .filter((exb) => sensorFilterFunc? sensorFilterFunc(exb): true)
        .map((exb) => {
          const sensor = findSensorFunc? findSensorFunc(exb): null
          return {
            exbId: exb.exbId, deviceId: exb.deviceId, x: exb.location.x, y: exb.location.y,
            humidity: sensor? sensor.humidity: null,
            temperature: sensor? sensor.temperature: null,
            count: sensor? sensor.count: 0,
            sensorId: sensor? sensor.id: null
          }
        })
        .filter((exb) => showSensorFunc? showSensorFunc(exb): true)
        .value()
    }
  }
}
</script>

<style lang="scss">
@import "../../sub/constant/config.scss";

#map {
  margin: 0 auto;
}

</style>

