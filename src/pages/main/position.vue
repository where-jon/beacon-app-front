<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec" :reload="true" :state="reloadState" :auto-reload="false" :short-name="shortName" :legend-items="legendItems" />
    <b-alert v-model="showDismissibleAlert" variant="danger" dismissible>
      {{ message }}
    </b-alert>
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.area') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.area)">
            <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option, true) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="useGroup" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.group') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.group)">
            <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="useCategory" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.category') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.category)">
            <v-select v-model="vueSelected.category" :options="categoryOptionsForPot" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
              <template slot="no-options">
                {{ vueSelectNoMatchingOptions }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="showDetected" class="my-1 ml-2 ml-sm-0">
          <span class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.detectedCount') + ' : ' }}
          </span>
          <span class="mr-1">
            {{ detectedCount }}
          </span>
        </b-form-row>
        <div v-if="isInstallation">
          <b-form-row class="my-1 ml-2 ml-sm-0">
            <b-form-checkbox v-model="modeRssi" class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.dispRssi') }}
            </b-form-checkbox>
            <b-button class="ml-sm-4 ml-2 mr-1" :pressed.sync="isPause" :variant="theme">
              <font-awesome-icon v-if="!isPause" icon="pause" />
              <span v-if="!isPause">
                &nbsp;{{ $t('label.reload') }}{{ $t('label.pause') }}
              </span>
              <font-awesome-icon v-if="isPause" icon="play" />
              <span v-if="isPause">
                &nbsp;{{ $t('label.reload') }}{{ $t('label.restart') }}
              </span>
            </b-button>
          </b-form-row>
        </div>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas v-if="!showMeditag" id="map" ref="map" @click="closeVueSelect" />
      <b-col v-if="showMeditag">
        <canvas id="map" ref="map" @click="closeVueSelect" />
      </b-col>
      <div v-if="showMeditag && isShowRight && hasMeditagSensors()" class="rightPane">
        <meditag :sensors="meditagSensors" :is-popup="false" class="rightPaneChild" />
      </div>
    </b-row>
    <div v-if="showMeditag && isShowBottom && hasMeditagSensors()" class="rightPane">
      <meditag :sensors="meditagSensors" :is-popup="false" class="rightPaneChild" />
    </div>
    <div v-if="selectedTx.btxId && showReady">
      <txdetail :selected-tx="selectedTx" :selected-sensor="selectedSensor" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Container } from '@createjs/easeljs/dist/easeljs.module'
import { APP, DISP, APP_SERVICE, EXCLOUD } from '../../sub/constant/config'
import { SHAPE, SENSOR, EXTRA_NAV, CATEGORY, TX } from '../../sub/constant/Constants'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as DomUtil from '../../sub/util/DomUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as IconHelper from '../../sub/helper/IconHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as ProhibitHelper from '../../sub/helper/ProhibitHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as StyleHelper from '../../sub/helper/StyleHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/VueSelectHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import meditag from '../../components/parts/meditag.vue'
import txdetail from '../../components/parts/txdetail.vue'

