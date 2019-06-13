
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { Stage, Bitmap, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { APP, DISP, DEV, APP_SERVICE, EXCLOUD } from '../../sub/constant/config.js'
import { SHAPE, SENSOR, POSITION, TX } from '../../sub/constant/Constants'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ParamHelper from '../../sub/helper/ParamHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as IconHelper from '../../sub/helper/IconHelper'
import * as Util from '../../sub/util/Util'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import reloadmixinVue from './reloadmixin.vue'
import listmixinVue from './listmixin.vue'
import * as mock from '../../assets/mock/mock'

export default {
  mixins: [reloadmixinVue, listmixinVue],
  data() {
    return {
      isShownMapImage: false,
      positionedExb: [],
      positionedTx: [],
      realWidth: null,
      isFirstTime: true,
      showTryCount: 0,
      tempMapFitMobile: DISP.MAP_FIT_MOBILE,
      canvasScale: 1,
      showIconMinWidth: POSITION.SHOW_ICON_MIN_WIDTH,
      reloadSelectedTx: {},
      showReady: false,
      count: 0, // for mock test
      meditagSensors: [],
      showingDetailTime: null,
      defaultDisplay: {
        color: DISP.TX.COLOR,
        bgColor: DISP.TX.BGCOLOR,
        shape: SHAPE.CIRCLE,
      },
      vueSelected: {
        area: null,
        group: null,
        category: null,
        tx: null,
      },
      oldSelectedArea: null,
      areaOptions: [],
      loadComplete: false,
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      preloadThumbnail: new Image(),
    }
  },
  computed: {
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
    selectedGroup: {
      get() { return this.$store.state.main.selectedGroup},
      set(val) { this.replaceMain({'selectedGroup': val})},
    },
    selectedCategory: {
      get() { return this.$store.state.main.selectedCategory},
      set(val) { this.replaceMain({'selectedCategory': val})},
    },
  },
  async created() {
    await StateHelper.load('area')
    this.areaOptions = StateHelper.getOptionsFromState('area', false, true)
    this.vueSelected.area = this.getInitAreaOption(true)
    this.selectedArea = this.getInitAreaOption()
    this.loadComplete = true
    if (this.$route.path.startsWith('/main') || this.$route.path.startsWith('/sum') || this.$route.path.startsWith('/develop/installation')) {
      let timer = 0
      const path = this.$route.path
      let currentWidth = window.innerWidth
      const onResize = () => {
        if (path != this.$route.path) {
          window.removeEventListener('resize', onResize)
          clearTimeout(timer)
          return
        }
        this.icons = {} // リサイズ時にアイコンキャッシュをクリア
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
          this.reset()
          if (this.stage) {
            this.stage.removeAllChildren()
            this.stage.update()
            this.$nextTick(async () => {
              await this.fetchData(null, true)
            })
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
    getInitAreaOption(isVueSelect){
      if(isVueSelect){
        return ParamHelper.getVueSelectData(this.areaOptions, this.selectedArea, !Util.hasValue(this.selectedArea))
      }
      return this.selectedArea? this.selectedArea : Util.hasValue(this.areaOptions)? this.areaOptions[0].value: null
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
    getMapScale(){
      return DISP.TX.R_ABSOLUTE ? this.canvasScale : 1
    },
    async fetchAreaExbs(tx) {
      if (this.isFirstTime) {
        this.selectedArea = this.getInitAreaOption()
        await StateHelper.load('exb')
        if (tx) {
          await StateHelper.load('tx')
        }
        this.isFirstTime = false
      }
    },
    showMapImageDef(callback, disableErrorPopup) {
      if(HtmlUtil.endsWithSlashUrl(this)){
        return
      }
      if(!this.loadComplete){
        setTimeout(() => {
          this.showMapImage && this.showMapImage(disableErrorPopup)
        }, 200)
        return
      }
      this.showTryCount++
      if (this.isShownMapImage) {
        if (callback) {
          setTimeout(() => callback(), 0)
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
          setTimeout(() => callback(), 0)
        }
      }
    },
    calcFitSize(target, parent, top = 82) {
      let parentHeight = document.documentElement.clientHeight - parent.offsetTop - top
      if(parentHeight < DISP.CONTROL.MAP.MIN_HEIGHT){
        parentHeight = DISP.CONTROL.MAP.MIN_HEIGHT
      }
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

      if (this.onMapImageScale) {
        this.onMapImageScale()
      }
      return result
    },
    drawMapImage(bg) {
      const canvas = this.$refs.map
      if (!canvas) {
        return
      }

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
      
      this.mapWidth = bg.width
      this.mapHeight = bg.height
      this.isShownMapImage = true
      const parent = document.getElementById('map').parentElement
      const size = this.calcFitSize(bg, parent)
      this.canvasScale = size.width / bg.width

      // キャンバスのサイズを画像サイズに合わせる
      canvas.width = bg.width
      canvas.height = bg.height

      // cssで表示サイズを設定する
      canvas.style.width = String(size.width) + 'px'
      canvas.style.height = String(size.height) + 'px'

      this.stage = new Stage('map')
      this.stage.canvas = canvas
      this.stage.mouseEnabled = true
      if (Touch.isSupported()) {
        Touch.enable(this.stage)
      }

      const bitmap = new Bitmap(bg)
      bitmap.scaleY = bitmap.scaleX = 1
      bitmap.width = canvas.width
      bitmap.height = canvas.height
      this.stage.addChild(bitmap)

      this.stage.update() 
      this.bitmap = bitmap
      this.oldSelectedArea = this.selectedArea

      if(this.onMapLoaded){
        setTimeout(() => {
          this.onMapLoaded(size)
        }, 500)
      }
    },
    async changeArea(val) {
      if (val) {
        this.icons = {} // キャッシュをクリア
        await StateHelper.loadAreaImage(val)
        const area = _.find(this.areas, (area) => {
          return area.areaId == val
        })
        if (this.getMapImage(area.areaId)) {
          if(!Util.getValue(this, 'selectedTx.btxId', null)){
            this.reset()
          }
          this.selectedArea = val
          this.fetchData && await this.fetchData()
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
      if (!this.keepExbPosition) {
        nokeep(exb)
      }
    },
    replaceTx(tx, nokeep) {
      if (!this.keepTxPosition) {
        nokeep(tx)
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
          grpHit = groupId == tx.groupId
        } else {
          grpHit = true
        }
        if (categoryId) {
          catHit = categoryId == tx.categoryId
        } else {
          catHit = true
        }
        return grpHit && catHit
      }).value()
    },
    isMagnetOn(magnet) {
      return magnet && magnet.magnet === SENSOR.MAGNET_STATUS.ON
    },
    async storePositionHistory(count, allShow = false, fixSize = false){
      const pMock = DEV.USE_MOCK_EXC? mock.positions[count]: null
      let positions = []
      if (APP.POS.USE_POSITION_HISTORY) {
        // Serverで計算された位置情報を得る
        positions = await EXCloudHelper.fetchPositionHistory(this.exbs, this.txs, allShow, pMock)
        this.replaceMain({positionHistores: positions})
      } else {
        // 移動平均数分のポジションデータを保持する
        positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock, allShow)
        this.pushOrgPositions(positions)
      }
      // 検知状態の取得
      PositionHelper.setDetectState(positions, APP.POS.USE_POSITION_HISTORY)
      // 在席表示と同じ、表示txを取得する。
      positions = this.getShowTxPositions(positions, allShow)
      // スタイルをセット
      positions = this.setPositionStyle(positions, fixSize)
      if (APP.POS.USE_POSITION_HISTORY) {
        this.replaceMain({positionHistores: positions})
      } else {
        this.replaceMain({orgPositions: []})
        this.pushOrgPositions(positions)
      }
      return positions
    },
    getShowTxPositions(positions, allShow = false){
      const now = !DEV.USE_MOCK_EXC ? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval
      const correctPositions = APP.POS.USE_POSITION_HISTORY? this.positionHistores: PositionHelper.correctPosId(this.orgPositions, now)
      return _(positions)
        .filter((pos) => allShow || (pos.tx && Util.bitON(pos.tx.disp, TX.DISP.POS)))
        .map((pos) => {
          let cPos = _.find(correctPositions, (cPos) => pos.btx_id == cPos.btx_id)
          if (cPos || allShow) {
            return {
              ...pos,
              transparent: !cPos? true: cPos.transparent? cPos.transparent: PositionHelper.isTransparent(cPos.timestamp, now),
              isLost: !cPos? true: PositionHelper.isLost(cPos.timestamp, now)
            }
          }
          return null
        }).compact().value()
    },
    setPositionStyle(positions, fixSize = false){
      return _.map(positions, pos => {
        // 設定により、カテゴリとグループのどちらの設定で表示するかが変わる。
        let display
        if (pos.tx) {
          const styleSrc = pos.tx[DISP.TX.DISPLAY_PRIORITY[0]] || pos.tx[DISP.TX.DISPLAY_PRIORITY[1]]
          display = styleSrc && styleSrc.display
        }
        display = display || this.defaultDisplay
        display = this.getStyleDisplay1({...display, label: pos.label}, {fixSize: fixSize})        
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
      const catOrGr = tx[DISP.TX.DISPLAY_PRIORITY[0]] || tx[DISP.TX.DISPLAY_PRIORITY[1]]
      const display = catOrGr && catOrGr.display || {}
      return {
        color: Util.addPrefix(display.color || DISP.TX.COLOR, '#'),
        bgColor: Util.addPrefix(display.bgColor || DISP.TX.BGCOLOR, '#'),
        shape: display.shape || SHAPE.CIRCLE
      }
    },
    getFinalReceiveTime (time) {
      return Util.formatDate(time)
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
    getPositions(showAllTime = false) {
      let positions = []
      if (APP.POS.USE_POSITION_HISTORY) {
        positions = this.positionHistores
      } else {
        const now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
        positions = showAllTime ?
          this.orgPositions.filter((pos) => Array.isArray(pos)).flatMap((pos) => pos) :
          PositionHelper.correctPosId(this.orgPositions, now)
      }
      if (APP.SENSOR.USE_MEDITAG && this.meditagSensors) {
        positions = SensorHelper.setStress(positions, this.meditagSensors)
      }
      return showAllTime ? positions : this.positionFilter(positions, this.selectedGroup, this.selectedCategory)
    },
    showDetail(btxId, x, y) {
      //const tipOffsetY = 15
      const tx = this.txs.find((tx) => tx.btxId == btxId)
      const display = this.getDisplay(tx)
      const map = HtmlUtil.getRect('#map')
      const containerParent = HtmlUtil.getRect('#mapContainer', 'parentNode')
      const offsetX = map.left - containerParent.left + (!this.isInstallation ? 0 : 48)
      //const offsetY = map.top - containerParent.top + (!this.isInstallation ? 0 : 20)
      const isDispRight = x + offsetX + 100 < window.innerWidth
      const popupHeight = this.getMeditagSensor(btxId) ? DISP.TXMEDITAG_POPUP_SIZE : DISP.TXSENSOR_POPUP_SIZE
      // isAbove === trueの場合、ポップアップを下に表示
      // 上にあるときは下向きに表示する
      const isAbove = map.top + y < popupHeight + DISP.TX.R / this.canvasScale
      const offsetY = isAbove ? popupHeight : 0

      const position = this.getPositions().find((e) => {
        return e.btx_id === btxId
      })

      const balloonClass = !btxId ? '': 'balloon' + (isAbove ? '-b': '-u')
      // サムネイル表示無しの設定になっているか？
      const isNoThumbnail = APP.TXDETAIL.NO_UNREGIST_THUMB ? !tx.existThumbnail : false
      const setupSelectedTx = (isDispThumbnail) => {
        const selectedTx = {
          btxId,
          minor: 'minor:' + btxId,
          major: tx.major? 'major:' + tx.major : '',
          // TX詳細ポップアップ内部で表示座標計算する際に必要
          orgLeft: x * this.canvasScale + offsetX,
          orgTop: y * this.canvasScale + offsetY,
          isAbove: isAbove,
          scale: DISP.TX.R_ABSOLUTE ? 1.0 : this.canvasScale,
          containerWidth: containerParent.width,
          containerHeight: containerParent.height,
          class: balloonClass,
          name: tx.potName ? tx.potName : '',
          tel: tx.extValue ? tx.extValue.tel ? tx.extValue.tel : '': '',
          timestamp: position ? this.getFinalReceiveTime(position.timestamp) : '',
          thumbnail: isDispThumbnail ? this.preloadThumbnail.src : '',
          category: tx.categoryName? tx.categoryName : '',
          group: tx.groupName? tx.groupName : '',
          bgColor: display.bgColor,
          color: display.color,
          isDispRight: isDispRight,
        }
        this.replaceMain({selectedTx})
        this.$nextTick(() => this.showReady = true)
        if (this.isShowModal()) {
          this.$root.$emit('bv::show::modal', 'detailModal')
        }
      }

      if (!isNoThumbnail) {
        // サムネイル表示あり
        this.preloadThumbnail.onload = () => setupSelectedTx(true)
        this.preloadThumbnail.src = tx.existThumbnail ? this.thumbnailUrl.replace('{id}', tx.potId) : '/default.png'
      } else {
        // サムネイル表示無し
        setupSelectedTx(false)
      }

    },
    createLabelInfo(pos, color){
      return {
        label: pos.label,
        color: color,
      }
    },
    createRectInfo(pos, bgColor){
      let strokeAlpha = 1
      let fillAlpha = 1
      if (Util.bitON(pos.tx.disp, TX.DISP.ALWAYS)) {
        // 常時表示時
        fillAlpha = pos.isLost? DISP.TX.LOST_ALPHA: pos.transparent? DISP.TX.ALPHA: fillAlpha
      } else if (pos.transparent) {
        // 通常の離席時
        strokeAlpha = DISP.TX.ALPHA
        fillAlpha = DISP.TX.ALPHA
      }
      return {
        bgColor: ViewHelper.getRGBA(bgColor, fillAlpha),
        strokeColor: ViewHelper.getRGBA(DISP.TX.STROKE_COLOR, strokeAlpha)
      }
    },
    createTxIcon(pos, shape, color, bgColor){
      const rectInfo = this.createRectInfo(pos, bgColor)
      const labelInfo = this.createLabelInfo(pos, color)
      const txRadius = DISP.TX.R / this.getMapScale()
      return IconHelper.createIcon(
        labelInfo.label, txRadius, txRadius, labelInfo.color, rectInfo.bgColor, {
          circle: shape == SHAPE.CIRCLE,
          roundRect: shape == SHAPE.SQUARE? 0: DISP.TX.ROUNDRECT_RADIUS,
          strokeColor: rectInfo.strokeColor,
          strokeStyle: DISP.TX.STROKE_WIDTH,
          offsetY: 5,
        })
    },
    createTxBtn(pos, shape, color, bgColor){
      const txBtn = this.createTxIcon(pos, shape, color, bgColor)

      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) => {
        evt.stopPropagation()
        this.showReady = false
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
          const x = location && location.x != null? location.x : selectedTxPosition.x
          const y = location && location.y != null? location.y : selectedTxPosition.y
          this.showDetail(tx.btxId, x, y)
        }
      }
    },
    reset() {
      this.isShownMapImage = false
      this.resetDetail()
      if(this.onReset){
        this.onReset()
      }
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
        this.showExb(exb)
      })
      this.keepExbPosition = false
    },
    getPositionedExb(sensorFilterFunc, findSensorFunc, showSensorFunc, allArea){
      this.positionedExb = _(this.exbs).filter((exb) => {
        return exb.location && (allArea || exb.location.areaId == this.selectedArea) && exb.location.x && exb.location.y > 0
      })
        .filter((exb) => sensorFilterFunc? sensorFilterFunc(exb): true)
        .map((exb) => {
          const sensor = findSensorFunc? findSensorFunc(exb): null
          return {
            exbId: exb.exbId, deviceId: exb.deviceId, x: exb.location.x, y: exb.location.y,
            humidity: sensor? sensor.humidity: null,
            temperature: sensor? sensor.temperature: null,
            count: sensor? sensor.count: 0,
            pressVol: sensor? sensor.press_vol: 0,
            sensorId: sensor? sensor.id: null,
            updatetime: sensor? sensor.updatetime? sensor.updatetime: sensor.timestamp: null,
            areaName: exb.areaName,
            locationName: exb.locationName,
            posId: exb.posId,
            deviceIdX: exb.deviceIdX,
            areaId: exb.areaId,
            zoneId: exb.zoneId,
            zoneCategoryId: exb.zoneCategoryId,
            description: exb.description? exb.description: '',
          }
        })
        .filter((exb) => showSensorFunc? showSensorFunc(exb): true)
        .value()
    },
    resetTx() {
      if (this.txCon) {
        this.txCon.removeAllChildren()
      }
      this.positionedTx.forEach((tx) => {
        this.showTx(tx)
      })
      this.keepTxPosition = false
    },
    getPositionedTx(sensorFilterFunc, findSensorFunc, showSensorFunc, allArea, allPosition){
      this.positionedTx = _(this.txs).filter((tx) => {
        return allPosition? true: tx.location && (allArea || tx.location.areaId == this.selectedArea) && tx.location.x && tx.location.y > 0
      })
        .filter((tx) => sensorFilterFunc? sensorFilterFunc(tx): true)
        .map((tx) => {
          const sensor = findSensorFunc? findSensorFunc(tx): null
          return {
            txId: tx.txId, btxId: tx.btxId,
            x: tx.location? tx.location.x: null, y: tx.location? tx.location.y: null,
            humidity: sensor? sensor.humidity: null,
            temperature: sensor? sensor.temperature: null,
            sensorId: sensor? sensor.id: null,
            updatetime: sensor? sensor.updatetime? sensor.updatetime: sensor.timestamp: null,
            areaName: tx.areaName,
            locationName: tx.locationName,
            posId: tx.posId,
            potName: tx.potName,
            sensorName: tx.sensorName,
            major: tx.major,
            minor: tx.minor,
            description: tx.description? tx.description: '',
            high: sensor? sensor.high: null,
            low: sensor? sensor.low: null,
            beat: sensor? sensor.beat: null,
            step: sensor? sensor.step: null,
            down: sensor? sensor.down: null,
            magnet: sensor? sensor.magnet: null,
            areaId: allPosition && sensor? sensor.areaId: tx.areaId,
            zoneId: allPosition && sensor? sensor.zoneId: tx.zoneId,
            zoneCategoryId: allPosition && sensor? sensor.zoneCategoryId: tx.zoneCategoryId,
          }
        })
        .filter((tx) => showSensorFunc? showSensorFunc(tx): true)
        .value()
      return this.positionedTx
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

