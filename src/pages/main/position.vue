<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :extra-nav-spec="extraNavSpec" :reload="true" :short-name="shortName" :legend-items="legendItems" />
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.area') }}
          </label>
          <b-form-select v-model="selectedArea" :options="areaOptions" required class="ml-1 mr-2" @change="changeArea" />
        </b-form-row>
        <b-form-row v-if="useGroup" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.group') }}
          </label>
          <b-form-select v-model="selectedGroup" :options="groupOptions" class="ml-1 mr-2" />
        </b-form-row>
        <b-form-row v-if="useCategory" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.category') }}
          </label>
          <b-form-select v-model="selectedCategory" :options="categoryOptionsForPot" class="ml-1 mr-2" />
        </b-form-row>
        <b-form-row v-if="showDetected" class="my-1 ml-2 ml-sm-0">
          <span class="ml-sm-4 ml-2 mr-1">
            {{ $t('label.detectedCount') + ' : ' }}
          </span>
          <span class="mr-1">
            {{ detectedCount }}
          </span>
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas v-if="!showMeditag" id="map" ref="map" />
      <b-col v-if="showMeditag">
        <canvas id="map" ref="map" />
      </b-col>
      <b-col v-if="showMeditag" class="rightPane">
        <sensor :sensors="meditagSensors" class="rightPaneChild" />
      </b-col>
    </b-row>
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
import * as Util from '../../sub/util/Util'
import txdetail from '../../components/parts/txdetail.vue'
import { APP, DISP } from '../../sub/constant/config'
import { SENSOR, EXTRA_NAV, CATEGORY, TX } from '../../sub/constant/Constants'
import { Container } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import listmixin from '../../components/mixin/listmixin.vue'
import sensor from '../../components/parts/sensor.vue'

