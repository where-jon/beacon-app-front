<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail" >
    <breadcrumb :items="items" :extraNavSpec="extraNavSpec" :reload="true" :shortName="shortName" :legendItems="legendItems" />
    <b-row class="mt-2">
      <b-form inline @submit.prevent class="mt-2">
        <b-form-row class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">{{ $t('label.area') }}</label>
          <b-form-select v-model="selectedArea" :options="areaOptions" @change="changeArea" required class="ml-1 mr-2"></b-form-select>
        </b-form-row>
        <b-form-row v-if="useGroup" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">{{ $t('label.group') }}</label>
          <b-form-select v-model="selectedGroup" :options="groupOptions" class="ml-1 mr-2"></b-form-select>
        </b-form-row>
        <b-form-row v-if="useCategory" class="my-1 ml-2 ml-sm-0">
          <label class="ml-sm-4 ml-2 mr-1">{{ $t('label.category') }}</label>
          <b-form-select v-model="selectedCategory" :options="categoryOptionsForPot" class="ml-1 mr-2"></b-form-select>
        </b-form-row>
        <b-form-row class="my-1 ml-2 ml-sm-0" v-if="showDetected">
          <span class="ml-sm-4 ml-2 mr-1">{{ $t('label.detectedCount') + ' : '  }}</span>
          <span class="mr-1">{{detectedCount}}</span>
        </b-form-row>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map" v-if="!showMeditag"></canvas>
      <b-col  v-if="showMeditag">
        <canvas id="map" ref="map"></canvas>
      </b-col>
      <b-col class="rightPane" v-if="showMeditag">
        <sensor :sensors="meditagSensors" class="rightPane"></sensor>
      </b-col>
    </b-row>
    <div v-if="selectedTx.btxId && showReady" >
      <txdetail :selectedTx="selectedTx" @resetDetail="resetDetail" :selectedSensor="selectedSensor" :isShowModal="isShowModal()" />
    </div>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as MenuHelper from '../../sub/helper/MenuHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import * as mock from '../../assets/mock/mock'
import txdetail from '../../components/parts/txdetail.vue'
import { Tx, EXB, APP, DISP, DEV } from '../../sub/constant/config'
import { SHAPE, SENSOR, EXTRA_NAV, POSITION } from '../../sub/constant/Constants'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import listmixin from '../../components/mixin/listmixin.vue'
import sensor from '../../components/parts/sensor.vue'
import moment from 'moment'
import { rightpanewidth, rightpaneleft } from '../../sub/constant/config.scss'

