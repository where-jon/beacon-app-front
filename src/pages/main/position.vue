<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec" :reload="true" :auto-reload="false" :short-name="shortName" :legend-items="legendItems" />
    <b-alert v-model="showDismissibleAlert" variant="danger" dismissible>
      {{ $t('label.detectedProhibitZone') + ' : ' }}{{ message }}
    </b-alert>
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.area') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.area)">
            <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="ml-1 mr-2 vue-options">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="useGroup" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.group') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.group)">
            <v-select v-model="vueSelected.group" :options="groupOptions" class="ml-1 mr-2 vue-options">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
              </template>
            </v-select>
          </span>
        </b-form-row>
        <b-form-row v-if="useCategory" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.category') }}
          </label>
          <span :title="vueSelectTitle(vueSelected.category)">
            <v-select v-model="vueSelected.category" :options="categoryOptionsForPot" class="ml-1 mr-2 vue-options">
              <template slot="selected-option" slot-scope="option">
                {{ vueSelectCutOn(option) }}
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
            <b-button class="ml-sm-4 ml-2 mr-1" :pressed.sync="isPause" :variant="getButtonTheme()">
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
        <sensor :sensors="meditagSensors" :is-popup="false" class="rightPaneChild" />
      </div>
    </b-row>
    <div v-if="showMeditag && isShowBottom && hasMeditagSensors()" class="rightPane">
      <sensor :sensors="meditagSensors" :is-popup="false" class="rightPaneChild" />
    </div>
    <div v-if="selectedTx.btxId && showReady">
      <txdetail :selected-tx="selectedTx" :selected-sensor="selectedSensor" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as ParamHelper from '../../sub/helper/ParamHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as Util from '../../sub/util/Util'
import txdetail from '../../components/parts/txdetail.vue'
import { APP, DISP } from '../../sub/constant/config'
import { SENSOR, EXTRA_NAV, CATEGORY, TX } from '../../sub/constant/Constants'
import { Container } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import listmixin from '../../components/mixin/listmixin.vue'
import sensor from '../../components/parts/sensor.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import controlmixinVue from '../../components/mixin/controlmixin.vue'