export default {
  components: {
    breadcrumb,
    meditag,
    'txdetail': txdetail,
  },
  mixins: [commonmixin, reloadmixin, showmapmixin],
  props: {
    isInstallation: {
      default: false,
      type: Boolean
    },
  },
  data() {
    return {
      items: !this.isInstallation ? ViewHelper.createBreadCrumbItems('main', 'showPosition') : ViewHelper.createBreadCrumbItems('develop', 'installation'),
      useGroup: MenuHelper.useMaster('group') && APP.POS.WITH.GROUP,
      useCategory: MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY,
      message: '',
      extraNavSpec: EXTRA_NAV,
      detectedCount: 0, // 検知数
      pot: {},
      showMeditag: APP.SENSOR.USE_MEDITAG && !this.isInstallation,
      showDetected: APP.POS.SHOW_DETECTED_COUNT,
      shortName: this.$i18n.tnl('label.showPositionShort'),
      meditagSensors: [],
      legendItems: [],
      noImageErrorKey: 'noMapImage',
      modeRssi: false,
      isPause: false,
      firstTime: true,
      showDismissibleAlert: false,
      prohibitDetectList : null,
      lostUnDetectList : null,
      icons: {},
      txsMap: {},
      exbsMap: {},
      prohibitInterval:null,
      lostInterval:null,
      isShowRight: false,
      isShowBottom: false,
      isMounted: false,
      reloadState: {isLoad: false},
      loadStates: ['category','group','lostZones','tx','exb','absentDisplayZones'],
      toggleCallBack: () => this.reset(),
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      preloadThumbnail: new Image(),
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
    ]),
    ...mapState('app_service', [
      'categories',
      'groups',
      'prohibits',
      'lostZones',
      'absentDisplayZones',
      'txs',
    ]),
    ...mapState([
      'reload',
    ]),
    categoryOptionsForPot() {
      return StateHelper.getOptionsFromState('category', false, true,
        category => CATEGORY.POT_AVAILABLE.includes(category.categoryType)
      )
    },
    selectedSensor() {
      if (this.selectedTx && this.selectedTx.btxId) {
        var ret = this.getMeditagSensor(this.selectedTx.btxId)
      }
      return ret? [ret]: []
    },
    filter() {
      return [this.selectedGroup, this.selectedCategory]
    },
  },
  watch: {
    filter() {
      this.reloadSelectedTx = {}
      this.showTxAll()
    },
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.selectedArea = Util.getValue(newVal, 'value', null)
        if(this.isMounted){
          this.changeArea(this.selectedArea)
        }
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.selectedCategory = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.selectedGroup = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    modeRssi: function(newVal, oldVal) {
      this.$emit('rssi', newVal)
    },
    isPause: function(newVal, oldVal) {
      if (!this.isInstallation) return
      if (newVal) {
        this.stopAutoReload()
        return
      }
      this.startAutoReload()
    },
  },
  async mounted() {
    if (APP.POS.PROHIBIT_ALERT) {
      this.loadStates.push('prohibit')
    }
    await Promise.all(this.loadStates.map(StateHelper.load))
    this.txs.forEach((t) => this.txsMap[t.btxId] = t)
    // ゾーン表示時「・・・」用TXを追加しておく
    this.txsMap[PositionHelper.zoneLastTxId()] = { txId: PositionHelper.zoneLastTxId(), disp: 1, tx: {disp:1}, }
    this.exbs.forEach((e) => this.exbsMap[e.posId] = e)
    // this.fetchData()は'vueSelected.area'をwatchしている箇所で実行している。
    // 以下は二重実行を防ぐためコメントアウト
    // await this.fetchData()
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptionsForPot, this.selectedCategory, false)
    this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, this.selectedGroup, false)
    this.startPositionAutoReload()
    this.startOtherAutoReload()
    this.changeArea(this.selectedArea)
    this.isMounted = true
  },
  beforeDestroy() {
    clearInterval(this.prohibitInterval)  // 点滅クリア
    this.resetDetail()
  },
  methods: {
    async loadLegends () {
      const loadCategory = DISP.TX.DISPLAY_PRIORITY[0] == 'category'
      const magnetCategoryTypes = loadCategory? this.getMagnetCategoryTypes(): this.getMagnetGroupTypes()
      const legendElements = loadCategory? this.getCategoryLegendElements(): this.getGroupLegendElements()
      // console.error(loadCategory, magnetCategoryTypes, legendElements)

      this.legendItems = legendElements.map((legendElement) => ({
        id: legendElement.id,
        items: magnetCategoryTypes.includes(legendElement.id)? [
          { id: 1, text: 'A', style: StyleHelper.getStyleDisplay1(legendElement) },
          { id: 2, text: `${legendElement.name} : ${this.$i18n.tnl('label.using')}`, style: null },
          { id: 3, text: 'A', style: StyleHelper.getStyleDisplay1(legendElement, {reverceColor: true, fixSize: true}) },
          { id: 4, text: `${this.$i18n.tnl('label.notUse')}`, style: {} },
        ]: [
          { id: 1, text: 'A', style: StyleHelper.getStyleDisplay1(legendElement) },
          { id: 2, text: legendElement.name, style: {} },
        ]
      }))
    },
    isShowModal() { // pir, position
      return window.innerWidth < this.showIconMinWidth
    },
    getMagnetCategoryTypes () {
      return this.txs.filter((val) => val.categoryId && val.sensorId == SENSOR.MAGNET)
        .map((val) => val.categoryId)
    },
    getCategoryLegendElements () {
      return this.categories.filter(category => !category.systemUse).map((val) => ({ id: val.categoryId, name: StateHelper.getDispCategoryName(val), ...val,}))
    },
    getMagnetGroupTypes () {
      return this.txs.filter((val) => val.groupId && val.sensorId == SENSOR.MAGNET)
        .map((val) => val.groupId)
    },
    getGroupLegendElements () {
      return this.groups.map((val) => ({id: val.groupId, name: val.groupName, ...val, }))
    },
    hasMeditagSensors () {
      return Util.hasValue(this.meditagSensors)
    },
    async fetchPositionData(payload) {

      let alwaysTxs = this.txs.filter((tx) => {
        return tx.areaId == this.selectedArea && NumberUtil.bitON(tx.disp, TX.DISP.ALWAYS)
      })

      let isAllfetch = alwaysTxs? true: false
      if(!payload.disabledPosition){
        await PositionHelper.storePositionHistory(this.count, isAllfetch)
      }

      if(payload.disabledOther){
        return
      }

      if (APP.SENSOR.USE_MEDITAG) {
        let meditagSensors = await EXCloudHelper.fetchSensor(SENSOR.MEDITAG)
        this.meditagSensors = _(meditagSensors)
          .filter((val) => this.txs.some((tx) => tx.btxId == val.btx_id))
          .map((val) => {
            let tx = this.txs.find((tx) => tx.btxId == val.btx_id)
            let label = tx && tx.displayName? tx.displayName: val.btx_id
            return {...val, label, bg: SensorHelper.getStressBg(val.stress), down: val.down?val.down:0}
          })
          .sortBy((val) => (new Date().getTime() - val.downLatest < APP.SENSOR.MEDITAG.DOWN_RED_TIME)? val.downLatest * -1: val.btx_id)
          .value()
        Util.debug(this.meditagSensors)
      }

      if (APP.SENSOR.USE_MAGNET) {
        this.magnetSensors = await EXCloudHelper.fetchSensor(SENSOR.MAGNET)
        Util.debug(this.magnetSensors)
      }
    },
    async fetchData(payload, disableErrorPopup) {
      this.showReady = false
      const disabledProgress = Util.getValue(payload, 'disabledProgress', false)
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        if(!disabledProgress){
          this.showProgress()
        }
        // mounted()でtxsのloadは実行済みのためコメントアウト
        // if (!this.selectedTx.btxId) {
        //   await StateHelper.load('tx')
        // }
        this.$nextTick(() => {
          this.loadLegends()
        })
        this.showMapImage(disableErrorPopup, payload)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      if(!disabledProgress){
        this.hideProgress()
      }
    },
    async getDetail(txId) {
      let tx = await AppServiceHelper.fetch('/core/tx', txId)
      return tx && tx.pot
    },
    twinkle() {
      Object.values(this.icons).forEach((icon)=>{
        this.prohibitDetectList.some((tx) => tx.minor == icon.txId) ? icon.visible = !icon.visible : icon.visible = true
        this.stage.update()
      })
    },
    showMapImage(disableErrorPopup, payload) {
      const cPayload = {
        disabledPosition: Util.getValue(payload, 'disabledPosition', false),
        disabledOther: Util.getValue(payload, 'disabledOther', false),
        disabledProgress: Util.getValue(payload, 'disabledProgress', false),
      }
      this.showMapImageDef(async () => {
        if(!cPayload.disabledProgress){
          this.showProgress()
        }
        const reloadButton = document.getElementById('spinner')
        if(!this.firstTime && reloadButton){
          this.reloadState.isLoad = true
        }
        await this.fetchPositionData(cPayload)

        this.stage.on('click', (evt) => {
          this.resetDetail()
        })

        if (!this.txCont) {
          this.txCont = new Container()
          this.txCont.width = this.bitmap.width
          this.txCont.height = this.bitmap.height
          this.stage.addChild(this.txCont)
        }
        this.positionedExb = PositionHelper.getPositionedExb(this.selectedArea)

        if (APP.POS.PROHIBIT_ALERT) {
          ProhibitHelper.setProhibitDetect('pos', this)
        }

        this.showTxAll()

        if(!this.firstTime && reloadButton){
          this.reloadState.isLoad = false
        }
        this.firstTime = false
        if(!cPayload.disabledProgress){
          this.hideProgress()
        }
      }, disableErrorPopup)
    },
    onMapLoaded(size){
      if(APP.SENSOR.USE_MEDITAG && this.meditagSensors){
        const parent = document.getElementById('mapContainer')
        const rightPaneWidth = 300
        if(parent.clientWidth - size.width >= rightPaneWidth){
          this.isShowRight = true
          this.isShowBottom = false
        }else{
          this.isShowRight = false
          this.isShowBottom = true
        }
      }
    },
    onReset(){
      this.isShowRight = false
      this.isShowBottom = false      
    },
    showTxAll() {

      if (!this.txCont) {
        return
      }

      this.txCont.removeAllChildren()
      this.disableExbsCheck()
      this.detectedCount = 0 // 検知カウントリセット

      const absentZonePosition = this.setAbsentZoneTx()
      const position = this.setNomalTx()

      this.stage.update()
      this.reShowTx(position)
      this.reShowTx(absentZonePosition)
    },
    setNomalTx() {
      let position = []
      if(!APP.POS.USE_MULTI_POSITIONING){
        const ratio = DISP.TX.R_ABSOLUTE ? 1/this.canvasScale : 1
        position = PositionHelper.adjustPosition(PositionHelper.getPositions(), ratio, this.positionedExb, this.selectedArea)
      }else{
        let area = _.find(this.$store.state.app_service.areas, (area) => area.areaId == this.selectedArea)
        let mapRatio = area.mapRatio
        position = PositionHelper.adjustMultiPosition(PositionHelper.getPositions(), mapRatio)
      }
      if (APP.SENSOR.USE_MEDITAG && this.meditagSensors) { // TODO: 場所OK???
        position = SensorHelper.setStress(position, this.meditagSensors)
      }

      position.forEach((pos) => this.showTx(pos))
      return position
    },
    showTx(pos) {
      const tx = this.txsMap[pos.btx_id]
      const exb = this.exbsMap[pos.pos_id]
      Util.debug('showTx', pos, tx && tx.sensor)
      if (!tx) {
        console.warn('tx not found. btx_id=' + pos.btx_id)
        return
      }
      if (!NumberUtil.bitON(tx.disp, TX.DISP.POS)) {
        Util.debug('tx is not allowed to show', tx)
        return
      }
      if (pos.noSelectedTx && !this.isFixTx(tx)) {
        Util.debug('tx is not allowed to show', tx)
        return
      }
      let magnet = null
      if (tx.sensorId === SENSOR.MAGNET) {
        magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btxid == tx.btxId || sensor.btx_id == tx.btxId)
        Util.debug('magnet', magnet)
      }
      let meditag = null
      if (tx.sensorId === SENSOR.MEDITAG) {
        meditag = this.getMeditagSensor(tx.btxId)
        Util.debug('meditag', meditag)
      }

      const display = this.getDisplay(tx)
      const color = meditag? '#000': this.isMagnetOn(magnet)? display.bgColor : display.color
      const bgColor = meditag? meditag.bg: this.isMagnetOn(magnet)? display.color: display.bgColor
      
      // フリーアドレスTXが不在エリア検知の場合は以降処理を行わない
      if (exb && exb.isAbsentZone && !this.isFixTx(tx)) {
        return
      }

      pos.transparent = ((exb && exb.isAbsentZone || this.isOtherFloorFixTx(tx, exb)) && this.isFixTx(tx))

      // 既に該当btx_idのTXアイコンが作成済みか?
      let txBtn = this.icons[pos.btx_id]
      if (!txBtn) {
        // 作成されていない場合、新規作成してからiconsに登録
        txBtn = this.createTxBtn(pos, display.shape, color, bgColor)
        this.icons[pos.btx_id] = txBtn
      } else {
        // 作成済みの場合、座標値のみセットする
        txBtn.x = pos.x
        txBtn.y = pos.y
      }
      if (this.isFixTx(tx)) {
        Util.debug('fixed location', tx)
        txBtn.x = tx.location.x
        txBtn.y = tx.location.y
      }

      if(this.reloadSelectedTx.btxId == pos.btx_id){
        this.showingDetailTime = new Date().getTime()
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      }
      this.txCont.addChild(txBtn)
      this.detectedCount++  // 検知数カウント増加
    },
    setAbsentZoneTx() {
      const absentDisplayZone = _.find(this.absentDisplayZones, (zone) => { return zone.areaId == this.selectedArea })
      if (!Util.hasValue(absentDisplayZone)) {
        // 不在表示用ゾーンが存在しない場合は何もしない
        return
      }
      const ratio = DISP.TX.R_ABSOLUTE ? 1/this.canvasScale : 1
      let absentZonePositions = PositionHelper.adjustZonePosition(PositionHelper.getPositions(false, true), ratio, this.positionedExb, absentDisplayZone)

      absentZonePositions.forEach((pos) => this.showAbsentZoneTx(pos))
      return absentZonePositions
    },
    showAbsentZoneTx(pos) {
      const tx = this.txsMap[pos.btx_id]
      Util.debug('showTx', pos, tx && tx.sensor)
      if (!tx) {
        console.warn('tx not found. btx_id=' + pos.btx_id)
        return
      }
      let magnet = null
      if (tx.sensorId === SENSOR.MAGNET) {
        magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btxid == tx.btxId || sensor.btx_id == tx.btxId)
        Util.debug('magnet', magnet)
      }
      let meditag = null
      if (tx.sensorId === SENSOR.MEDITAG) {
        meditag = this.getMeditagSensor(tx.btxId)
        Util.debug('meditag', meditag)
      }

      const display = this.getDisplay(tx)
      const color = meditag? '#000': this.isMagnetOn(magnet)? display.bgColor : display.color
      const bgColor = meditag? meditag.bg: this.isMagnetOn(magnet)? display.color: display.bgColor

      // 既に該当btx_idのTXアイコンが作成済みか?
      const zoneBtx_id = PositionHelper.zoneBtxIdAddNumber + pos.btx_id
      let txBtn = this.icons[zoneBtx_id]
      if (!txBtn) {
        // 作成されていない場合、新規作成してからiconsに登録
        if (pos.btx_id == PositionHelper.zoneLastTxId()) {
          txBtn = this.createLastSystemTx(pos, display.shape, color, bgColor)
        } else {
          txBtn = this.createTxBtn(pos, display.shape, color, bgColor, true)
        }
        this.icons[zoneBtx_id] = txBtn
      } else {
        // 作成済みの場合、座標値のみセットする
        txBtn.x = pos.x
        txBtn.y = pos.y
      }

      if(this.reloadSelectedTx.btxId == zoneBtx_id){
        this.showingDetailTime = new Date().getTime()
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      }
      this.txCont.addChild(txBtn)
    },
    createTxBtn(pos, shape, color, bgColor){ // position
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
    createLastSystemTx(pos, shape, color, bgColor){
      const txRadius = DISP.TX.R / this.getMapScale()
      const bgAlpha = 0.01
      const txBtn = IconHelper.createIcon(
        pos.label, txRadius, txRadius, '#000000', ColorUtil.getRGBA('#FFFFFF', bgAlpha), {
          circle: true,
          roundRect: DISP.TX.ROUNDRECT_RADIUS,
          strokeColor: ColorUtil.getRGBA(DISP.TX.STROKE_COLOR, bgAlpha),
          strokeStyle: DISP.TX.STROKE_WIDTH,
          offsetY: 5,
        })
      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      return txBtn
    },
    createRectInfo(pos, bgColor){ // p
      let strokeAlpha = 1
      let fillAlpha = 1
      if (NumberUtil.bitON(pos.tx.disp, TX.DISP.ALWAYS)) {
        // 常時表示時
        fillAlpha = pos.isLost? DISP.TX.LOST_ALPHA: pos.transparent? DISP.TX.ALPHA: fillAlpha
      } else if (pos.transparent) {
        // 通常の離席時
        strokeAlpha = DISP.TX.ALPHA
        fillAlpha = DISP.TX.ALPHA
      }
      return {
        bgColor: ColorUtil.getRGBA(bgColor, fillAlpha),
        strokeColor: ColorUtil.getRGBA(DISP.TX.STROKE_COLOR, strokeAlpha)
      }
    },
    createTxIcon(pos, shape, color, bgColor){ // position
      const rectInfo = this.createRectInfo(pos, bgColor)
      const txRadius = DISP.TX.R / this.getMapScale()
      return IconHelper.createIcon(
        pos.label, txRadius, txRadius, color, rectInfo.bgColor, {
          circle: shape == SHAPE.CIRCLE,
          roundRect: shape == SHAPE.SQUARE? 0: DISP.TX.ROUNDRECT_RADIUS,
          strokeColor: rectInfo.strokeColor,
          strokeStyle: DISP.TX.STROKE_WIDTH,
          offsetY: 5,
        })
    },
    createAbsentTxIcon(pos, shape, color, bgColor){
      const txRadius = DISP.TX.R / this.getMapScale()
      return IconHelper.createIcon(
        pos.label, txRadius, txRadius, color, ColorUtil.getRGBA(bgColor, 1), {
          circle: shape == SHAPE.CIRCLE,
          roundRect: shape == SHAPE.SQUARE? 0: DISP.TX.ROUNDRECT_RADIUS,
          strokeColor: ColorUtil.getRGBA(DISP.TX.STROKE_COLOR, 1),
          strokeStyle: DISP.TX.STROKE_WIDTH,
          offsetY: 5,
        })
    },
    disableExbsCheck(){ // position
      // for debug
      const disabledExbs = {}
      _.filter(this.exbs, (exb) => !exb.enabled || !exb.location.x || exb.location.y <= 0).forEach(e => disabledExbs[e.posId] = e)
      PositionHelper.getPositions().forEach((pos) => {
        const exb = disabledExbs[pos.pos_id]
        if (exb) {
          Util.debug('Found at disabled exb', pos, exb)
        }
      })
    },
    reShowTx(position){ // position
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
    showDetail(btxId, x, y) { // (p,) position
      //const tipOffsetY = 15
      const tx = this.txs.find((tx) => tx.btxId == btxId)
      const display = this.getDisplay(tx)
      const map = DomUtil.getRect('#map')
      const containerParent = DomUtil.getRect('#mapContainer', 'parentNode')
      const offsetX = map.left - containerParent.left + (!this.isInstallation ? 0 : 48)
      //const offsetY = map.top - containerParent.top + (!this.isInstallation ? 0 : 20)
      const isDispRight = x + offsetX + 100 < window.innerWidth
      const popupHeight = this.getMeditagSensor(btxId) ? DISP.TXMEDITAG_POPUP_SIZE : DISP.TXSENSOR_POPUP_SIZE
      // isAbove === trueの場合、ポップアップを下に表示
      // 上にあるときは下向きに表示する
      const isAbove = map.top + y < popupHeight + DISP.TX.R / this.canvasScale
      const offsetY = isAbove ? popupHeight : 0

      const position = PositionHelper.getPositions().find((e) => {
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
          timestamp: position ? this.getFinalReceiveTime(new Date(position.timestamp)) : '',
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
    getFinalReceiveTime (time) { // position
      return DateUtil.formatDate(time)
    },
    getDisplay(tx) { // (p,) position
      const catOrGr = tx[DISP.TX.DISPLAY_PRIORITY[0]] || tx[DISP.TX.DISPLAY_PRIORITY[1]]
      const display = catOrGr && catOrGr.display || {}
      return {
        color: StringUtil.addPrefix(display.color || DISP.TX.COLOR, '#'),
        bgColor: StringUtil.addPrefix(display.bgColor || DISP.TX.BGCOLOR, '#'),
        shape: display.shape || SHAPE.CIRCLE
      }
    },
    getMeditagSensor(btxId) { // (p,) position
      if (this.meditagSensors) {
        return this.meditagSensors.find((val) => btxId == val.btx_id)
      }
      return null
    },
    isMagnetOn(magnet) { // position
      return magnet && magnet.magnet === SENSOR.MAGNET_STATUS.ON
    },
    touchEnd (evt) {
      if (evt.target.id === 'map') {
        return
      }
      this.resetDetail()
    },
    isFixTx (tx) {
      return tx && tx.location && tx.location.areaId == this.selectedArea && tx.location.x * tx.location.y > 0
    },
    isOtherFloorFixTx (tx, exb) {
      return tx && tx.location && exb && exb.location && tx.location.areaId != exb.location.areaId && tx.location.x * tx.location.y > 0
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";
@import "../../sub/constant/browser.scss";
@import "../../sub/constant/vue.scss";

$right-pane-width-px: $right-pane-width * 1px;
$right-pane-maxwidth-px: ($right-pane-width + 100) * 1px;
$right-pane-left-px: $right-pane-left * 1px;

.rightPane {
  max-width: $right-pane-maxwidth-px;
  margin: 10px;
  padding: 3px;
  width: $right-pane-width-px;
  min-width: $right-pane-width-px;
  overflow-x: scroll;
  overflow-y: scroll;
  -ms-overflow-x: auto;
  -ms-overflow-y: auto;
  @media (min-width: 769px) {
    height: calc(100vh - 100px);
  }
  @media (max-width: 768px) {
    height: calc(70vh - 100px);
  }
}

.rightPaneChild {
  @extend .rightPane;
}

@media all and (-ms-high-contrast: none){
  .rightPaneChild {
    height: calc(100vh - 140px);
  }
}

</style>