export default {
  components: {
    'sensor': sensor,
    'txdetail': txdetail,
    breadcrumb,
  },
  mixins: [showmapmixin, listmixin],
  data() {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.main'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.showPosition'),
          active: true
        },
      ],
      detectedCount: 0, // 検知数
      pot: {},
      showMeditag: APP.USE_MEDITAG,
      showDetected: APP.SHOW_DETECTED_COUNT,
      shortName: this.$i18n.tnl('label.showPositionShort'),
      extraNavSpec: EXTRA_NAV,
      legendItems: [],
      useGroup: MenuHelper.useMaster('group') && APP.TX_WITH_GROUP,
      useCategory: MenuHelper.useMaster('category') && APP.TX_WITH_CATEGORY,
      toggleCallBack: () => this.reset(),
      noImageErrorKey: 'noMapImage',
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
    ]),
    ...mapState('app_service', [
      'categories',
      'groups',
      'txs',
      'forceFetchTx',
    ]),
    ...mapState([
      'reload',
    ]),
    categoryOptionsForPot() {
      return StateHelper.getOptionsFromState('category', false, false,
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
  },
  async mounted() {
    await StateHelper.load('category')
    await StateHelper.load('group')
    document.addEventListener('touchstart', this.touchEnd)
    await this.fetchData()
  },
  beforeDestroy() {
    this.resetDetail()
  },
  methods: {
    async loadLegends () {
      const loadCategory = DISP.DISPLAY_PRIORITY[0] == 'category'
      const magnetCategoryTypes = loadCategory? this.getMagnetCategoryTypes(): this.getMagnetGroupTypes()
      const legendElements = loadCategory? this.getCategoryLegendElements(): this.getGroupLegendElements()

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
      return this.txs.filter((val) => val.category && val.sensorId == SENSOR.MAGNET)
        .map((val) => val.category.categoryId)
    },
    getCategoryLegendElements () {
      return this.categories.map((val) => ({ id: val.categoryId, name: val.categoryName, ...val,}))
    },
    getMagnetGroupTypes () {
      return this.txs.filter((val) => val.group && val.sensorId == SENSOR.MAGNET)
        .map((val) => val.group.groupId)
    },
    getGroupLegendElements () {
      return this.groups.map((val) => ({id: val.groupId, name: val.groupName, ...val, }))
    },
    async fetchPositionData() {
      await this.fetchAreaExbs(true)
      await this.storePositionHistory(this.count)

      if (APP.USE_MEDITAG) {
        let meditagSensors = await EXCloudHelper.fetchSensor(SENSOR.MEDITAG)
        this.meditagSensors = _(meditagSensors)
          .filter((val) => this.txs.some((tx) => tx.btxId == val.btx_id))
          .map((val) => {
            let tx = this.txs.find((tx) => tx.btxId == val.btx_id)
            let label = tx && tx.displayName? tx.displayName: val.btx_id
            return {...val, label, bg: SensorHelper.getStressBg(val.stress), down: val.down?val.down:0}
          })
          .sortBy((val) => (new Date().getTime() - val.downLatest < APP.DOWN_RED_TIME)? val.downLatest * -1: val.btx_id)
          .value()
        Util.debug(this.meditagSensors)
      }

      if (APP.USE_MAGNET) {
        this.magnetSensors = await EXCloudHelper.fetchSensor(SENSOR.MAGNET)
        Util.debug(this.magnetSensors)
      }
    },
    async fetchData(payload, disableErrorPopup) {
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        this.showProgress()
        await StateHelper.load('tx', this.forceFetchTx)
        StateHelper.setForceFetch('tx', false)
        this.$nextTick(() => {
          this.loadLegends()
        })
        this.showMapImage(disableErrorPopup)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    async getDetail(txId) {
      let tx = await AppServiceHelper.fetch('/core/tx', txId)
      return tx && tx.pot
    },
    showMapImage(disableErrorPopup) {
      this.showMapImageDef(async () => {

        await this.fetchPositionData()

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
      }, disableErrorPopup)
    },
    showTxAll() {
      if (!this.txCont) {
        return
      }
      this.txCont.removeAllChildren()
      this.stage.update()
      // for debug
      this.disableExbsCheck()
      this.detectedCount = 0 // 検知カウントリセット
      let position = PositionHelper.adjustPosition(this.getPositions(), this.mapImageScale, this.positionedExb)
      position.forEach((pos) => {
        this.showTx(pos)
      })
      this.reShowTx(position)
    },
    showTx(pos) {
      const tx = this.txs.find((tx) => tx.btxId == pos.btx_id)
      const exb = this.exbs.find((exb) => exb.posId == pos.pos_id)
      Util.debug('showTx', pos, tx && tx.sensor)
      if (!tx) {
        console.warn('tx not found. btx_id=' + pos.btx_id)
        return
      }
      if (!Util.bitON(tx.disp, TX.DISP.POS)) {
        Util.debug('tx is not allowed to show', tx)
        return
      }
      if (pos.noSelectedTx) {
        Util.debug('tx is not allowed to show', tx)
        return
      }
      let magnet = null
      if (tx.sensorId === SENSOR.MAGNET) {
        magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btx_id == tx.btxId)
        Util.debug('magnet', magnet)
      }
      let meditag = null
      if (tx.sensorId === SENSOR.MEDITAG) {
        meditag = this.getMeditagSensor(tx.btxId)
        Util.debug('meditag', meditag)
      }
      const display = this.getDisplay(tx)
      const color = meditag? '000': this.isMagnetOn(magnet)? display.bgColor : display.color
      const bgColor = meditag? meditag.bg.substr(1): this.isMagnetOn(magnet)? display.color: display.bgColor
      if (exb.isAbsentZone && !this.isFixTx(tx)) {
        // 何もしない（TX非表示）
      } else {
        if (exb.isAbsentZone && this.isFixTx(tx)) {
          pos.transparent = true
        }
        
        const txBtn = this.createTxBtn(pos, display.shape, color, bgColor)
        if (this.isFixTx(tx)) {
          Util.debug('fixed location', tx)
          txBtn.x = tx.location.x * this.mapImageScale
          txBtn.y = tx.location.y * this.mapImageScale
        }

        if(this.reloadSelectedTx.btxId == pos.btx_id){
          this.showingDetailTime = new Date().getTime()
          this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
        }
        this.txCont.addChild(txBtn)
        this.stage.update()
        this.detectedCount++  // 検知数カウント増加
      }
    },
    touchEnd (evt) {
      if (evt.target.id === 'map') {
        return
      }
      this.resetDetail()
    },
    isFixTx (tx) {
      return tx.location && tx.location.areaId == this.selectedArea && tx.location.x * tx.location.y > 0
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

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