export default {
  components: {
    'sensor': sensor,
    'txdetail': txdetail,
    breadcrumb,
  },
  mixins: [showmapmixin, listmixin, commonmixinVue, controlmixinVue],
  props: {
    isInstallation: {
      default: false,
      type: Boolean
    },
  },
  data() {
    return {
      items: !this.isInstallation ? ViewHelper.createBreadCrumbItems('main', 'showPosition') : ViewHelper.createBreadCrumbItems('develop', 'installation'),
      detectedCount: 0, // 検知数
      pot: {},
      showMeditag: APP.SENSOR.USE_MEDITAG && !this.isInstallation,
      showDetected: APP.POS.SHOW_DETECTED_COUNT,
      shortName: this.$i18n.tnl('label.showPositionShort'),
      extraNavSpec: EXTRA_NAV,
      legendItems: [],
      useGroup: MenuHelper.useMaster('group') && APP.POS.WITH.GROUP,
      useCategory: MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY,
      toggleCallBack: () => this.reset(),
      noImageErrorKey: 'noMapImage',
      modeRssi: false,
      isPause: false,
      firstTime: true,
      message: '',
      showDismissibleAlert: false,
      prohibitData : null,
      icons: {},
      txsMap: {},
      exbsMap: {},
      prohibitInterval:null,
      isShowRight: false,
      isShowBottom: false,
      isMounted: false,
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
      'txs',
      'forceFetchTx',
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
    await StateHelper.load('category')
    await StateHelper.load('group')
    await StateHelper.load('prohibit')
    await StateHelper.load('tx')
    await StateHelper.load('exb')
    this.txs.forEach((t) => this.txsMap[t.btxId] = t)
    this.exbs.forEach((e) => this.exbsMap[e.posId] = e)
    // this.fetchData()は'vueSelected.area'をwatchしている箇所で実行している。
    // 以下は二重実行を防ぐためコメントアウト
    // await this.fetchData()
    this.vueSelected.category = ParamHelper.getVueSelectData(this.categoryOptionsForPot, this.selectedCategory, false)
    this.vueSelected.group = ParamHelper.getVueSelectData(this.groupOptions, this.selectedGroup, false)
    this.startPositionAutoReload()
    this.startOtherAutoReload()

    this.changeArea(this.selectedArea)
    this.isMounted = true
  },
  beforeDestroy() {
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
          { id: 1, text: 'A', style: this.getStyleDisplay1(legendElement) },
          { id: 2, text: `${legendElement.name} : ${this.$i18n.tnl('label.using')}`, style: null },
          { id: 3, text: 'A', style: this.getStyleDisplay1(legendElement, {reverceColor: true, fixSize: true}) },
          { id: 4, text: `${this.$i18n.tnl('label.notUse')}`, style: {} },
        ]: [
          { id: 1, text: 'A', style: this.getStyleDisplay1(legendElement) },
          { id: 2, text: legendElement.name, style: {} },
        ]
      }))
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
      // await this.fetchAreaExbs(true)
      await this.fetchAreaExbs(false)

      let alwaysTxs = this.txs.filter((tx) => {
        return tx.areaId == this.selectedArea && Util.bitON(tx.disp, TX.DISP.ALWAYS)
      })
      let isAllfetch = alwaysTxs? true: false
      if(!payload.disabledPosition){
        await this.storePositionHistory(this.count, isAllfetch)
      }

      if(payload.disabledOther){
        return
      }
      if (APP.SENSOR.USE_MEDITAG) {
        let meditagSensors = await EXCloudHelper.fetchSensor(SENSOR.MEDITAG)
        this.meditagSensors = _(meditagSensors)
          .filter((val) => this.txs.some((tx) => tx.btxId == val.btxid))
          .map((val) => {
            let tx = this.txs.find((tx) => tx.btxId == val.btxid)
            let label = tx && tx.displayName? tx.displayName: val.btxid
            return {...val, label, bg: SensorHelper.getStressBg(val.stress), down: val.down?val.down:0}
          })
          .sortBy((val) => (new Date().getTime() - val.downLatest < APP.SENSOR.MEDITAG.DOWN_RED_TIME)? val.downLatest * -1: val.btxid)
          .value()
        Util.debug(this.meditagSensors)
      }

      if (APP.SENSOR.USE_MAGNET) {
        this.magnetSensors = await EXCloudHelper.fetchSensor(SENSOR.MAGNET)
        Util.debug(this.magnetSensors)
      }
    },
    async fetchData(payload, disableErrorPopup) {
      const disabledProgress = Util.getValue(payload, 'disabledProgress', false)
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        if(!disabledProgress){
          this.showProgress()
        }
        if (!this.selectedTx.btxId) {
          await StateHelper.load('tx', this.forceFetchTx)
          StateHelper.setForceFetch('tx', false)
        }
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
        icon.prohibit? icon.visible=!icon.visible : icon.visible = true
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
        const spinClassName = 'fa-spin'
        if(!this.firstTime && reloadButton){
          reloadButton.classList.add(spinClassName)
        }
        if(!this.selectedTx.btxId){
          await this.fetchPositionData(cPayload)
        }

        this.stage.on('click', (evt) => {
          this.resetDetail()
        })
        if (!this.txCont) {
          this.txCont = new Container()
          this.txCont.width = this.bitmap.width
          this.txCont.height = this.bitmap.height
          this.stage.addChild(this.txCont)
          this.stage.update()
        }
        this.setPositionedExb()
        this.showTxAll()
        this.setProhibit('pos') // listmixin呼び出し
        if(!this.firstTime && reloadButton){
          reloadButton.classList.remove(spinClassName)
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
      this.stage.update()
      this.disableExbsCheck()
      this.detectedCount = 0 // 検知カウントリセット
      let position = []
      if(APP.POS.USE_MULTI_POSITIONING){
        let area = _.find(this.$store.state.app_service.areas, (area) => area.areaId == this.selectedArea)
        let mapRatio = area.mapRatio
        position = PositionHelper.adjustMultiPosition(this.getPositions(), mapRatio)
      }else{
        const ratio = DISP.TX.R_ABSOLUTE ? 1/this.canvasScale : 1
        position = PositionHelper.adjustPosition(this.getPositions(), ratio, this.positionedExb, this.selectedArea)
      }
      position.forEach((pos) => this.showTx(pos))
      this.reShowTx(position)
    },
    showTx(pos) {
      const tx = this.txsMap[pos.btx_id]
      const exb = this.exbsMap[pos.pos_id]
      Util.debug('showTx', pos, tx && tx.sensor)
      if (!tx) {
        console.warn('tx not found. btx_id=' + pos.btx_id)
        return
      }
      if (!Util.bitON(tx.disp, TX.DISP.POS)) {
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

      if ((exb && exb.isAbsentZone || this.isOtherFloorFixTx(tx, exb)) && this.isFixTx(tx)) {
        pos.transparent = true
      }

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
      // プロとするTXアイコンが進入禁止区域に入ってるかチェック
      txBtn.prohibit  = this.prohibitData ? this.prohibitData.some((data) => data.minor == pos.minor):false

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
      this.stage.update()
      this.detectedCount++  // 検知数カウント増加
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
@import "../../sub/constant/vue.scss";

$right-pane-width-px: $right-pane-width * 1px;
$right-pane-maxwidth-px: ($right-pane-width + 100) * 1px;
$right-pane-left-px: $right-pane-left * 1px;

::-webkit-scrollbar { 
  display: none; 
}

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