export default {
  mixins: [showmapmixin, listmixin],
  components: {
    'sensor': sensor,
    'txdetail': txdetail,
    breadcrumb,
  },
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
      count: 0, // for mock test
      detectedCount: 0, // 検知数
      pot: {},
      showMeditag: APP.USE_MEDITAG,
      showDetected: APP.SHOW_DETECTED_COUNT,
      meditagSensors: [],
      showReady: false,
      shortName: this.$i18n.tnl('label.showPositionShort'),
      extraNavSpec: EXTRA_NAV,
      shwoIconMinWidth: POSITION.SHOW_ICON_MIN_WIDTH,
      legendItems: [],
      useGroup: MenuHelper.useMaster('group'),
      useCategory: MenuHelper.useMaster('category'),
      selectedGroup: null,
      selectedCategory: null,
      ICON_FONTSIZE_RATIO: 0.7,
      toggleCallBack: () => this.reset(),
      reloadSelectedTx: {},
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
      'orgPositions',
      'positionHistores',
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
    ...mapGetters('app_service' ,[
      'categoryOptionsForPot',
      'groupOptions',
    ]),
    selectedSensor() {
      if (this.selectedTx && this.selectedTx.btxId) {
        var ret = this.getMeditagSensor(this.selectedTx.btxId)
      }
      return ret? [ret]: []
    },
    positions() {
      let positions = []
      if (APP.USE_POSITION_HISTORY) {
        positions = this.positionHistores
      } else {
        let now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
        positions = PositionHelper.correctPosId(this.orgPositions, now)
      }
      if (APP.USE_MEDITAG && this.meditagSensors) {
        positions = SensorHelper.setStress(positions, this.meditagSensors)
      }
      positions = this.positionFilter(positions, this.selectedGroup, this.selectedCategory)
      return positions
    },
    filter() {
      return [this.selectedGroup, this.selectedCategory]
    },
  },
  watch: {
    filter() {
      this.showTxAll()
    },
  },
  async mounted() {
    await StateHelper.load('category')
    await StateHelper.load('group')
    document.addEventListener('touchstart', this.touchEnd)
    this.fetchData()
  },
  beforeDestroy() {
    this.resetDetail()
  },
  methods: {
    ...mapActions('main', [
      'pushOrgPositions',
      'setPositionHistores',
    ]),
    reset() {
      this.isShownMapImage = false
      this.resetDetail()
    },
    showDetail(btxId, x, y) {
      const tipOffsetX = 15
      const tipOffsetY = 15
      const popupHeight = this.getMeditagSensor(btxId)? 236: 135
      let tx = this.txs.find((tx) => tx.btxId == btxId)
      let display = this.getDisplay(tx)
      let map = HtmlUtil.getRect("#map")
      let containerParent = HtmlUtil.getRect("#mapContainer", "parentNode")
      let offsetX = map.left - containerParent.left
      let offsetY = map.top - containerParent.top
      const isDispRight = x + offsetX + 100 < window.innerWidth
      // rev === trueの場合、ポップアップを上に表示
      const rev = y + map.top + DISP.TX_R + tipOffsetY + popupHeight > window.innerHeight
      const p = tx.pot? tx.pot: {}

      const position = this.positions.find((e) => {
        return e.btx_id === btxId
      })
      const balloonClass = !btxId ? "": "balloon" + (rev ? "-u": "-b")
      let selectedTx = {
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
    getMeditagSensor(btxId) {
      if (this.meditagSensors) {
        return this.meditagSensors.find((val) => btxId == val.btx_id)
      }
      return null
    },
    resetDetail() {
      if (!this.showingDetailTime || new Date().getTime() - this.showingDetailTime > 100) {
        let selectedTx = {}
        this.replaceMain({selectedTx})
      }
    },
    getFinalReceiveTime (time) {
      return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : ''
    },
    async loadLegends () {
      const magnetCategoryTypes = this.txs.filter((val) => val.category && val.sensorId == SENSOR.MAGNET)
        .map((val) => val.category.categoryId)
      this.legendItems = this.categories.map((val) => ({
        id: val.categoryId,
        items: magnetCategoryTypes.includes(val.categoryId)? [
          { id: 1, text: "A", style: this.getStyleDisplay1(val) },
          { id: 2, text: `${val.categoryName}${this.$i18n.tnl("label.using")}`, style: null },
          { id: 3, text: "A", style: this.getStyleDisplay1(val, true) },
          { id: 4, text: `${this.$i18n.tnl("label.notUse")}`, style: {} },
        ]: [
          { id: 1, text: "A", style: this.getStyleDisplay1(val) },
          { id: 2, text: val.categoryName, style: {} },
        ]
      }))
    },
    async fetchData(payload) {
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        this.replace({showProgress: true})
        await StateHelper.load('tx', this.forceFetchTx)
        StateHelper.setForceFetch('tx', false)
        this.loadLegends()
        await this.fetchAreaExbs(true)

        if (DEV.USE_MOCK_EXC) {
          // var pMock = mock.position
          var pMock = mock.positions[this.count]
        }
        if (APP.USE_POSITION_HISTORY) {
          // Serverで計算された位置情報を得る
          let positionHistores = await EXCloudHelper.fetchPositionHistory(this.exbs, this.txs, pMock)
          this.replaceMain({positionHistores})
        } else {
          // 移動平均数分のポジションデータを保持する
          this.pushOrgPositions(await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock))
        }

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

        this.showMapImage()
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    async getDetail(txId) {
      let tx = await AppServiceHelper.fetch('/core/tx', txId)
      return tx && tx.pot
    },
    showMapImage() {
      this.showMapImageDef(() => {

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
  
        Util.debug('Raw exb', this.exbs, this.selectedArea)
        this.positionedExb = _(this.exbs).filter((exb) => {
          return exb.enabled && exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
        }).value()
        Util.debug('positionedExb', this.positionedExb)
        if (this.positionedExb.length == 0) {
          console.warn("positionedExb is empty. check if exbs are enabled")
        }
  
        this.showTxAll()
      })
    },
    showTxAll() {
      if (!this.txCont) {
        return
      }
      this.txCont.removeAllChildren()
      this.stage.update()

      // for debug
      let disabledExbs = _.filter(this.exbs, (exb) => !exb.enabled || !exb.location.x || exb.location.y <= 0)
      this.positions.forEach((pos) => {
        let exb = disabledExbs.find((exb) => exb.posId == pos.pos_id)
        if (exb) {
          console.error("Found at disabled exb", pos, exb)
        }
      })

      this.detectedCount = 0　// 検知カウントリセット
      let position = PositionHelper.adjustPosition(this.positions, this.mapImageScale, this.positionedExb)
      position.forEach((pos) => { // TODO: Txのチェックも追加
        this.showTx(pos)
      })

      if (this.selectedTx.btxId) {
        const tx = this.selectedTx
        const selectedTxPosition = position.find((pos) => pos.btx_id == tx.btxId)
        if (selectedTxPosition) {
          this.showDetail(tx.btxId, selectedTxPosition.x, selectedTxPosition.y)
        }
      }
    },
    getDisplay(tx) {
      let catOrGr = tx[DISP.DISPLAY_PRIORITY[0]] || tx[DISP.DISPLAY_PRIORITY[1]]
      let display = catOrGr && catOrGr.display || {}
      return {
        color: display.color || DISP.TX_COLOR,
        bgColor: display.bgColor || DISP.TX_BGCOLOR,
        shape: display.shape || SHAPE.CIRCLE
      }
    },
    isMagnetOn(magnet) {
      return magnet && magnet.magnet === SENSOR.MAGNET_STATUS.ON
    },
    showTx(pos) {
      let tx = this.txs.find((tx) => tx.btxId == pos.btx_id)
      Util.debug('showTx', pos, tx && tx.sensor)
      if (!tx) {
        console.warn("tx not found. btx_id=" + pos.btx_id)
        return
      }
      if (tx.sensorId === SENSOR.MAGNET) {
        var magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btx_id == tx.btxId)
        Util.debug('magnet', magnet)
      }
      if (tx.sensorId === SENSOR.MEDITAG) {
        var meditag = this.getMeditagSensor(tx.btxId)
        Util.debug('meditag', meditag)
      }
      let display = this.getDisplay(tx)
      let stage = this.stage
      let txBtn = new Container()
      let btnBg = new Shape()
      let bgColor = meditag? meditag.bg.substr(1): this.isMagnetOn(magnet)? display.color: display.bgColor
      let color = meditag? "000": this.isMagnetOn(magnet)? display.bgColor : display.color
      btnBg.graphics.beginStroke("#ccc").beginFill('#' + bgColor)
      switch(display.shape) {
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
      txBtn.addChild(btnBg)

      let label = new Text(pos.label)
      label.font = `${DISP.TX_R * this.ICON_FONTSIZE_RATIO}px Arial`
      label.color = '#' + color
      label.textAlign = "center"
      label.textBaseline = "middle"
      txBtn.addChild(label)

      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) => {
        evt.stopPropagation()
        this.showingDetailTime = new Date().getTime()
        let txBtn = evt.currentTarget
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      })
      if(this.reloadSelectedTx.btxId == pos.btx_id){
        this.showingDetailTime = new Date().getTime()
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      }
      this.txCont.addChild(txBtn)
      stage.update()
      this.detectedCount++  // 検知数カウント増加
    },
    isShowModal() {
      return window.innerWidth < this.shwoIconMinWidth
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
    touchEnd (evt) {
      if (evt.target.id === 'map') {
        return
      }
      this.resetDetail()
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
  overflow: scroll;
  height: calc(100vh - 100px);
}

</style>