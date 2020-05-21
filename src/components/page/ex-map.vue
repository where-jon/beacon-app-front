<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="breadCrumbs" :extra-nav-spec="pExtraNavList" :short-name="shortName" :reload="!pAnalysis" :state="reloadState" :auto-reload="!pSplitAutoReload" :legend-items="legendItems" :filter-toggle="pFilterToggle" />
    <alert v-if="pAnalysis" :message="message" />
    <span v-else-if="pThermohWarn">
      <alert :warn-message="warnMessage" :fix="fixHeight" force-no-close :alert-style="alertStyle" />
    </span>
    <span v-else>
      <alert v-model="showDismissibleAlert" :message="message" :fix="fixHeight" :prohibit="showDismissibleAlert" :prohibit-view="isProhibitView" :alert-style="alertStyle" />
    </span>

    <b-collapse id="collapse-filter" :visible="filterVisible">
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
    </b-collapse>

    <!-- 個別/数量 -->
    <b-row v-if="pQuantity" id="quantityToggle" class="mt-2">
      <b-form>
        <b-form-row class="ml-sm-4 ml-2 mr-1">
          <b-button-group>
            <b-button v-t="'label.individualTx'" :variant="theme" :class="isQuantity? 'mb-2': 'mb-2 legend-button-active'" @click="changeIconsIndividual" /> 
            <b-button v-t="'label.quantity'" :variant="theme" :class="isQuantity? 'mb-2 legend-button-active': 'mb-2'" @click="changeIconsQuantity" /> 
          </b-button-group>
        </b-form-row>
      </b-form>
    </b-row>

    <b-row class="mt-3">
      <canvas v-if="!showMeditag" v-show="isLoading || !isHeatmap" id="map" ref="map" @click="closeVueSelect" />
      <b-col v-if="showMeditag" v-show="isLoading || !isHeatmap">
        <canvas id="map" ref="map" class="floatLeft mr-5" @click="closeVueSelect" />
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

    <div v-if="pShowToilet && toiletDataList.length > 0 && !isResponsiveMode" v-drag class="lightbox" :style="{top: toiletTop + 'px', height: toiletHeight + 'px'}">
      <toiletview :show-area="false" :data-list="toiletDataList" :small="true" addClass="table-borderless" /><!-- :add-classだと動作しない -->
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
import { Container, Shape, Text } from 'createjs-module'
import 'element-ui/lib/theme-chalk/index.css'
import drag from '@branu-jp/v-drag'
import { SENSOR, TX, POT_TYPE, SHAPE, KEY, SYSTEM_ZONE_CATEGORY_NAME, ALERT_STATE } from '../../sub/constant/Constants'
import { APP, DISP, APP_SERVICE, EXCLOUD } from '../../sub/constant/config'
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
import * as HeatmapHelper from '../../sub/helper/ui/HeatmapHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as IconHelper from '../../sub/helper/ui/IconHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as MessageHelper from '../../sub/helper/domain/MessageHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as TxDetailHelper from '../../sub/helper/domain/TxDetailHelper'
import * as ProhibitHelper from '../../sub/helper/domain/ProhibitHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as ToiletHelper from '../../sub/helper/domain/ToiletHelper'
import * as PotHelper from '../../sub/helper/domain/PotHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../sub/helper/ui/StyleHelper'
import * as TooltipHelper from '../../sub/helper/domain/TooltipHelper'
import * as PlanHelper from '../../sub/helper/domain/PlanHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import alert from '../../components/parts/alert.vue'
import detailFilter from '../../components/parts/detailFilter.vue'
import meditag from '../../components/parts/meditag.vue'
import ToolTip from '../../components/parts/toolTip.vue'
import txdetail from '../../components/parts/txdetail.vue'
import toiletview from '../../components/parts/toiletview.vue'
import moment from 'moment'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
    detailFilter,
    meditag,
    ToolTip,
    txdetail,
    toiletview,
  },
  directives: {
    drag
  },
  mixins: [commonmixin, reloadmixin, showmapmixin],
  props: {
    pShowMRoomStatus: {
      type: Boolean,
      default: false,
    },
    pShowPir: {
      type: Boolean,
      default: false,
    },
    // common : ブレッドクラム情報
    pCaptionList: {
      type: Array,
      required: true,
    },
    // 絞り込みトグルボタン表示
    pFilterToggle: {
      type: Boolean,
      default: false,
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
    // トイレ情報を表示
    pShowToilet: {
      type: Boolean,
      default: false,
    },
    // 進入禁止ゾーン区画を表示
    pShowZone: {
      type: Boolean,
      default: false,
    },
    // ゲストグループのみを表示
    pShowOnlyGuest: {
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
      breadCrumbs: ViewHelper.createBreadCrumbItems(...this.pCaptionList),
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
      // 凡例
      legendItems: null,
      // 検知
      isProhibitView: true,
      prohibitDetectList: null,
      lostUnDetectList: null,
      showDismissibleAlert: false,
      prohibitInterval: null,
      lostInterval: null,
      absentZonePosition: null, // 不在表示ゾーン
      // トイレ
      toiletDataList: [],
      toiletTop: 200,
      toiletHeight: 130,
      // センサー
      sensorMap: {},
      // 温湿度
      isShownChart: false, // 温湿度モーダル表示
      iconTicker: null,
      iconInterval: 100,
      warnMessage: null,
      iconAlphaMin: 0.1, // 透過度が0の場合はクリック不可のため
      fixHeight: DISP.THERMOH.ALERT_FIX_HEIGHT,
      chartTitle: '',
      // 数量表示
      detectCount: {},
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
      'usePositionsCache',
    ]),
    ...mapState([
      'reload',
    ]),
    alertStyle(){
      return { 'font-weight': DISP.THERMOH.ALERT_WEIGHT }
    },
    selectedSensor() {
      if (!Util.getValue(this.selectedTx, 'btxId')) {
        return []
      }
      const ret = SensorHelper.getSensorFromBtxId('meditag', this.sensorMap.meditag, this.selectedTx.btxId)
      return ret? [ret]: []
    },
    filterVisible() { // 絞り込みの表示・非表示（前回の状態を維持）
      const regionId = AuthHelper.getRegionId()
      return !(this.pFilterToggle && LocalStorageHelper.getLocalStorage(KEY.CURRENT.SHOW_FILTER_ON_POSMAP + regionId) === false)
    },
    maxFilterLength() {
      return 1000
    },
    filter() {
      return this.pFilterList
        .concat(this.isUseDetailFilter()? 'detail': null)
        .concat(this.pExtraFilterList)
        .filter(val => val)
        .map(pFilter => {
          const filterName = ArrayUtil.equalsAny(pFilter, ['area', 'group', 'category'])? pFilter + 'Id': pFilter
          return this[StringUtil.concatCamel('selected', filterName)]
        })
    },
  },
  watch: {
    filter() {
      this.reloadSelectedTx = {}
      if(this.stage){
        this.showTxAll()
        this.stage.update()
        this.stage.enableMouseOver()
      }
    },
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.selectedAreaId = Util.getValue(newVal, 'value')
        LocalStorageHelper.setLocalStorage(KEY.CURRENT.AREA, this.selectedAreaId)
        if(this.isMounted && this.selectedAreaId != null){
          this.changeArea(this.selectedAreaId) // ここが処理の起点。this.onChangeAreaDone()が呼ばれ、showMapImage()が呼ばれる
        }
      },
      deep: true,
    },
    'vueSelected.category': {
      handler: function(newVal, oldVal){
        this.selectedCategoryId = Util.getValue(newVal, 'value')
        if(Util.hasValue(this.form.potId) && Util.getValue(this.potIdMap[this.form.potId], 'categoryId') != this.selectedCategoryId){
          this.vueSelected.individual = null
        }
      },
      deep: true,
    },
    'vueSelected.group': {
      handler: function(newVal, oldVal){
        this.selectedGroupId = Util.getValue(newVal, 'value')
        if(Util.hasValue(this.form.potId) && Util.getValue(this.potIdMap[this.form.potId], 'groupId') != this.selectedGroupId){
          this.vueSelected.individual = null
        }
      },
      deep: true,
    },
    'vueSelected.individual': {
      handler: function(newVal, oldVal){
        this.form.potId = Util.getValue(newVal, 'value')
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
    // ゾーン表示時「・・・」用TXを追加しておく
    this.btxIdMap[PositionHelper.zoneLastTxId()] = { txId: PositionHelper.zoneLastTxId(), disp: 1, tx: {disp: 1} }
    this.vueSelected.category = VueSelectHelper.getVueSelectData(this.categoryOptions, this.selectedCategoryId, false)
    this.vueSelected.group = VueSelectHelper.getVueSelectData(this.groupOptions, this.selectedGroupId, false)
    if(this.pSplitAutoReload){
      this.startPositionAutoReload()
      this.startOtherAutoReload()
    }
    // this.changeArea(this.selectedAreaId) 
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
    if(!this.isPause){
      this.stopAutoReload()
    }
  },
  methods: {

    // 共通関数

    hasMeditagSensors() {
      return Util.hasValue(this.sensorMap.meditag)
    },


    // UIイベント

    touchEnd (evt) {
      if (evt.target.id === 'map') {
        return
      }
      this.resetDetail()
    },
    iconMouseOver(event){
      if (this.pShowMRoomStatus) {
        this.createTooltipMRoom(event, event.target.parent)
      } else if (this.pShowPir) {
        this.createTooltipPir(event, event.target.parent)
      } else {
        if(this.pQuantity){
          this.createTooltip(event, event.target.parent)
        }else if(APP.SENSOR.USE_THERMOH_TOOLTIP){
          this.createThermoTooltip(event, event.target.parent)
        }
      }
    },
    iconMouseOut(){
      if (this.pShowMRoomStatus || this.pShowPir) {
        this.removeTooltip()
      } else {
        if(this.pQuantity){
          this.removeTooltip()
        }else if(APP.SENSOR.USE_THERMOH_TOOLTIP){
          this.removeThermoTooltip()
        }
      }
    },

    // フィルタ関係

    switchFilter(e) { // フィルタの表示切り替えでマップのリサイズをする。
      const isShownNow = document.getElementById('collapse-filter').className.includes('show')
      const regionId = AuthHelper.getRegionId()
      LocalStorageHelper.setLocalStorage(KEY.CURRENT.SHOW_FILTER_ON_POSMAP + regionId, !isShownNow)
      if (this.onResize) {
        this.onResize()
      }
    },
    isUseFilter(masterName){ // 検索項目の使用判定
      return MenuHelper.useMaster(masterName) && ArrayUtil.includesIgnoreCase(APP.POT.WITH, masterName)
    },
    isUseDetailFilter(){
      return this.pUsePluginFilter
    },
    getMapScale(){ // p, pir
      return DISP.TX.R_ABSOLUTE? this.canvasScale: 1
    },
    getFilterOptions(masterName){
      if (masterName == 'group' && this.pShowOnlyGuest) { // 来客アクセス管理の場合、グループのプルダウンの中身を設定されているグループのみにする
        return APP.POS.GUEST_GROUP_CD_LIST.map(groupCd => {
          const group = this.groups.find(group => group.groupCd == groupCd)
          if (group) {
            return this.groupOptions.find(option => option.value == group.groupId)
          }
        }).filter(e => e)
      }
      return this[masterName + 'Options'] // commonmixin参照
    },
    getExtraFilterOptions(masterName){
      const getFunc = this[StringUtil.concatCamel('get', masterName, 'options')]
      if(masterName == 'individual'){
        return getFunc(this.selectedCategoryId, this.selectedGroupId)
      }
      return getFunc()
    },
    onDetailFilter(list){
      this.selectedTxIdList = list
    },
    // 分析用検索日付の自動入力
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      this.form.datetimeTo = newVal? DateUtil.getDatetime(newVal, {minutes: APP.ANALYSIS.DATETIME_INTERVAL}): null
    },



    // マップ表示に関するもの

    async onChangeAreaDone(payload, disableErrorPopup) { // エリア選択完了（マップ画像はStateロード済み）に呼び出される
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
          let legendItems = this.callParentMethod('getLegendItems', this)
          if (legendItems) this.legendItems = legendItems
        })
        // マップ画像の表示
        this.showMapImageDef(async () => {
          this.onMapImageShown(payload) // (測位・センサデータの取得は地図読み込み後)
        }, disableErrorPopup)

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
    async fetchData(payload) { // リロードボタン押下時
      if (!this.bitmap) {
        this.reloadState.isLoad = false
        this.hideProgress()
      }
      else {
        this.onMapImageShown(payload)
      }
    },
    async onMapImageShown(payload) { // canvasへのdrawImageが完了すると呼び出される
      if (!payload) payload = {}

      if(this.pAnalysis){
        this.reloadState.prevent = false
        this.createAnalysisHeatmap()
        return
      }
      if (this.pShowMRoomStatus) {
        await PlanHelper.fetchMRoomPlan(this.selectedAreaId)
      }
      if(!payload.disabledProgress){
        this.showProgress()
      }
      const reloadButton = document.getElementById('spinner')
      if(!this.firstTime && reloadButton){
        this.reloadState.isLoad = true
      }
      this.exbIcons = []
      this.txIcons = []
      this.keepExbPosition = false

      this.sensorMap = await SensorHelper.fetchSensorInfo(this.pMergeSensorIds)
      if (Util.hasValue(this.pShowTxSensorIds) && !payload.disabledPosition){
        const alwaysTxs = this.txs.some(tx => Util.v(tx, 'location.areaId') == this.selectedAreaId && NumberUtil.bitON(tx.disp, TX.DISP.ALWAYS))
        if (this.usePositionsCache) {
          this.replaceMain({usePositionsCache: false})
          const positions = StateHelper.getPositions().filter(pos => PositionHelper.shoudTxShow(pos, false, this.txIdMap, this.locationIdMap))
          StateHelper.setPositions(positions)
        }
        else {
          await PositionHelper.loadPosition(this.count, alwaysTxs, false, this.pShowMRoomStatus)
        }
      }

      if (this.pShowZone) {
        this.showZone() // 進入禁止ゾーンを表示する
      }

      this.showAllMRoom()
      if (Util.hasValue(this.pShowExbSensorIds)) {
        this.showExbAll()
      }
      this.showTxAll()

      if(this.pShowHeatmap){
        this.isLoading = true
        SensorHelper.createHeatmap(this,
          { areaId: this.selectedAreaId, element: this.$refs.map, src: StateHelper.getMapImage(this.getInitAreaOption()), scale: this.canvasScale },
          Util.getValue(this.sensorMap, 'temperature', []),
          null,
          () => {
            this.isLoading = false
            this.reloadState.prevent = false
          }
        )
      }else{
        this.reloadState.prevent = false
      }

      this.loadProhibitDetect() // 非同期実行
      this.showToilet() // 非同期実行

      this.addTick()
      if (this.sensorMap.temperature) {
        this.warnMessage = MessageHelper.createHumidityWarnMessage(this.txIcons, this.exbIcons)
      }
      this.replace({ showWarn: Util.hasValue(this.warnMessage) })

      this.stage.on('click', evt => this.resetDetail())
      this.stage.update()
      this.stage.enableMouseOver()

      if(!this.firstTime && reloadButton){
        this.reloadState.isLoad = false
      }
      this.firstTime = false
      if(!payload.disabledProgress){
        this.hideProgress()
      }
    },
    onMapLoaded(size){ // canvasへの描画完了後に呼び出される
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
    async loadProhibitDetect() {
      if ((this.pShowProhibit || this.pShowLost) && Util.hasValueAny(APP.POS.PROHIBIT_GROUP_ZONE, APP.POS.LOST_GROUP_ZONE)) {
        clearInterval(this.prohibitInterval)  // 点滅クリア
        let alertState = ALERT_STATE.MAP
        if (location.pathname == '/main/guest-access') {
          alertState = ALERT_STATE.GUEST
        }
        Util.merge(this, await ProhibitHelper.loadProhibitDetect(alertState, this.stage, this.icons, this.zones, this.positions, this.pShowProhibit, this.pShowLost))
        this.replace({ showAlert: this.showDismissibleAlert })
        this.reShowTxDetail(this.positions) // アラートが非同期処理なので、ポップアップを再表示する
      }
    },
    async showToilet() { // トイレを表示する
      if (this.pShowToilet) {
        this.toiletDataList = await ToiletHelper.fetchData(this.selectedAreaId)
        if (this.toiletDataList.length < 2) {
          this.toiletHeight = 90
        }
        if (this.pQuantity) {
          this.toiletTop = DomUtil.getRect('#quantityToggle').top - 70
        }
        else {
          this.toiletTop = DomUtil.getRect('#map').top - 60
        }
      }
    },
    showZone() { // ソーン区画を表示する（現在進入禁止のみ表示）
      if (!this.stage.children.some(e => e.name == 'zoneCon') || this.zoneCon.areaId != this.selectedAreaId) {
        this.zoneCon = new Container()
        this.zoneCon.name = 'zoneCon'
        this.zoneCon.areaId = this.selectedAreaId

        const zoneList = this.zones.filter(zone => zone.areaId == this.selectedAreaId && zone.categoryList.some(category => category.categoryName == SYSTEM_ZONE_CATEGORY_NAME.PROHIBIT))
        zoneList.forEach(zone => {
          const shape = new Shape()
          shape.graphics.beginFill(DISP.PROHIBIT.BG_COLOR).drawRect(zone.x, zone.y, zone.w, zone.h) 
          const label = new Text(zone.zoneName)
          label.set({
            font: DISP.PROHIBIT.FONT_SIZE + 'px Arial',
            color: DISP.PROHIBIT.FONT_COLOR,
            textAlign: 'left',
            textBaseline: 'top',
            x: zone.x + 7,
            y: zone.y + 7
          })
          this.zoneCon.addChild(shape, label)
        })
        this.stage.addChild(this.zoneCon)
      }
    },


    // 数量表示関係

    changeIconsQuantity(e) {// 数量ボタン押下時の処理
      e.target.blur()
      this.resetDetail()
      if (!this.isQuantity) {
        this.isQuantity = true
        this.detectCount = {}
        this.showTxAll()
        this.stage.update()
        this.stage.enableMouseOver()
      }
    },
    showQuantityTx(positions) { // 数量アイコン表示
      positions = PositionHelper.calcScreenCoordinates(positions, 1 / this.canvasScale, this.locations, this.selectedAreaId)
      positions.forEach((pos) => {
        if (pos.hasAnother) return // 固定座席でフリー位置で検知されている場合はスキップ
        if (!PositionHelper.checkTxAllow(pos, pos.tx, this.selectedAreaId, false, this.pOnlyFixTx)){
          console.error('notallow')
          return
        }

        // 固定座席の場合、TXが保持している位置に集計 → 変更：同じゾーンにいれば、固定座席位置、そうでない場合はフリー位置で集計
        this.incDetectCount(pos.location.locationId, Util.v(pos, 'tx.pot.potType'))
      })

      _.filter(this.locations, location => location.areaId == this.selectedAreaId && location.x != null && location.y != null)
        .forEach(location => {
          let txBtn = this.icons['loc_' + location.locationId]
          txBtn = this.createQuantityTxBtn(location, SHAPE.SQUARE, DISP.TX_NUM.COLOR, DISP.TX_NUM.BGCOLOR)
          txBtn.color = DISP.TX_NUM.COLOR
          txBtn.bgColor = DISP.TX_NUM.BGCOLOR
          // txBtn.isTransparent // TODO: 値をセットしていない
          txBtn.cursor = 'pointer'
          this.txCont.addChild(txBtn)
        })

      this.positions = positions
      this.reShowTxDetail(positions)
      // パラメータリセット
      this.detectCount = {}
    },
    incDetectCount(locationId, potType) {
      if (!this.detectCount[locationId]) {
        this.detectCount[locationId] = {person: 0, thing:0, other:0}
      }
      switch(potType) {
      case POT_TYPE.PERSON:
        this.detectCount[locationId].person++
        break
      case POT_TYPE.THING:
        this.detectCount[locationId].thing++
        break
      default:
        this.detectCount[locationId].other++
      }
    },
    createQuantityTxBtn(location, shape, color, bgColor, isAbsent = false){ // position
      let txBtn = this.createQuantityTxIcon(location.locationId, shape, color, bgColor)
      txBtn.btxId = location.locationId

      // ツールチップ作成
      // 場所名
      txBtn.locationName = location.locationName
      // 場所タイプ
      txBtn.locationTypeName = Util.getValue(OptionHelper.getLocationTypeOptions().find(val => val.value == location.locationType), 'text', '')
      txBtn.on('mouseover', this.iconMouseOver)
      txBtn.on('mouseout', this.iconMouseOut)
      
      this.icons['loc_' + location.locationId] = txBtn

      txBtn.x = location.x
      txBtn.y = location.y
      return txBtn
    },
    createQuantityTxIcon(locationId, shape, color, bgColor){ // position
      const txRadius = DISP.TX_NUM.R / this.getMapScale()
      const line = [
        this.$i18n.tnl('label.peopleNum') + Util.getValue(this, 'detectCount.'+locationId+'.person', 0),
        this.$i18n.tnl('label.objectNum') + Util.getValue(this, 'detectCount.'+locationId+'.thing', 0),
        this.$i18n.tnl('label.other') + ':' + Util.getValue(this, 'detectCount.'+locationId+'.other', 0),
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

    createTooltipMRoom(event, container) {
      const tooltipInfo = this.createTooltipInfoMRoom(event.nativeEvent, container)
      this.toolTipLabel = [tooltipInfo.zoneName, tooltipInfo.planUserNum, , tooltipInfo.userNum]
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
    createTooltipPir(event, container) {
      const tooltipInfo = this.createTooltipInfoPir(event.nativeEvent, container)
      this.toolTipLabel = [tooltipInfo.sensorName]
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
    createTooltipInfoMRoom(nativeEvent, container){
      const pageElement = document.getElementById('bd-page')
      return {
        fontSize: StyleHelper.getFont2Size(DISP.TX_NUM.TOOLTIP_FONT),
        zoneName: this.$i18n.tnl('label.zoneName') + ':' + container.zoneName,
        planUserNum: this.$i18n.tnl('label.planUserNum') + ':' + container.planUserNum,
        userNum: this.$i18n.tnl('label.userNum') + ':' + container.userNum,
        baseX: window.pageXOffset + nativeEvent.clientX - Util.getValue(pageElement, 'offsetLeft', 0),
        baseY: window.pageYOffset + nativeEvent.clientY - Util.getValue(pageElement, 'offsetTop', 0),
        isDispRight: container.x * 2 <= this.stage.canvas.width,
      }
    },
    createTooltipInfoPir(nativeEvent, container){
      const pageElement = document.getElementById('bd-page')
      return {
        fontSize: StyleHelper.getFont2Size(DISP.TX_NUM.TOOLTIP_FONT),
        sensorName: this.$i18n.tnl('label.sensorName') + ':' + container.sensorName,
        baseX: window.pageXOffset + nativeEvent.clientX - Util.getValue(pageElement, 'offsetLeft', 0),
        baseY: window.pageYOffset + nativeEvent.clientY - Util.getValue(pageElement, 'offsetTop', 0),
        isDispRight: container.x * 2 <= this.stage.canvas.width,
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
    // 数量ツールチップ非表示
    removeTooltip() {
      this.toolTipShow = false
      this.toolTipStyle.left = null
      this.toolTipStyle.top = null
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

    // 温湿度関係

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
          if(!Util.hasValue(Util.getValue(icon, 'config.flash'))){
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
    // 温湿度ツールチップ非表示
    removeThermoTooltip() {
      this.toolTipShow = false
      this.toolTipStyle.left = null
      this.toolTipStyle.top = null
    },


    // TX詳細表示

    txOnClick(evt){
      evt.stopPropagation()
      this.showReady = false
      const txBtn = evt.currentTarget
      this.showDetail(txBtn.btxId, txBtn.x, txBtn.y, txBtn.color, txBtn.bgColor)
    },
    showDetail(btxId, x, y, color, bgColor) {
      // アラート表示でずれるので遅延実行を行う
      this.$nextTick(() => this.showDetailImp(btxId, x, y, color, bgColor))
    },
    showDetailImp(btxId, x, y, color, bgColor) { // (p,) position
      if(!Util.hasValue(this.pShowDetail)){
        return
      }
      // 地図エリアとゾーン表示で重複しているTXIDの場合、元のTXIDを取得する
      if (PositionHelper.isDoubleTx(btxId)) {
        btxId = PositionHelper.getDoubleDefaultTxId(btxId)
      }
      const tx = this.btxIdMap[btxId]

      // サムネイル表示無しの設定になっているか？
      const isNoThumbnail = APP.TXDETAIL.NO_UNREGIST_THUMB && !Util.v(tx, 'pot.existThumbnail')
      if (!isNoThumbnail) {
        // サムネイル表示あり
        this.preloadThumbnail.onload = () => this.setupSelectedTx(tx, x, y, true, color, bgColor)
        this.preloadThumbnail.src = null // iOSでonloadが一度しか呼ばれないので対策
        this.preloadThumbnail.src = PotHelper.getThumbnailUrl(tx, this.thumbnailUrl) 
      } else {
        // サムネイル表示無し
        this.setupSelectedTx(tx, x, y, false, color, bgColor)
      }
    },
    // Txアイコンを選択した場合のポップアップ
    setupSelectedTx(tx, x, y, isDispThumbnail, color, bgColor) {
      const map = DomUtil.getRect('#map')
      const containerParent = DomUtil.getRect('#mapContainer', 'parentNode')
      const offsetX = map.left - containerParent.left + (!this.pInstallation? 0: 48)
      const navbarY = containerParent.top
      const offsetY = map.top - navbarY + (!this.pInstallation? 0: 20)

      const selectedTx = TxDetailHelper.createTxDetailInfo(x, y, color, bgColor, false, tx, this.canvasScale, {x: offsetX, y: offsetY}, containerParent, isDispThumbnail? this.preloadThumbnail: {})
      this.replaceMain({ selectedTx })
      this.$nextTick(() => this.showReady = true)
      if (this.isShowModal()) {
        this.$root.$emit('bv::show::modal', 'detailModal')
      }
    },
    isShowModal() { // pir, position
      return BrowserUtil.isResponsiveMode()
    },
    reShowTxDetail(positions){ // positions
      if (!this.pShowDetail) {
        return
      }
      if (!this.selectedTx.btxId) {
        return
      }

      const tx = this.selectedTx
      const selectedAbsentTxPosition = _.find(this.absentZonePosition, pos => pos.btxId == tx.btxId)
      // 不在表示用ゾーンに表示されている方を優先して表示する
      if (selectedAbsentTxPosition) {
        this.showDetail(tx.btxId, selectedAbsentTxPosition.x, selectedAbsentTxPosition.y)
      } else {
        const pos = positions.find(pos => pos.btxId == tx.btxId)
        if (!pos || !pos.tx) {
          return
        }
        // 固定座席の場合、固定座席ゾーンにいる場合、固定座席の場所に表示し、それ以外は検知された場所で表示
        let loc = pos
        if(pos.isFixedPosition && !pos.inFixedZone){
          // 表示用の場所を検索して見つかれば設定する
          const viewPos = positions.find(pos => pos.btxId == tx.btxId && !pos.isFixedPosition)
          loc = viewPos ? viewPos : pos
        }
        this.showDetail(tx.btxId, loc.x, loc.y)
      }
      this.resetDetail()
    },
    // ポップアップの自動非表示
    resetDetail() { // p, pir, position
      const selectedTx = {}
      this.replaceMain({ selectedTx })
    },


    // Txアイコン表示

    changeIconsIndividual(e) {// 個別ボタン押下時の処理
      e.target.blur()
      this.resetDetail()
      if (this.isQuantity) {
        this.isQuantity = false
        this.showTxAll()
        this.stage.update()
        this.stage.enableMouseOver()
      }
    },
    showTxAll() { // TXアイコン個別表示
      if(!Util.hasValue(this.pShowTxSensorIds) || this.pShowMRoomStatus) {
        return
      }
      if (!this.txCont) {
        this.txCont = ViewHelper.addContainerOnStage(this.stage, this.bitmap.width, this.bitmap.height)
      }
      this.txCont.removeAllChildren()

      // 不在表示用ゾーン
      if (this.pShowAbsent && !this.isQuantity) {
        this.showAbsentZoneTxAll()
      }

      let positions = StateHelper.getPositions()
      if (!this.pInstallation && !this.pShowOnlyGuest) {
        positions = PositionHelper.addFixedPosition(positions, this.locations, this.selectedAreaId) // 固定位置追加
      }
      // 表示Txのフィルタリング
      positions = this.pDisabledFilter?
        PositionHelper.filterPositions(positions, false, undefined, null, null, null):
        PositionHelper.filterPositions(positions)
      if (this.pShowOnlyGuest && !this.selectedGroupId) {
        positions = PositionHelper.filterPositionsOnlyGuest(positions)
      }

      if (this.isQuantity) { // 数量ボタン押下時
        this.showQuantityTx(positions)
      } else { // 個別ボタン押下時
        if (this.pOnlyFixTx && this.sensorMap.temperature) {
          this.sensorMap.temperature.forEach(val => { // サンワセンサーはminorを持たずEXCloud側で測位しないため、仮想的に測位情報を作る（あとの処理で必要なものだけセット）
            if (!positions.some(pos => pos.btxId == val.btxId)) {
              const orgTx = this.txIdMap[val.txId]
              if (orgTx && orgTx.location) {
                const tx = Object.assign({}, orgTx)
                tx.disp = 1
                positions.push({
                  txId: val.txId, btxId: val.btxId, isFixedPosition: true, x: tx.location.x, y: tx.location.y, 
                  location: tx.location, exb: { location: {}}, tx,
                })
              }
            }
          })
        }
        if (Util.hasValue(this.pShowTxSensorIds)) {
          this.showNomalTx(positions)
        }
      }
    },

    // 通常のTX表示
    showNomalTx(positions) {
      // 表示Txの画面上の座標位置の決定
      if(APP.POS.USE_MULTI_POSITIONING){
        // ３点測位はUSE_POSITION_HISTORYには非対応 TODO:要対応
        positions = PositionHelper.calcCoordinatesForMultiPosition(positions, this.selectedAreaId)
      }
      else {
        positions = PositionHelper.calcScreenCoordinates(positions, 1 / this.canvasScale, this.locations, this.selectedAreaId, true)
      }

      if (APP.SENSOR.USE_MEDITAG && this.sensorMap.meditag) { // FIXME: 実装場所移す
        positions = SensorHelper.setStress(positions, this.sensorMap.meditag)
      }

      this.detectedCount = 0
      // Txアイコンを表示する
      const btns = positions.map(pos => this.createBtn(pos)).filter(pos => pos)

      btns.forEach(b => {
        if(b.isFixed){
          this.txCont.addChild(b) // 固定座席、固定ゾーンを先に表示
        }
      })
      btns.some(b => {
        if(!b.isFixed){
          this.txCont.addChild(b)
        }        
      })
      this.positions = positions
      this.reShowTxDetail(positions)

    },    
    createBtn(pos) {
      let {res, temperature, meditag, magnet} = this.checkTxSensor(pos)
      if (!res) {
        return
      }
      if (temperature) {
        pos.tx = Util.merge(Util.merge({}, pos.tx), temperature, ['areaId', 'areaName', 'x', 'y']) // TODO: 本来こういう付加情報はtxに直接つけるべきではない。
      }

      // フリーアドレスTXが不在エリア検知の場合は以降処理を行わない
      const isFixedPosOnArea = PositionHelper.isFixedPosOnArea(pos.tx, this.selectedAreaId)
      const isAbsentZone = Util.getValue(pos, 'location.isAbsentZone', false)
      if (isAbsentZone && !isFixedPosOnArea) {
        return
      }

      if (!isFixedPosOnArea || pos.inFixedZone || pos.hasAnother) { // 固定座席以外もしくは、固定座席だが検知されている場合、検知数増加
        this.detectedCount += 1
      }

      pos.isTransparent = pos.isTransparent || isAbsentZone // TODO: 別の場所に移動
      const txBtn = this.updateTxBtn(pos, pos.tx, meditag, magnet)
      if(this.reloadSelectedTx.btxId == pos.btxId){
        this.showDetail(txBtn.btxId, txBtn.x, txBtn.y, txBtn.color, txBtn.bgColor)
      }
      this.txIcons.push({ button: txBtn, device: pos.tx, config: txBtn.iconInfo, sign: -1 })
      return txBtn
    },
    checkTxSensor(pos) { // 表示指定（通常位置表示、センサー表示）に合致しないposの場合、res:falseをセットして返す
      let tx = pos.tx

      if (!SensorHelper.match(this.pShowTxSensorIds, tx.sensorId)) {
        return {res:false}
      }
      if(!PositionHelper.checkTxAllow(pos, tx, this.selectedAreaId, false, this.pOnlyFixTx)){
        return {res:false}
      }
      let temperature
      if (SensorHelper.match(this.pMergeSensorIds, SENSOR.TEMPERATURE, tx.sensorId)) {
        temperature = SensorHelper.getSensorFromBtxId('temperature', Util.getValue(this.sensorMap, 'temperature', []), tx.btxId)
        if(!temperature){
          return {res:false}
        }
      }
      let magnet = false
      if (SensorHelper.match(this.pMergeSensorIds, SENSOR.MAGNET, tx.sensorId)) {
        magnet = SensorHelper.getSensorFromBtxId('magnet', this.sensorMap.magnet, tx.btxId)
        // if(!magnet){
        //   return {res:false}
        // }
      }
      let meditag = null
      if (SensorHelper.match(this.pMergeSensorIds, SENSOR.MEDITAG, tx.sensorId) && APP.SENSOR.USE_MEDITAG) {
        meditag = SensorHelper.getSensorFromBtxId('meditag', this.sensorMap.meditag, tx.btxId)
        // if(!meditag){
        //   return {res:false}
        // }
      }
      return {res:true, temperature, magnet, meditag}
    },
    updateTxBtn(pos, tx, meditag, magnet){
      const display = StyleHelper.getPositionDisplay(tx)
      const color = StyleHelper.getTxIconColor(display, meditag, magnet)
      const bgColor = StyleHelper.getTxIconBgColor(display, meditag, magnet)

      if(SensorHelper.match(this.pMergeSensorIds, SENSOR.TEMPERATURE, tx.sensorId)) {
        const ret = IconHelper.createThermohIcon(tx, this.getMapScale(), this.stage)
        ret.txId = tx.txId
        ret.x = pos.x
        ret.y = pos.y
        ret.on('mouseover', this.iconMouseOver)
        ret.on('mouseout', this.iconMouseOut)
        ret.on('click', async evt => this.showChart(tx, await SensorHelper.getTodayThermoHumidityInfo(tx.txId, false)))
        return ret
      }
      // 既に該当btxIdのTXアイコンが作成済みか?
      const key = pos.btxId + '_' + pos.isFixedPosition
      let txBtn = this.icons[key]
      if (!txBtn || txBtn.color != color || txBtn.bgColor != bgColor || txBtn.isTransparent != pos.isTransparent) {
        // 作成されていない場合、新規作成してからiconsに登録
        if (txBtn) {
          delete this.icons[key]
        }
        txBtn = IconHelper.createTxBtn(pos, display.shape, color, bgColor, this.getMapScale())
        txBtn.on('click', evt => this.txOnClick(evt))
        txBtn.isTransparent = pos.isTransparent
        this.icons[key] = txBtn
      } else {
        // 作成済みの場合、座標値のみセットする
        txBtn.x = pos.x
        txBtn.y = pos.y
      }
      txBtn.isFixed = pos.isFixedPosition || pos.inFixedZone || pos.isFixedPosZone
      // if (PositionHelper.isFixedPosOnArea(tx, this.selectedAreaId)) {
      //   Util.debug('fixed location', tx)
      //   txBtn.x = tx.location.x
      //   txBtn.y = tx.location.y
      // }
      return txBtn
    },



    // 不在ゾーンへのTXの表示

    showAbsentZoneTxAll() {
      if (!this.pShowAbsent) {
        return
      }
      const absentDisplayZones = this.zones.filter(zone => zone.categoryList.some(category => category.categoryCd == SYSTEM_ZONE_CATEGORY_NAME.ABSENT_DISPLAY))
      const absentDisplayZone = _.find(absentDisplayZones, zone => zone.areaId == this.selectedAreaId)
      if (!Util.hasValue(absentDisplayZone)) {
        // 不在表示用ゾーンが存在しない場合は何もしない
        return
      }
      const ratio = DISP.TX.R_ABSOLUTE? 1 / this.canvasScale: 1
      this.absentZonePositions = PositionHelper.calcCoordinatesForZone(PositionHelper.filterPositions(undefined, false, true), ratio, this.locations, absentDisplayZone)
      this.absentZonePositions.forEach(pos => this.showAbsentZoneTx(pos))
    },
    showAbsentZoneTx(pos) {
      const tx = this.btxIdMap[pos.btxId]
      if(!SensorHelper.match(this.pShowTxSensorIds, tx.sensorId) || !this.pShowAbsent){
        return
      }
      if(!PositionHelper.checkTxAllow(pos, tx, this.selectedAreaId, true)){
        return
      }
      const magnet = tx.sensorId === SENSOR.MAGNET? SensorHelper.getSensorFromBtxId('magnet', this.sensorMap.magnet, tx.btxId): null
      const meditag = tx.sensorId === SENSOR.MEDITAG? SensorHelper.getSensorFromBtxId('meditag', this.sensorMap.meditag, tx.btxId): null

      const txBtnInfo = this.updateZoneTxBtn(pos, tx, meditag, magnet)
      const txBtn = txBtnInfo.txBtn
      if(this.reloadSelectedTx.btxId == txBtnInfo.zoneBtxId){
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y, txBtn.color, txBtn.bgColor)
      }
      this.txCont.addChild(txBtn)
    },
    updateZoneTxBtn(pos, tx, meditag, magnet){
      const display = StyleHelper.getPositionDisplay(tx)
      const color = StyleHelper.getTxIconColor(display, meditag, magnet)
      const bgColor = StyleHelper.getTxIconBgColor(display, meditag, magnet)

      // 既に該当btxIdのTXアイコンが作成済みか?
      const zoneBtxId = PositionHelper.zoneBtxIdAddNumber + pos.btxId
      let txBtn = this.icons[zoneBtxId]
      if (!txBtn || txBtn.color != color || txBtn.bgColor != bgColor) {
        // 作成されていない場合、新規作成してからiconsに登録
        if (pos.btxId == PositionHelper.zoneLastTxId()) {
          txBtn = IconHelper.createLastSystemTx(pos, this.getMapScale())
        } else {
          txBtn = IconHelper.createTxBtn(pos, display.shape, color, bgColor, this.getMapScale(), true)
          txBtn.on('click', evt => this.txOnClick(evt))
        }
        txBtn.color = color
        txBtn.bgColor = bgColor
        this.icons[zoneBtxId] = txBtn
      } else {
        // 作成済みの場合、座標値のみセットする
        txBtn.x = pos.x
        txBtn.y = pos.y
      }
      return { txBtn, zoneBtxId }
    },
    // EXBアイコンの表示

    showExbAll() { // EXB表示
      if(!Util.hasValue(this.pShowExbSensorIds)){
        return
      }
      if (!this.exbCon) {
        this.exbCon = ViewHelper.addContainerOnStage(this.stage, this.bitmap.width, this.bitmap.height)
      }
      this.exbCon.removeAllChildren()
 
      _(this.sensorMap).forEach(sensorList => sensorList.forEach(sensor => {
        if (sensor.exbId && sensor.areaId == this.selectedAreaId) {
          this.showExb(sensor)
        }
      }))
      this.keepExbPosition = false
      //　表示条件：マグネットセンサ、固定位置登録＆同一エリア、PIR画面表示設定
      if(SensorHelper.match(this.pShowExbSensorIds, SENSOR.MAGNET) && APP.SENSOR.SHOW_MAGNET_ON_PIR){
        _(this.txs).filter(tx => tx.sensorId == SENSOR.MAGNET && PositionHelper.isFixedPosOnArea(tx, this.selectedAreaId) && NumberUtil.bitON(tx.disp, TX.DISP.PIR))
          .forEach(tx => this.showMagnet(tx))
      }
    },
    showExb(exb) {
      const icon = IconHelper.createExbIcon(exb, this.pShowExbSensorIds, this.getMapScale(), this.stage)
      if(!icon){
        return
      }
      if (this.pShowPir) {
        icon.on('mouseover', this.iconMouseOver)
        icon.on('mouseout', this.iconMouseOut)
      }
      if(SensorHelper.match(this.pMergeSensorIds, SENSOR.TEMPERATURE, exb.sensorIdList)) {
        icon.on('mouseover', this.iconMouseOver)
        icon.on('mouseout', this.iconMouseOut)
        icon.on('click', async evt => this.showChart(exb, await SensorHelper.getTodayThermoHumidityInfo(exb.exbId, true)))
      }
      this.exbIcons.push({ button: icon, device: exb, config: icon.iconInfo, sign: -1 })
      this.exbCon.addChild(icon)
    },
    showMagnet(tx) { // TXマグネットセンサ表示　（同じ場所に複数TXがあると、あとのもので上書きされてい表示される。複数TXはトイレ表示用途）
      const icon = IconHelper.createExbIconForMagnet(tx, this.sensorMap.magnet, this.getMapScale())
      if(icon){
        if (this.pShowPir) {
          icon.on('mouseover', this.iconMouseOver)
          icon.on('mouseout', this.iconMouseOut)
        }
        this.exbCon.addChild(icon)
      }
    },
    showAllMRoom() {
      if(!this.pShowMRoomStatus) {
        return
      }
      if (!this.txCont) {
        this.txCont = ViewHelper.addContainerOnStage(this.stage, this.bitmap.width, this.bitmap.height)
      }
      this.txCont.removeAllChildren()
      const icons = PlanHelper.createAllMRoomIcons(this.getMapScale())
      icons.forEach(icon => {
        icon.on('mouseover', this.iconMouseOver)
        icon.on('mouseout', this.iconMouseOut)
        this.txCont.addChild(icon)
      })
    },
    // 分析用の表示処理（動線・ヒートマップ）

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
    // 描画処理
    async analyseData() { // TODO: なぜ動線とヒートマップで同じメソッドを共有している？
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
            areaId: this.selectedAreaId,
            categoryId: this.selectedCategoryId,
            groupId: this.selectedGroupId,
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
    // 分析用検索条件のバリデーション
    validate() {
      const enableCategory = this.isUseFilter('category')
      const enableGroup = this.isUseFilter('group')
      const limitMs = APP.ANALYSIS.DATETIME_LIMIT * 24 * 60 * 60 * 1000
      const errors = ValidateHelper.validateCheck([
        {type: 'require', names: ['area'], values: [this.selectedAreaId]},
        {type: 'require',
          names: [enableCategory? 'category': null, enableGroup? 'group': null, this.pAnalysisIndividual? 'individual': null].filter(val => val),
          values: [enableCategory? this.selectedCategoryId: null, enableGroup? this.selectedGroupId: null, this.pAnalysisIndividual? this.form.potId: null].filter(val => val)},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'less', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime() * -1, this.form.datetimeTo.getTime()], base: limitMs, displayBase: APP.ANALYSIS.DATETIME_LIMIT, equal: true}: null,
      ].filter(val => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
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

.lightbox {
  height: 140px;
  width: 500px;
  padding: 5px;
  background-color: white;
  border: 1px solid #6c757d;
  position: absolute;
  top: 200px;
  right: 100px;
  z-index: 10;
  overflow-x: scroll;
  overflow-y: scroll;
  -ms-overflow-x: auto;
  -ms-overflow-y: auto;
  -ms-overflow-style:none;
  box-shadow: 8px 8px 8px rgba(0,0,0,0.4);
}

</style>
