<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec" :reload="true" :state="reloadState" :auto-reload="false" :short-name="shortName" :legend-items="legendItems" />
    <alert v-model="showDismissibleAlert" :message="message" :fix="fixHeight" :prohibit=showDismissibleAlert :prohibit-view="isProhibitView" :alert-style="alertStyle" />
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
        <b-form-row v-if="useDetailFilter" class="my-1 ml-2 ml-sm-0">
          <detail-filter save-filter @detailFilter="onDetailFilter" />
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
        <canvas id="map" ref="map" @click="closeVueSelect" class="floatLeft mr-5" />
        <div v-if="isShowRight && hasMeditagSensors()" class="rightPane">
          <meditag :sensors="meditagSensors" :is-popup="false" class="rightPaneChild" />
        </div>
      </b-col>
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
import { Container } from 'createjs-module'
import { APP, DISP, APP_SERVICE, EXCLOUD } from '../../sub/constant/config'
import { SHAPE, SENSOR, EXTRA_NAV, CATEGORY, TX } from '../../sub/constant/Constants'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as DomUtil from '../../sub/util/DomUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as VueUtil from '../../sub/util/VueUtil'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as IconHelper from '../../sub/helper/ui/IconHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import detailFilter from '../../components/parts/detailFilter.vue'
import meditag from '../../components/parts/meditag.vue'
import txdetail from '../../components/parts/txdetail.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    detailFilter,
    meditag,
    'txdetail': txdetail,
    alert,
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
      fixHeight: DISP.THERMOH.ALERT_FIX_HEIGHT,
      isProhibitView: true,
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
      locationsMap: {},
      prohibitInterval:null,
      lostInterval:null,
      isShowRight: false,
      isShowBottom: false,
      isMounted: false,
      reloadState: {isLoad: false},
      loadStates: ['category','group','tx', 'exb', 'location', 'absentDisplayZones'],
      toggleCallBack: () => this.reset(),
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      preloadThumbnail: new Image(),
      positions: [],
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
      return [this.selectedGroup, this.selectedCategory, this.selectedDetail]
    },
    alertStyle(){
      return {
        'font-weight': DISP.THERMOH.ALERT_WEIGHT,
      }
    },
    useDetailFilter(){
      return APP.POS.PLUGIN.FILTER
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

    if (APP.POS.LOST_ALERT) {
      this.loadStates.push('lostZones')
    }

    await Promise.all(this.loadStates.map(StateHelper.load))
    this.txs.forEach((t) => this.txsMap[t.btxId] = t)
    // ゾーン表示時「・・・」用TXを追加しておく
    this.txsMap[PositionHelper.zoneLastTxId()] = { txId: PositionHelper.zoneLastTxId(), disp: 1, tx: {disp:1}, }
    this.locations.forEach(l => {
      if(Util.hasValue(l.posId)){
        this.locationsMap[l.posId] = l
      }
    })
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
    loadLegends () {
      if(!['category', 'group'].includes(DISP.TX.DISPLAY_PRIORITY)){
        return
      }
      const loadCategory = DISP.TX.DISPLAY_PRIORITY == 'category'
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
      // デフォルトは常に表示
      const defaultStyle = { shape:SHAPE.CIRCLE, bgColor:DISP.TX.BGCOLOR, color:DISP.TX.COLOR }
      this.legendItems.push({id:0, items:[
        { id: 5, text: 'A', style: StyleHelper.getStyleDisplay1(defaultStyle) },
        { id: 6, text: this.$i18n.tnl('label.defaultOther'), style: {} },
      ]})
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
        this.replace({showAlert: false})
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        if(!disabledProgress){
          this.showProgress()
        }
        // mounted()でtxsのloadは実行済みのためコメントアウト
        // if (!this.selectedTx.btxId) {
        //   await StateHelper.load('tx')
        // }
        VueUtil.nextTickEx(this, () => this.loadLegends())
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
        this.prohibitDetectList.some((tx) => tx.btxId == icon.btxId) ? icon.visible = !icon.visible : icon.visible = true
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
        this.showTxAll()

        if (Util.hasValue(APP.POS.PROHIBIT_ALERT) && Util.hasValue(APP.POS.PROHIBIT_GROUPS)) {
          ProhibitHelper.setProhibitDetect('pos', this, this.positions)
          this.replace({showAlert: this.showDismissibleAlert})
        }

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
      this.disableLocationsCheck()
      this.detectedCount = 0 // 検知カウントリセット

      const absentZonePosition = this.setAbsentZoneTx()
      const position = this.setNomalTx()
      this.positions = position

      this.stage.update()
      this.reShowTxDetail(position, absentZonePosition)
    },
    setNomalTx() {
      let position = PositionHelper.getPositions()
      if(APP.POS.USE_MULTI_POSITIONING){
        // ３点測位はUSE_POSITION_HISTORYには非対応
        position = PositionHelper.adjustMultiPosition(position, this.selectedArea)
      }else{
        const ratio = 1 / this.canvasScale
        position = PositionHelper.adjustPosition(position, ratio, this.locations, this.selectedArea)
      }
      if (APP.SENSOR.USE_MEDITAG && this.meditagSensors) { // TODO: 場所OK???
        position = SensorHelper.setStress(position, this.meditagSensors)
      }
      position.forEach((pos) => this.showTx(pos))
      return position
    },
    showTx(pos) {
      const tx = this.txsMap[pos.btx_id]
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
      const isAbsentZone = Util.getValue(pos, 'location.isAbsentZone', false)
      if (isAbsentZone && !this.isFixTx(tx)) {
        return
      }

      pos.transparent = pos.transparent || ((isAbsentZone || this.isOtherFloorFixTx(tx, pos.location)) && this.isFixTx(tx))

      // 既に該当btx_idのTXアイコンが作成済みか?
      let txBtn = this.icons[pos.btx_id]
      if (!txBtn || txBtn.color != color || txBtn.bgColor != bgColor || txBtn.transparent != pos.transparent) {
        // 作成されていない場合、新規作成してからiconsに登録
        txBtn = this.createTxBtn(pos, display.shape, color, bgColor)
        txBtn.color = color
        txBtn.bgColor = bgColor
        txBtn.transparent
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
        this.showDetail(txBtn.btxId, txBtn.x, txBtn.y)
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
      let absentZonePositions = PositionHelper.adjustZonePosition(PositionHelper.getPositions(false, true), ratio, this.locations, absentDisplayZone)

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
      if (!txBtn || txBtn.color != color || txBtn.bgColor != bgColor) {
        // 作成されていない場合、新規作成してからiconsに登録
        if (pos.btx_id == PositionHelper.zoneLastTxId()) {
          txBtn = this.createLastSystemTx(pos, display.shape, color, bgColor)
        } else {
          txBtn = this.createTxBtn(pos, display.shape, color, bgColor, true)
        }
        txBtn.color = color
        txBtn.bgColor = bgColor
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
    createTxBtn(pos, shape, color, bgColor, isAbsent = false){ // position
      let txBtn = this.createTxIcon(pos, shape, color, bgColor)
      txBtn.btxId = pos.btx_id

      if (isAbsent) {
        txBtn = this.createAbsentTxIcon(pos, shape, color, bgColor)
        txBtn.btxId = PositionHelper.zoneBtxIdAddNumber + pos.btx_id
      }

      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) => {
        evt.stopPropagation()
        this.showReady = false
        this.showingDetailTime = new Date().getTime()
        const txBtn = evt.currentTarget
        this.showDetail(txBtn.btxId, txBtn.x, txBtn.y)
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
          roundRect: shape == SHAPE.SQUARE? 0: DISP.TX.ROUNDRECT_RADIUS / this.getMapScale(),
          strokeColor: rectInfo.strokeColor,
          strokeStyle: DISP.TX.STROKE_WIDTH,
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
        })
    },
    disableLocationsCheck(){ // position
      // for debug
      const disabledLocations = {}
      _.filter(this.locations, location => Util.hasValue(location.posId) && (!location.x || location.y <= 0)).forEach(e => disabledLocations[e.posId] = e)
      PositionHelper.getPositions().forEach((pos) => {
        const location = disabledLocations[pos.pos_id]
        if (location) {
          Util.debug('Found at disabled location', pos, location)
        }
      })
    },
    reShowTxDetail(position, absentPositions){ // position
      if (!this.selectedTx.btxId) {
        return
      }

      const tx = this.selectedTx
      const selectedAbsentTxPosition = _.find(absentPositions, pos => pos.btx_id == tx.btxId)
      // 不在表示用ゾーンに表示されている方を優先して表示する
      if (selectedAbsentTxPosition) {
        this.showDetail(tx.btxId, selectedAbsentTxPosition.x, selectedAbsentTxPosition.y)
      } else {
        const selectedTxPosition = position.find(pos => pos.btx_id == tx.btxId)
        if (selectedTxPosition) {
          if (!selectedTxPosition.tx) {
            return
          }
          const location = this.isFixTx(selectedTxPosition.tx)? selectedTxPosition.tx.location: null
          const x = location? location.x : selectedTxPosition.x
          const y = location? location.y : selectedTxPosition.y
          this.showDetail(tx.btxId, x, y)
        }
      }
    },
    showDetail(btxId, x, y) {
      // アラート表示でずれるので遅延実行を行う
      this.$nextTick(async () => {
        this.showDetailImp(btxId, x, y)
      })
    },
    showDetailImp(btxId, x, y) { // (p,) position
      // 地図エリアとゾーン表示で重複しているTXIDの場合、元のTXIDを取得する
      if (PositionHelper.isDoubleTx(btxId)) {
        btxId = PositionHelper.getDoubleDefaultTxId(btxId)
      }
      const tx = this.txs.find((tx) => tx.btxId == btxId)
      const display = this.getDisplay(tx)
      const map = DomUtil.getRect('#map')
      const containerParent = DomUtil.getRect('#mapContainer', 'parentNode')
      const offsetX = map.left - containerParent.left + (!this.isInstallation ? 0 : 48)
      const isDispRight = x + offsetX + 100 < window.innerWidth
      const navbarY = containerParent.top
      const offsetY = map.top - navbarY + (!this.isInstallation ? 0 : 20)

      const position = PositionHelper.getPositions().find((e) => {
        return e.btx_id === btxId
      })

      const balloonClass = !btxId ? '': 'balloon-u' // 上表示のみに固定
      // サムネイル表示無しの設定になっているか？
      const isNoThumbnail = APP.TXDETAIL.NO_UNREGIST_THUMB ? !tx.existThumbnail : false
      const setupSelectedTx = (isDispThumbnail) => {
        let selectedTx = {
          btxId,
          minor: this.$i18n.tnl('label.minor') + ':' + btxId,
          major: tx.major? this.$i18n.tnl('label.major') + ':' + tx.major : '',
          // TX詳細ポップアップ内部で表示座標計算する際に必要
          orgLeft: x * this.canvasScale + offsetX,
          orgTop: y * this.canvasScale + offsetY,
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
        if(tx.extValue){
          Object.keys(tx.extValue).forEach( key => { selectedTx[key] = this.$i18n.tnl('label.' + key) + ':' + tx.extValue[key] } )
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
        this.preloadThumbnail.src = null // iOSでonloadが一度しか呼ばれないので対策
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
      const display = Util.getValue(tx, DISP.TX.DISPLAY_PRIORITY + '.display', {})
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
    isOtherFloorFixTx (tx, location) {
      return tx && tx.location && location && tx.location.areaId != location.areaId && tx.location.x * tx.location.y > 0
    },
    onDetailFilter(list){
      this.selectedDetail = list
    },
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
  padding: 3px;
  width: $right-pane-width-px;
  min-width: $right-pane-width-px;
  overflow-x: scroll;
  overflow-y: scroll;
  -ms-overflow-x: auto;
  -ms-overflow-y: auto;
  -ms-overflow-style:none;
  @media (min-width: 769px) {
    height: calc(80vh - 100px);
  }
  @media (max-width: 768px) {
    height: calc(70vh - 100px);
  }
}
.rightPane::-webkit-scrollbar {
  display: none;
}

.rightPaneChild {
  @extend .rightPane;
  -ms-overflow-x: hidden;
}

.floatLeft {
  float: left;
}

@media all and (-ms-high-contrast: none){
  .rightPaneChild {
    @media (min-width: 769px) {
      height: calc(80vh - 100px);
    }
    @media (max-width: 768px) {
      height: calc(70vh - 100px);
    }
  }
}

</style>
