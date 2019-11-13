<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :extra-nav-spec="pExtraNavList" :short-name="shortName" :reload="!pAnalysis" :state="reloadState" :auto-reload="!pSplitAutoReload" :legend-items="legendItems" />
    <alert v-if="pAnalysis" :message="message" />
    <span v-else-if="pThermohWarn">
      <alert :warn-message="warnMessage" :fix="fixHeight" force-no-close :alert-style="alertStyle" />
    </span>
    <span v-else>
      <alert v-model="showDismissibleAlert" :message="message" :fix="fixHeight" :prohibit="showDismissibleAlert" :prohibit-view="isProhibitView" :alert-style="alertStyle" />
    </span>

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
        <div v-for="(item, index) in pFilterList" :key="'filter-' + index">
          <b-form-row v-if="isUseFilter(item)" class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.' + item) }}
            </label>
            <span :title="vueSelectTitle(vueSelected[item])">
              <v-select v-model="vueSelected[item]" :options="getFilterOptions(item)" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </div>
        <div v-for="(item, index) in pExtraFilterList" :key="'extraFilter-' + index">
          <b-form-row v-if="item == 'datetime'" class="my-1 ml-2 ml-sm-0">
            <b-form-row class="ml-sm-4 ml-2 mr-1">
              <label v-t="'label.historyDateFrom'" class="mr-2" />
              <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="mr-2 inputdatefrom" required @change="changeDatetimeFrom" />
            </b-form-row>
            <b-form-row class="mr-1">
              <label v-t="'label.historyDateTo'" class="mr-2" />
              <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="mr-2 inputdateto" required />
            </b-form-row>
          </b-form-row>
          <b-form-row v-else-if="item == 'freeWord'" class="my-1 ml-2 ml-sm-0">
            <b-form-row class="ml-sm-4 ml-2 mr-1">
              <label v-t="'label.filter'" class="mr-2" />
              <b-input-group>
                <input v-model="selectedFreeWord" class="form-control align-self-center" :maxlength="maxFilterLength">
                <b-input-group-append>
                  <b-btn v-t="'label.clear'" :disabled="!selectedFreeWord" variant="secondary" class="align-self-center" @click="selectedFreeWord = ''" />
                </b-input-group-append>
              </b-input-group>
            </b-form-row>
          </b-form-row>
          <b-form-row v-else class="my-1 ml-2 ml-sm-0">
            <label class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.' + item) }}
            </label>
            <span :title="vueSelectTitle(vueSelected[item])">
              <v-select v-model="vueSelected[item]" :options="getExtraFilterOptions(item)" class="ml-1 mr-2 vue-options" :style="vueSelectStyle">
                <template slot="selected-option" slot-scope="option">
                  {{ vueSelectCutOn(option) }}
                </template>
                <template slot="no-options">
                  {{ vueSelectNoMatchingOptions }}
                </template>
              </v-select>
            </span>
          </b-form-row>
        </div>
        <b-form-row v-if="pChangeableHeatmap" class="my-1 ml-2 ml-sm-4">
          <b-form-row>
            <b-form-checkbox v-model="isHeatmap" :value="true" :unchecked-value="false">
              {{ $t('label.showHeatmap') }}
            </b-form-checkbox>
          </b-form-row>
        </b-form-row>
        <b-form-row v-if="isUseDetailFilter()" class="my-1 ml-2 ml-sm-0">
          <detail-filter save-filter @detailFilter="onDetailFilter" />
        </b-form-row>
        <b-form-row v-if="pShowDetected" class="my-1 ml-2 ml-sm-4">
          <span class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.detectedCount') + ' : ' }}
          </span>
          <span class="mr-1">
            {{ detectedCount }}
          </span>
        </b-form-row>
        <b-form-row v-if="pAnalysis" class="my-1 ml-2 ml-sm-0">
          <b-form-row class="ml-sm-4 ml-2 mr-1">
            <b-button v-t="'label.display'" :variant="theme" @click="analyseData" />
          </b-form-row>
        </b-form-row>
        <div v-if="pInstallation">
          <b-form-row class="my-1 ml-2 ml-sm-0">
            <b-form-checkbox v-model="modeRssi" class="ml-sm-4 ml-2 mr-1">
              {{ $t('label.dispRssi') }}
            </b-form-checkbox>
            <b-button v-if="isPause" class="ml-sm-4 ml-2 mr-1" :pressed.sync="isPause" :variant="theme">
              <font-awesome-icon icon="play" />
              <span>
                &nbsp;{{ $t('label.reload') }}{{ $t('label.restart') }}
              </span>
            </b-button>
            <b-button v-else class="ml-sm-4 ml-2 mr-1" :pressed.sync="isPause" :variant="theme">
              <font-awesome-icon icon="pause" />
              <span>
                &nbsp;{{ $t('label.reload') }}{{ $t('label.pause') }}
              </span>
            </b-button>
          </b-form-row>
        </div>
      </b-form>
    </b-row>

    <b-row v-if="pQuantity" class="mt-2">
      <b-form>
        <b-form-row class="ml-sm-4 ml-2 mr-1">
          <b-button-group>
            <b-button v-t="'label.individualTx'" :variant="theme" :class="isQuantity? 'mb-2': 'mb-2 legend-button-active'" @click="changeIconsIndividual"/> 
            <b-button v-t="'label.quantity'" :variant="theme" :class="isQuantity? 'mb-2 legend-button-active': 'mb-2'" @click="changeIconsQuantity" /> 
          </b-button-group>
        </b-form-row>
      </b-form>
    </b-row>

    <b-row class="mt-3">
      <canvas v-if="!showMeditag" v-show="isLoading || !isHeatmap" id="map" ref="map" @click="closeVueSelect" />
      <b-col v-if="showMeditag" v-show="isLoading || !isHeatmap">
        <canvas id="map" ref="map" @click="closeVueSelect" class="floatLeft mr-5" />
        <div v-if="isShowRight && hasMeditagSensors()" class="rightPane">
          <meditag :sensors="sensorMap.meditag" :is-popup="false" class="rightPaneChild" />
        </div>
      </b-col>
      <div class="control-line" />
      <div v-if="pShowHeatmap" v-show="isLoading || isHeatmap" id="heatmap" ref="heatmap" class="mx-auto" />
    </b-row>

    <div v-if="showMeditag && isShowBottom && hasMeditagSensors()" class="rightPane">
      <meditag :sensors="sensorMap.meditag" :is-popup="false" class="rightPaneChild" />
    </div>
    <div v-if="selectedTx.btxId && showReady">
      <txdetail :selected-tx="selectedTx" :selected-sensor="selectedSensor" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
    </div>

    <b-modal v-model="isShownChart" :title="chartTitle" size="lg" header-bg-variant="light" hide-footer>
      <b-container fluid style="height:350px;">
        <b-row class="mb-1">
          <b-col cols="12">
            <canvas id="dayChart" width="450" height="200" />
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <tool-tip id="toolTip" :tool-tip-show="toolTipShow" :tool-tip-label="toolTipLabel" :tool-tip-style="toolTipStyle" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { APP, DISP, DEV, APP_SERVICE, EXCLOUD } from '../../sub/constant/config'
import { SENSOR, TX, CATEGORY, SHAPE } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as ColorUtil from '../../sub/util/ColorUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as DomUtil from '../../sub/util/DomUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as VueUtil from '../../sub/util/VueUtil'
import * as AnalysisHelper from '../../sub/helper/domain/AnalysisHelper'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as HeatmapHelper from '../../sub/helper/ui/HeatmapHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as IconHelper from '../../sub/helper/ui/IconHelper'
import * as MessageHelper from '../../sub/helper/domain/MessageHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../sub/helper/ui/StyleHelper'
import * as TooltipHelper from '../../sub/helper/domain/TooltipHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import alert from '../../components/parts/alert.vue'
import detailFilter from '../../components/parts/detailFilter.vue'
import meditag from '../../components/parts/meditag.vue'
import ToolTip from '../../components/parts/toolTip.vue'
import txdetail from '../../components/parts/txdetail.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
    detailFilter,
    meditag,
    ToolTip,
    txdetail,
  },
  mixins: [commonmixin, reloadmixin, showmapmixin],
  props: {
    // common : ブレッドクラム情報
    pCaptionList: {
      type: Array,
      required: true,
    },
    // Txアイコンを表示するセンサーID
    pShowTxSensorIds: {
      type: Array,
      default: () => [],
    },
    // EXBアイコンを表示するセンサーID
    // ※pir画面のマグネットTxはEXBアイコンとして扱っている
    pShowExbSensorIds: {
      type: Array,
      default: () => [],
    },
    // Tx,EXBアイコンにセンサ情報をマージし、追加機能を付与するセンサーID
    pMergeSensorIds: {
      type: Array,
      default: () => [],
    },
    // Txをクリックした場合、ポップアップを出す
    pShowDetail: {
      type: Boolean,
      default: false,
    },
    // 画面右部にMEDiTAG一覧を表示する
    pShowMeditagList: {
      type: Boolean,
      default: false,
    },
    // 検知数を表示
    pShowDetected: {
      type: Boolean,
      default: false,
    },
    // installation : 設置支援
    pInstallation: {
      type: Boolean,
      default: false,
    },
    // analysis : 分析画面用の画面処理にする
    pAnalysis: {
      type: Boolean,
      default: false,
    },
    // analysis : 「個人」絞り込みを有効にする
    pAnalysisIndividual: {
      type: Boolean,
      default: false,
    },
    // ブレッドクラムに表示するサブメニュー一覧
    pExtraNavList: {
      type: Array,
      default: () => [],
    },
    // 禁止区域を使用
    pShowProhibit: {
      type: Boolean,
      default: false,
    },
    // 持ち出し検知を使用
    pShowLost: {
      type: Boolean,
      default: false,
    },
    // 不在区域を使用
    pShowAbsent: {
      type: Boolean,
      default: false,
    },
    // 初期状態をヒートマップにする
    pDefaultHeatmap: {
      type: Boolean,
      default: false,
    },
    // 通常マップとヒートマップを切り替える機能を付与する
    pChangeableHeatmap: {
      type: Boolean,
      default: false,
    },
    // ヒートマップを使用する
    pShowHeatmap: {
      type: Boolean,
      default: false,
    },
    // マスタによる絞込み
    pFilterList: {
      type: Array,
      default: () => [],
    },
    // マスタ以外による絞り込み
    pExtraFilterList: {
      type: Array,
      default: () => [],
    },
    // ブレッドクラムのサブメニュー現在地
    pShortName: {
      type: String,
      default: '',
    },
    // センサ情報と位置情報の自動リロードを別々に行う
    pSplitAutoReload: {
      type: Boolean,
      default: false,
    },
    // プラグインによる詳細絞込みを行う
    pUsePluginFilter: {
      type: Boolean,
      default: false,
    },
    // 温湿度アラートを使用する
    pThermohWarn: {
      type: Boolean,
      default: false,
    },
    // 固定座席Txのみ使用する
    pOnlyFixTx: {
      type: Boolean,
      default: false,
    },
    // 絞込み結果を無視する。※絞込みを使用しないメイン画面（温湿度）も絞込み結果が反映されているための措置
    pDisabledFilter: {
      type: Boolean,
      default: false,
    },
    // 数量表示を使用する
    pQuantity: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      items: ViewHelper.createBreadCrumbItems(...this.pCaptionList),
      message: '',
      showMeditag: this.pShowMeditagList && !this.pInstallation,
      shortName: Util.hasValue(this.pShortName)? this.$i18n.tnl('label.' + this.pShortName): '',
      reloadState: {isLoad: false, initialize: false, prevent: false}, // isLoad:ロード中 initialize:画面初期化時にロードする prevent:ユーザ操作によるリロード中に自動リロードしない措置
      firstTime: true, // 画面初期化後の初回処理判定
      isShowRight: false, // MEDiTAG一覧表示位置
      isShowBottom: false,
      isMounted: false, // mountメソッド通過後
      modeRssi: false,
      isPause: false,
      isHeatmap: this.pDefaultHeatmap,
      isLoading: false,
      noImageErrorKey: 'noMapImage',
      loadStates: ['sensor', 'category', 'group', 'tx', 'exb', 'location', 'pot', 'absentDisplayZones'],
      detectedCount: 0,
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.POT_THUMBNAIL_URL,
      keepExbPosition: false,
      preloadThumbnail: new Image(),
      positions: [],
      toggleCallBack: () => this.reset(),
      // 分析用の検索条件
      form: {
        datetimeFrom: null,
        datetimeTo: null,
        potId: null,
      },
      // アイコン情報
      icons: {},
      exbIcons: [],
      txIcons: [],
      // リスト→map変換
      txsMap: {},
      locationsMap: {},
      potsMap: {},
      sensorMap: {},
      positionedExbMap: {},
      positionedTxMap: {},
      // 凡例
      legendItems: null,
      // 検知
      isProhibitView: true,
      prohibitDetectList: null,
      lostUnDetectList: null,
      showDismissibleAlert: false,
      prohibitInterval: null,
      lostInterval: null,
      // 温湿度
      isShownChart: false, // 温湿度モーダル表示
      iconTicker: null,
      iconInterval: 100,
      warnMessage: null,
      iconAlphaMin: 0.1, // 透過度が0の場合はクリック不可のため
      fixHeight: DISP.THERMOH.ALERT_FIX_HEIGHT,
      chartTitle: '',
      // 数量表示
      locationPersonList: {},
      locationObjectList: {},
      locationOtherList: {},
      isQuantity: false,
      // ツールチップ
      toolTipShow: false,
      toolTipLabel: '',
      toolTipStyle: {
        'left': null,
        'top': null,
        'border-color': DISP.THERMOH.TOOLTIP_BORDERCOLOR,
        'border-radius': '' + DISP.THERMOH.TOOLTIP_ROUNDRECT + 'px',
        'font': DISP.THERMOH.TOOLTIP_FONT,
        'background-color': DISP.THERMOH.TOOLTIP_BGCOLOR,
        'color': DISP.THERMOH.TOOLTIP_COLOR,
      },
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
      'locations',
      'pots',
    ]),
    ...mapState([
      'reload',
    ]),
    alertStyle(){
      return { 'font-weight': DISP.THERMOH.ALERT_WEIGHT }
    },
    selectedSensor() {
      if (!Util.getValue(this.selectedTx, 'btxId', null)) {
        return []
      }
      const ret = SensorHelper.getSensorFromBtxId('meditag', this.positionedTxMap.meditag, this.selectedTx.btxId)
      return ret? [ret]: []
    },
    maxFilterLength() {
      return 1000
    },
    filter() {
      return this.pFilterList
        .concat(this.isUseDetailFilter()? 'detail': null)
        .concat(this.pExtraFilterList)
        .filter(val => val)
        .map(pFilter => this[StringUtil.concatCamel('selected', pFilter)])
    },
  },
  watch: {
    filter() {
      this.reloadSelectedTx = {}
      if(this.stage){
        this.showTxAll()
        this.stage.update()
      }
    },
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.selectedArea = Util.getValue(newVal, 'value', null)
        if(this.isMounted && this.selectedArea != null){
          this.changeArea(this.selectedArea)
        }
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.selectedCategory = Util.getValue(newVal, 'value', null)
        if(Util.hasValue(this.form.potId) && Util.getValue(this.potsMap[this.form.potId], 'categoryId', null) != this.selectedCategory){
          this.vueSelected.individual = null
        }
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.selectedGroup = Util.getValue(newVal, 'value', null)
        if(Util.hasValue(this.form.potId) && Util.getValue(this.potsMap[this.form.potId], 'groupId', null) != this.selectedGroup){
          this.vueSelected.individual = null
        }
      },
      deep: true,
    },
    'vueSelected.individual': {
      handler: function(newVal, oldVal){
        this.form.potId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    modeRssi: function(newVal, oldVal) {
      this.$emit('rssi', newVal)
    },
    isPause: function(newVal, oldVal) {
      if (!this.pInstallation){
        return
      }
      newVal? this.stopAutoReload(): this.startAutoReload()
    },
  },
  async mounted() {
    if (this.pShowProhibit) {
      this.loadStates.push('prohibit')
    }
    if (this.pShowLost) {
      this.loadStates.push('lostZones')
    }
    await Promise.all(this.loadStates.map(state => StateHelper.load(state)))
    this.txs.forEach(t => this.txsMap[t.btxId] = t)
    // ゾーン表示時「・・・」用TXを追加しておく
    this.txsMap[PositionHelper.zoneLastTxId()] = { txId: PositionHelper.zoneLastTxId(), disp: 1, tx: {disp: 1} }
    this.locations.forEach(l => {
      if(Util.hasValue(l.posId)){
        this.locationsMap[l.posId] = l
      }
    })
    this.pots.forEach(e => this.potsMap[e.potId] = e)
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions, this.selectedCategory, false)
    this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, this.selectedGroup, false)
    if(this.pSplitAutoReload){
      this.startPositionAutoReload()
      this.startOtherAutoReload()
    }
    this.changeArea(this.selectedArea)
    document.addEventListener('touchstart', this.touchEnd)
    // Canvas内クリックからの伝搬を止める
    document.getElementById('map').addEventListener('click', function(e) {
      e.stopPropagation()
    })
    ViewHelper.importElementUI()
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {
      [APP.ANALYSIS.DATETIME_DEFAULT_UNIT]: -1 * APP.ANALYSIS.DATETIME_DEFAULT
    })
    this.form.datetimeTo = DateUtil.getDatetime(date)
    this.isMounted = true
  },
  beforeDestroy() {
    clearInterval(this.prohibitInterval)  // 点滅クリア
    document.removeEventListener('touchstart', this.touchEnd)
    this.resetDetail()
    this.removeTick()
  },
  methods: {
    // 検索項目の使用判定
    isUseFilter(masterName){
      return MenuHelper.useMaster(masterName) && ArrayUtil.includesIgnoreCase(APP.POT.WITH, masterName)
    },
    isUseDetailFilter(){
      return this.pUsePluginFilter
    },
    getMapScale(){ // p, pir
      return DISP.TX.R_ABSOLUTE? this.canvasScale: 1
    },
    getFilterOptions(masterName){
      return this[masterName + 'Options'] // commonmixin参照
    },
    getExtraFilterOptions(masterName){
      const getFunc = this[StringUtil.concatCamel('get', masterName, 'options')]
      if(masterName == 'individual'){
        return getFunc(this.selectedCategory, this.selectedGroup)
      }
      return getFunc()
    },
    touchEnd (evt) {
      if (evt.target.id === 'map') {
        return
      }
      this.resetDetail()
    },
    isShowModal() { // pir, position
      return BrowserUtil.isResponsiveMode()
    },
    hasMeditagSensors () {
      return Util.hasValue(this.positionedTxMap.meditag)
    },
    iconMouseOver(event){
      if(this.pQuantity){
        this.createTooltip(event, event.target.parent)
      }else if(APP.SENSOR.USE_THERMOH_TOOLTIP){
        this.createThermoTooltip(event, event.target.parent)
      }
    },
    iconMouseOut(){
      if(this.pQuantity){
        this.removeTooltip()
      }else if(APP.SENSOR.USE_THERMOH_TOOLTIP){
        this.removeThermoTooltip()
      }
    },
    // 数量ツールチップ情報作成
    createTooltipInfo(nativeEvent, container){
      const pageElement = document.getElementById('bd-page')
      return {
        fontSize: StyleHelper.getFont2Size(DISP.TX_NUM.TOOLTIP_FONT),
        locationName: this.$i18n.tnl('label.locationName') + ':' + container.locationName,
        locationTypeName: this.$i18n.tnl('label.locationTypeName') + ':' + container.locationTypeName,
        baseX: window.pageXOffset + nativeEvent.clientX - Util.getValue(pageElement, 'offsetLeft', 0),
        baseY: window.pageYOffset + nativeEvent.clientY - Util.getValue(pageElement, 'offsetTop', 0),
        isDispRight: container.x * 2 <= this.stage.canvas.width,
      }
    },
    // 数量ツールチップ表示
    createTooltip(event, container) {
      const tooltipInfo = this.createTooltipInfo(event.nativeEvent, container)
      this.toolTipLabel = [tooltipInfo.locationName, tooltipInfo.locationTypeName]
      this.toolTipShow = true
      this.$nextTick(() => {
        const toolTipElement = document.getElementById('toolTipComponent')
        const left = tooltipInfo.baseX + (tooltipInfo.isDispRight? 8: -1 * Util.getValue(toolTipElement, 'clientWidth', 0) - 4)
        const top = tooltipInfo.baseY - Util.getValue(toolTipElement, 'clientHeight', 0) - 4
        this.toolTipStyle = this.createTooltipSetting(true)
        this.toolTipStyle.left = '' + left + 'px'
        this.toolTipStyle.top = '' + top + 'px'
      })
    },
    // 数量ツールチップ非表示
    removeTooltip() {
      this.toolTipShow = false
      this.toolTipStyle.left = null
      this.toolTipStyle.top = null
    },
    getLocationTypeOptions(locationType) {
      return Util.getValue(OptionHelper.getLocationTypeOptions().find(val => val.value == locationType), 'text', '')
    },
    // true;数量の設定 false:温湿度の設定
    createTooltipSetting(isQuantity) {
      return isQuantity? {
        'left': null,
        'top': null,
        'border-color': DISP.TX_NUM.TOOLTIP_BORDERCOLOR,
        'border-radius': '' + DISP.TX_NUM.TOOLTIP_ROUNDRECT + 'px',
        'font': DISP.TX_NUM.TOOLTIP_FONT,
        'background-color': DISP.TX_NUM.TOOLTIP_BGCOLOR,
        'color': DISP.TX_NUM.TOOLTIP_COLOR,
      }: {
        'left': null,
        'top': null,
        'border-color': DISP.THERMOH.TOOLTIP_BORDERCOLOR,
        'border-radius': '' + DISP.THERMOH.TOOLTIP_ROUNDRECT + 'px',
        'font': DISP.THERMOH.TOOLTIP_FONT,
        'background-color': DISP.THERMOH.TOOLTIP_BGCOLOR,
        'color': DISP.THERMOH.TOOLTIP_COLOR,
      }
    },
    // 温湿度ツールチップ非表示
    removeThermoTooltip() {
      this.toolTipShow = false
      this.toolTipStyle.left = null
      this.toolTipStyle.top = null
    },
    // 温湿度ツールチップ表示
    createThermoTooltip(event, container) {
      const tooltipInfo = TooltipHelper.createThermoTooltipInfo(event.nativeEvent, container, this.stage)

      this.toolTipLabel = [tooltipInfo.sensorName, tooltipInfo.temperature, tooltipInfo.humidity, tooltipInfo.description, tooltipInfo.date]
      this.toolTipShow = true
      this.$nextTick(() => {
        const toolTipElement = document.getElementById('toolTipComponent')
        const left = tooltipInfo.baseX + (tooltipInfo.isDispRight? 8: -1 * Util.getValue(toolTipElement, 'clientWidth', 0) - 4)
        const top = tooltipInfo.baseY - Util.getValue(toolTipElement, 'clientHeight', 0) - 4
        this.toolTipStyle = this.createTooltipSetting(false)
        this.toolTipStyle.left = '' + left + 'px'
        this.toolTipStyle.top = '' + top + 'px'
      })
    },
    // 温湿度アイコン点滅開始
    addTick(){
      this.removeTick()
      this.iconTicker = setInterval(this.iconTick, this.iconInterval)
    },
    // 温湿度アイコン点滅終了
    removeTick(){
      if(this.iconTicker){
        clearInterval(this.iconTicker)
        this.iconTicker = null
      }
    },
    // 温湿度アイコン点滅
    iconTick() {
      const allIcons = [this.exbIcons, this.txIcons]
      allIcons.forEach(icons => {
        icons.forEach(icon => {
          if(!Util.hasValue(Util.getValue(icon, 'config.flash', null))){
            return
          }
          const per = this.iconInterval * 2 / icon.config.flash
          icon.button.alpha += icon.sign * per
          if(icon.button.alpha < this.iconAlphaMin){
            icon.button.alpha = this.iconAlphaMin
            icon.sign *= -1
          }
          if(icon.button.alpha > 1){
            icon.button.alpha = 1
            icon.sign *= -1
          }
        })
      })
      this.stage.update()
    },
    // 温湿度モーダル
    showChart(device, sensorData) {
      SensorHelper.showThermoHumidityChart('dayChart', sensorData.data)
      this.isShownChart = true
      this.chartTitle = this.$i18n.tnl('message.monthDayTemperature', {
        month: sensorData.month,
        day: sensorData.day,
        name: device.potName? device.potName: device.locationName? device.locationName: '',
        description: device.description? ` : ${StringUtil.cutOnLong(device.description, 10)}`: ''
      })
    },
    // 分析用検索日付の自動入力
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      this.form.datetimeTo = newVal? DateUtil.getDatetime(newVal, {minutes: APP.ANALYSIS.DATETIME_INTERVAL}): null
    },
    async refreshTxInfo(){
      await StateHelper.load('tx', true)
      this.txsMap = {}
      this.txs.forEach(t => this.txsMap[t.btxId] = t)
    },
    // Txアイコンを選択した場合のポップアップ
    setupSelectedTx (tx, x, y, isDispThumbnail) {
      const map = DomUtil.getRect('#map')
      const containerParent = DomUtil.getRect('#mapContainer', 'parentNode')
      const offsetX = map.left - containerParent.left + (!this.pInstallation? 0: 48)
      const navbarY = containerParent.top
      const offsetY = map.top - navbarY + (!this.pInstallation? 0: 20)

      const selectedTx = PositionHelper.createTxDetailInfo(x, y, tx, this.canvasScale, {x: offsetX, y: offsetY}, containerParent, isDispThumbnail? this.preloadThumbnail: {})
      this.replaceMain({ selectedTx })
      this.$nextTick(() => this.showReady = true)
      if (this.isShowModal()) {
        this.$root.$emit('bv::show::modal', 'detailModal')
      }
    },
    showDetail(btxId, x, y) {
      // アラート表示でずれるので遅延実行を行う
      this.$nextTick(() => this.showDetailImp(btxId, x, y))
    },
    showDetailImp(btxId, x, y) { // (p,) position
      if(!Util.hasValue(this.pShowDetail)){
        return
      }
      // 地図エリアとゾーン表示で重複しているTXIDの場合、元のTXIDを取得する
      if (PositionHelper.isDoubleTx(btxId)) {
        btxId = PositionHelper.getDoubleDefaultTxId(btxId)
      }
      const tx = this.txsMap[btxId]

      // サムネイル表示無しの設定になっているか？
      const isNoThumbnail = APP.TXDETAIL.NO_UNREGIST_THUMB? !tx.existThumbnail: false
      if (!isNoThumbnail) {
        // サムネイル表示あり
        this.preloadThumbnail.onload = () => this.setupSelectedTx(tx, x, y, true)
        this.preloadThumbnail.src = null // iOSでonloadが一度しか呼ばれないので対策
        this.preloadThumbnail.src = tx.existThumbnail? this.thumbnailUrl.replace('{id}', tx.potId): '/default.png'
      } else {
        // サムネイル表示無し
        this.setupSelectedTx(tx, x, y, false)
      }
    },
    txOnClick(evt){
      evt.stopPropagation()
      this.showReady = false
      const txBtn = evt.currentTarget
      this.showDetail(txBtn.btxId, txBtn.x, txBtn.y)
    },
    updateTxBtn(pos, tx, meditag, magnet){
      const display = StyleHelper.getPositionDisplay(tx)
      const color = PositionHelper.getTxIconColor(display, meditag, magnet)
      const bgColor = PositionHelper.getTxIconBgColor(display, meditag, magnet)

      if(SensorHelper.includesSensorId(this.pMergeSensorIds, SENSOR.TEMPERATURE) && tx.sensorId == SENSOR.TEMPERATURE){
        const ret = IconHelper.createThermohIcon(tx, this.getMapScale(), this.stage)
        ret.txId = tx.txId
        ret.x = pos.x
        ret.y = pos.y
        ret.on('mouseover', this.iconMouseOver)
        ret.on('mouseout', this.iconMouseOut)
        ret.on('click', async evt => this.showChart(tx, await SensorHelper.getTodayThermoHumidityInfo(tx.txId, false)))
        return ret
      }
      // 既に該当btx_idのTXアイコンが作成済みか?
      let txBtn = this.icons[pos.btx_id]
      if (!txBtn || txBtn.color != color || txBtn.bgColor != bgColor || txBtn.transparent != pos.transparent) {
        // 作成されていない場合、新規作成してからiconsに登録
        txBtn = IconHelper.createTxBtn(pos, display.shape, color, bgColor, this.getMapScale())
        txBtn.on('click', evt => this.txOnClick(evt))
        this.icons[pos.btx_id] = txBtn
      } else {
        // 作成済みの場合、座標値のみセットする
        txBtn.x = pos.x
        txBtn.y = pos.y
      }
      if (PositionHelper.isFixTx(tx, this.selectedArea)) {
        Util.debug('fixed location', tx)
        txBtn.x = tx.location.x
        txBtn.y = tx.location.y
      }
      return txBtn
    },
    updateZoneTxBtn(pos, tx, meditag, magnet){
      const display = StyleHelper.getPositionDisplay(tx)
      const color = PositionHelper.getTxIconColor(display, meditag, magnet)
      const bgColor = PositionHelper.getTxIconBgColor(display, meditag, magnet)

      // 既に該当btx_idのTXアイコンが作成済みか?
      const zoneBtx_id = PositionHelper.zoneBtxIdAddNumber + pos.btx_id
      let txBtn = this.icons[zoneBtx_id]
      if (!txBtn || txBtn.color != color || txBtn.bgColor != bgColor) {
        // 作成されていない場合、新規作成してからiconsに登録
        if (pos.btx_id == PositionHelper.zoneLastTxId()) {
          txBtn = IconHelper.createLastSystemTx(pos, this.getMapScale())
        } else {
          txBtn = IconHelper.createTxBtn(pos, display.shape, color, bgColor, this.getMapScale(), true)
          txBtn.on('click', evt => this.txOnClick(evt))
        }
        txBtn.color = color
        txBtn.bgColor = bgColor
        this.icons[zoneBtx_id] = txBtn
      } else {
        // 作成済みの場合、座標値のみセットする
        txBtn.x = pos.x
        txBtn.y = pos.y
      }
      return { txBtn, zoneBtx_id }
    },
    setNomalTx() {
      if(!Util.hasValue(this.pShowTxSensorIds)){
        return
      }
      let position = PositionHelper.getPositionsWithAdjust(this.selectedArea, 1 / this.canvasScale, this.pDisabledFilter)
      if (APP.SENSOR.USE_MEDITAG && this.positionedTxMap.meditag) { // TODO: 場所OK???
        position = SensorHelper.setStress(position, this.positionedTxMap.meditag)
      }
      position.forEach(pos => this.showTx(pos))
      return position
    },
    setAbsentZoneTx() {
      if (!this.pShowAbsent) {
        return
      }
      const absentDisplayZone = _.find(this.absentDisplayZones, zone => zone.areaId == this.selectedArea)
      if (!Util.hasValue(absentDisplayZone)) {
        // 不在表示用ゾーンが存在しない場合は何もしない
        return
      }
      const ratio = DISP.TX.R_ABSOLUTE? 1 / this.canvasScale: 1
      const absentZonePositions = PositionHelper.adjustZonePosition(PositionHelper.getPositions(false, true), ratio, this.locations, absentDisplayZone)

      absentZonePositions.forEach(pos => this.showAbsentZoneTx(pos))
      return absentZonePositions
    },
    reShowTxDetail(position, absentPositions){ // position
      if (!this.pShowDetail) {
        return
      }
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
        if (!selectedTxPosition || !selectedTxPosition.tx) {
          return
        }
        const location = PositionHelper.isFixTx(selectedTxPosition.tx)? selectedTxPosition.tx.location: null
        const x = location? location.x: selectedTxPosition.x
        const y = location? location.y: selectedTxPosition.y
        this.showDetail(tx.btxId, x, y)
      }
    },
    showAbsentZoneTx(pos) {
      const tx = this.txsMap[pos.btx_id]
      if(!SensorHelper.includesSensorId(this.pShowTxSensorIds, tx.sensorId) || !this.pShowAbsent){
        return
      }
      if(!PositionHelper.checkTxAllow(pos, tx, this.selectedArea, true)){
        return
      }
      const magnet = tx.sensorId === SENSOR.MAGNET? SensorHelper.getSensorFromBtxId('magnet', this.positionedTxMap.magnet, tx.btxId): null
      const meditag = tx.sensorId === SENSOR.MEDITAG? SensorHelper.getSensorFromBtxId('meditag', this.positionedTxMap.meditag, tx.btxId): null

      const txBtnInfo = this.updateZoneTxBtn(pos, tx, meditag, magnet)
      const txBtn = txBtnInfo.txBtn
      if(this.reloadSelectedTx.btxId == txBtnInfo.zoneBtx_id){
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      }
      this.txCont.addChild(txBtn)
    },
    showTx(pos) {
      let tx = this.txsMap[pos.btx_id]
      if(!SensorHelper.includesSensorId(this.pShowTxSensorIds, tx.sensorId)){
        return
      }
      if(!PositionHelper.checkTxAllow(pos, tx, this.selectedArea, false, this.pOnlyFixTx)){
        return
      }
      if (tx.sensorId === SENSOR.TEMPERATURE && SensorHelper.includesSensorId(this.pMergeSensorIds, SENSOR.TEMPERATURE)) {
        const temperature = SensorHelper.getSensorFromBtxId('temperature', Util.getValue(this, 'positionedTxMap.temperature', []), tx.btxId)
        if(!temperature){
          return null
        }
        tx = Util.merge(Util.merge({}, tx), temperature, ['areaId', 'areaName', 'x', 'y'])
      }
      let magnet = null
      if (tx.sensorId === SENSOR.MAGNET && SensorHelper.includesSensorId(this.pMergeSensorIds, SENSOR.MAGNET)) {
        magnet = SensorHelper.getSensorFromBtxId('magnet', this.positionedTxMap.magnet, tx.btxId)
        if(!magnet){
          return null
        }
      }
      let meditag = null
      if (tx.sensorId === SENSOR.MEDITAG && SensorHelper.includesSensorId(this.pMergeSensorIds, SENSOR.MEDITAG) && APP.SENSOR.USE_MEDITAG) {
        meditag = SensorHelper.getSensorFromBtxId('meditag', this.positionedTxMap.meditag, tx.btxId)
        if(!meditag){
          return null
        }
      }
      // フリーアドレスTXが不在エリア検知の場合は以降処理を行わない
      const isFixTx = PositionHelper.isFixTx(tx, this.selectedArea)
      const isAbsentZone = Util.getValue(pos, 'location.isAbsentZone', false)
      if (isAbsentZone && !isFixTx) {
        return
      }

      pos.transparent = pos.transparent || ((isAbsentZone || PositionHelper.isOtherFloorFixTx(tx, pos.location)) && PositionHelper.isFixTx(tx))
      const txBtn = this.updateTxBtn(pos, tx, meditag, magnet)
      if(this.reloadSelectedTx.btxId == pos.btx_id){
        this.showDetail(txBtn.btxId, txBtn.x, txBtn.y)
      }
      this.txIcons.push({ button: txBtn, device: tx, config: txBtn.iconInfo, sign: -1 })
      this.txCont.addChild(txBtn)
      this.detectedCount++  // 検知数カウント増加
    },
    setQuantityTx() {
      let position = PositionHelper.getPositions()
      const ratio = 1 / this.canvasScale
      position = PositionHelper.adjustPosition(position, ratio, this.locations, this.selectedArea)
      
      position.forEach((pos) => {
        
        const tx = this.txsMap[pos.btx_id]
        let locationKey = pos.location.locationId
        Util.debug('showTx', pos, tx && tx.sensor)
        if (!PositionHelper.checkTxAllow(pos, tx, this.selectedArea, false, this.pOnlyFixTx)){
          return
        }

        // 固定座席の場合、TXが保持している位置に集計する
        if (PositionHelper.isFixTx(tx)) {
          locationKey = pos.tx.location.locationId
        }

        if (tx.potType == CATEGORY.PERSON) {
          let locationVal = this.locationPersonList[locationKey]
          if (!Util.hasValue(locationVal)) {
            this.locationPersonList[locationKey] = 1
          } else {
            this.locationPersonList[locationKey]++
          }
        } else if (tx.potType == CATEGORY.THING) {
          let locationVal = this.locationObjectList[locationKey]
          if (!Util.hasValue(locationVal)) {
            this.locationObjectList[locationKey] = 1
          } else {
            this.locationObjectList[locationKey]++
          }
        } else {
          let locationVal = this.locationOtherList[locationKey]
          if (!Util.hasValue(locationVal)) {
            this.locationOtherList[locationKey] = 1
          } else {
            this.locationOtherList[locationKey]++
          }
        }

        this.detectedCount++  // 検知数カウント増加
      })

      _.filter(this.locations, location => location.areaId == this.selectedArea && location.x != null && location.y != null)
        .forEach(location => {
          let txBtn = this.icons['loc_' + location.locationId]
          txBtn = this.createQuantityTxBtn(location, SHAPE.SQUARE, DISP.TX_NUM.COLOR, DISP.TX_NUM.BGCOLOR)
          txBtn.color = DISP.TX_NUM.COLOR
          txBtn.bgColor = DISP.TX_NUM.BGCOLOR
          txBtn.transparent
          txBtn.cursor = 'pointer'
          this.txCont.addChild(txBtn)
      })
      return position
    },
    createQuantityTxBtn(location, shape, color, bgColor, isAbsent = false){ // position
      let txBtn = this.createQuantityTxIcon(location.locationId, shape, color, bgColor)
      txBtn.btxId = location.locationId

      // ツールチップ作成
      // 場所名
      txBtn.locationName = location.locationName
      // 場所タイプ
      txBtn.locationTypeName = this.getLocationTypeOptions(location.locationType)
      txBtn.on('mouseover', this.iconMouseOver)
      txBtn.on('mouseout', this.iconMouseOut)
      
      this.icons['loc_' + location.locationId] = txBtn

      txBtn.x = location.x
      txBtn.y = location.y
      return txBtn
    },
    createQuantityTxIcon(locationId, shape, color, bgColor){ // position
      const txRadius = DISP.TX_NUM.R / this.getMapScale()
      // 人数
      let locationPerson = this.locationPersonList[locationId]
      if (!NumberUtil.isNumber(locationPerson)) {
        locationPerson = 0
      }
      // 品数
      let locationObject = this.locationObjectList[locationId]
      if (!NumberUtil.isNumber(locationObject)) {
        locationObject = 0
      }
      // その他
      let locationOther = this.locationOtherList[locationId]
      if (!NumberUtil.isNumber(locationOther)) {
        locationOther = 0
      }
      const line = [
        this.$i18n.tnl('label.peopleNum') + locationPerson,
        this.$i18n.tnl('label.objectNum') + locationObject,
        this.$i18n.tnl('label.other') + ':' + locationOther,
      ]
      const label = line.join('\r\n')
      const fontSize = line.map(str => StyleHelper.getFont2Size(StyleHelper.getInRectFontSize(str, txRadius, txRadius))).reduce((a, b) => a < b? a: b)
      return IconHelper.createIcon(
        label, txRadius, txRadius, color, bgColor, {
          circle: shape == SHAPE.CIRCLE,
          roundRect: shape == SHAPE.SQUARE,
          strokeColor: ColorUtil.getRGBA(DISP.TX_NUM.STROKE_COLOR, 4),
          strokeStyle: DISP.TX_NUM.STROKE_WIDTH,
          fontSize: fontSize * 2,
          regY: txRadius / 2,
        })
    },
    changeIconsQuantity(e) {// 数量ボタン押下時の処理
      e.target.blur()
      this.resetDetail()
      if (!this.isQuantity) {
        this.isQuantity = true
        this.locationPersonList = {}
        this.locationObjectList = {}
        this.locationOtherList = {}
        this.showTxAll()
      }
    },
    changeIconsIndividual(e) {// 個別ボタン押下時の処理
      e.target.blur()
      this.resetDetail()
      if (this.isQuantity) {
        this.isQuantity = false
        
        this.showTxAll()
      }
    },
    showTxAll() {
      if(!Util.hasValue(this.pShowTxSensorIds)){
        return
      }
      if (!this.txCont) {
        this.txCont = ViewHelper.addContainerOnStage(this.stage, this.bitmap.width, this.bitmap.height)
      }
      this.txCont.removeAllChildren()
      PositionHelper.disableLocationsCheck(this.locations)
      this.detectedCount = 0

      const absentZonePosition = this.pShowAbsent? this.setAbsentZoneTx(): []

      // 数量ボタン押下時
      if (this.isQuantity){
        const position = this.setQuantityTx()
        this.positions = position
        this.stage.update()
        this.stage.enableMouseOver()
        this.reShowTxDetail(position, absentZonePosition)
        // パラメータリセット
        this.locationPersonList = {}
        this.locationObjectList = {}
        this.locationOtherList = {}
      } else {
        const position = this.setNomalTx()
        this.positions = position
        this.stage.update()
        this.reShowTxDetail(position, absentZonePosition)
      }
    },
    showExb(exb) {
      const icon = IconHelper.createExbIcon(exb, this.pShowExbSensorIds, this.getMapScale(), this.stage)
      if(!icon){
        return
      }
      if(SensorHelper.includesSensorId(this.pMergeSensorIds, SENSOR.TEMPERATURE) && exb.sensorId == SENSOR.TEMPERATURE){
        icon.on('mouseover', this.iconMouseOver)
        icon.on('mouseout', this.iconMouseOut)
        icon.on('click', async evt => this.showChart(exb, await SensorHelper.getTodayThermoHumidityInfo(exb.exbId, true)))
      }
      this.exbIcons.push({ button: icon, device: exb, config: icon.iconInfo, sign: -1 })
      this.exbCon.addChild(icon)
    },
    showExbTx(tx) {
      const icon = IconHelper.createExbIconForMagnet(tx, this.positionedExbMap.magnet, this.getMapScale())
      if(icon){
        this.exbCon.addChild(icon)
      }
    },
    showExbAll() {
      if(!Util.hasValue(this.pShowExbSensorIds)){
        return
      }
      if (!this.exbCon) {
        this.exbCon = ViewHelper.addContainerOnStage(this.stage, this.bitmap.width, this.bitmap.height)
      }
      this.exbCon.removeAllChildren()
      _.forEach(this.positionedExbMap, exbList => exbList.forEach(exb => this.showExb(exb)))
      this.keepExbPosition = false
      //　表示条件：マグネットセンサ、固定位置登録＆同一エリア、PIR画面表示設定
      if(SensorHelper.includesSensorId(this.pShowExbSensorIds, SENSOR.MAGNET) && APP.SENSOR.SHOW_MAGNET_ON_PIR){
        _(this.txs).filter(tx => tx.sensorId == SENSOR.MAGNET && tx.location && tx.location.x * tx.location.y > 0
          && tx.location.areaId == this.selectedArea && NumberUtil.bitON(tx.disp, TX.DISP.PIR))
          .forEach(tx => this.showExbTx(tx))
      }
    },
    // ポップアップの自動非表示
    resetDetail() { // p, pir, position
      const selectedTx = {}
      this.replaceMain({ selectedTx })
    },
    async fetchPosition(payload){
      if(!payload.disabledOther){
        const sensorObj = await PositionHelper.fetchPositionWithSensor(this.selectedArea, this.pShowTxSensorIds, this.pShowExbSensorIds, this.pMergeSensorIds)
        this.sensorMap = sensorObj.sensorMap
        this.positionedTxMap = sensorObj.positionedTxMap
        this.positionedExbMap = sensorObj.positionedExbMap
      }
      if(!Util.hasValue(this.pShowTxSensorIds)){
        return
      }
      if(!payload.disabledPosition){
        const alwaysTxs = this.txs.some(tx => tx.areaId == this.selectedArea && NumberUtil.bitON(tx.disp, TX.DISP.ALWAYS))
        await PositionHelper.storePositionHistory(this.count, alwaysTxs? true: false)
      }
    },
    // 分析用検索条件のバリデーション
    validate() {
      const enableCategory = this.isUseFilter('category')
      const enableGroup = this.isUseFilter('group')
      const limitMs = APP.ANALYSIS.DATETIME_LIMIT * 24 * 60 * 60 * 1000
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['area'], values: [this.selectedArea]},
        {type: 'require',
          names: [enableCategory? 'category': null, enableGroup? 'group': null, this.pAnalysisIndividual? 'individual': null].filter(val => val),
          values: [enableCategory? this.selectedCategory: null, enableGroup? this.selectedGroup: null, this.pAnalysisIndividual? this.form.potId: null].filter(val => val)},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'less', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime() * -1, this.form.datetimeTo.getTime()], base: limitMs, displayBase: APP.ANALYSIS.DATETIME_LIMIT, equal: true}: null,
      ].filter(val => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
    },
    // 分析用のヒートマップ作成
    createAnalysisHeatmap(){
      const mapSrc = StateHelper.getMapImage(this.getInitAreaOption())
      const refMap = this.$refs.map
      HeatmapHelper.create(this, 'heatmap', mapSrc, (evt, mapElement, map) => {
        map.width = refMap.width
        map.height = refMap.height
        map.style.width = String(refMap.width * this.canvasScale) + 'px'
        map.style.height = String(refMap.height * this.canvasScale) + 'px'
      })
    },
    // 分析用の表示処理
    async analyseData() {
      this.showProgress()
      StateHelper.initShowMessage()
      if (!this.flowLineCont) {
        this.flowLineCont = ViewHelper.addContainerOnStage(this.stage, this.bitmap.width, this.bitmap.height)
      }
      else if(!this.stage.children.some(child => child.id == this.flowLineCont.id)){
        this.stage.addChild(this.flowLineCont)
      }
      this.flowLineCont.removeAllChildren()
      const heatmapContainer = document.getElementById('heatmap')
      HeatmapHelper.drawAnalysisHeatmap(heatmapContainer)
      const errorMessage = this.validate()
      if (Util.hasValue(errorMessage)) {
        this.message = errorMessage
        this.replace({ showAlert: true })
      } else {
        try {
          const result = await AnalysisHelper.sendRequest(this.pCaptionList[this.pCaptionList.length - 1], {
            ...this.form,
            areaId: this.selectedArea,
            categoryId: this.selectedCategory,
            groupId: this.selectedGroup,
          })
          if(Util.hasValue(result.errorMessage)){
            this.message = result.errorMessage
            this.replace({ showAlert: true })
          }
          else{
            AnalysisHelper.analyse(this.flowLineCont, this.form.potId, result.dataList, this.getMapScale())
            HeatmapHelper.drawAnalysisHeatmap(heatmapContainer, result.dataList, this.canvasScale)
          }
          this.stage.update()
        } catch (e) {
          console.error(e)
        }
      }
      this.hideProgress()
    },
    // common
    showMapImage(disableErrorPopup, payload) {
      const cPayload = {
        disabledPosition: Util.getValue(payload, 'disabledPosition', false),
        disabledOther: Util.getValue(payload, 'disabledOther', false),
        disabledProgress: Util.getValue(payload, 'disabledProgress', false),
      }
      this.showMapImageDef(async () => {
        if(this.pAnalysis){
          this.reloadState.prevent = false
          this.createAnalysisHeatmap()
          return
        }
        if(!cPayload.disabledProgress){
          this.showProgress()
        }
        const reloadButton = document.getElementById('spinner')
        if(!this.firstTime && reloadButton){
          this.reloadState.isLoad = true
          await this.refreshTxInfo()
        }
        this.exbIcons = []
        this.txIcons = []
        this.keepExbPosition = false
        await this.fetchPosition(cPayload)
        this.stage.on('click', evt => this.resetDetail())

        this.showExbAll()
        this.showTxAll()

        if(this.pShowHeatmap){
          this.isLoading = true
          SensorHelper.createHeatmap(this,
            { areaId: this.selectedArea, element: this.$refs.map, src: StateHelper.getMapImage(this.getInitAreaOption()), scale: this.canvasScale },
            Util.getValue(this, 'positionedTxMap.temperature', []).concat(Util.getValue(this, 'positionedExbMap.temperature', [])),
            null,
            () => {
              this.isLoading = false
              this.reloadState.prevent = false
            }
          )
        }else{
          this.reloadState.prevent = false
        }

        if (this.pShowProhibit && Util.hasValue(APP.POS.PROHIBIT_GROUPS)) {
          ProhibitHelper.setProhibitDetect('pos', this, this.positions)
          this.replace({ showAlert: this.showDismissibleAlert })
        }

        this.addTick()
        this.warnMessage = MessageHelper.createHumidityWarnMessage(this.txIcons, this.exbIcons)
        this.replace({ showWarn: Util.hasValue(this.warnMessage) })

        this.stage.enableMouseOver()
        this.stage.update()

        if(!this.firstTime && reloadButton){
          this.reloadState.isLoad = false
        }
        this.firstTime = false
        if(!cPayload.disabledProgress){
          this.hideProgress()
        }
      }, disableErrorPopup)
    },
    // common
    async fetchData(payload, disableErrorPopup) {
      this.reloadState.prevent = true
      StateHelper.initShowMessage()
      this.showReady = false
      const disabledProgress = Util.getValue(payload, 'disabledProgress', false)
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({ reload: false })
        if(!disabledProgress){
          this.showProgress()
        }
        VueUtil.nextTickEx(this, () => {
          if(this.$parent.$options.methods && this.$parent.$options.methods.getLegendItems){
            this.legendItems = this.$parent.$options.methods.getLegendItems.call(this.$parent, this)
          }
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
    onMapLoaded(size){
      if(APP.SENSOR.USE_MEDITAG && this.showMeditag){
        const parent = document.getElementById('mapContainer')
        const rightPaneWidth = 300
        this.isShowRight = parent.clientWidth - size.width >= rightPaneWidth
        this.isShowBottom = !this.isShowRight
      }
    },
    onReset(){
      this.isShowRight = false
      this.isShowBottom = false
      this.keepExbPosition = true
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
@import "../../sub/constant/label.scss";
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

.legend-button-active {
  border: none;
  color: #fff;
  background-color: #6c757d !important;
  line-height: 1 !important;
}

</style>
