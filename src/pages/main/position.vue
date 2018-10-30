<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <b-row class="mt-2">
      <b-form inline class="mt-2">
        <label class="ml-3 mr-2">{{ $t('label.area') }}</label>
        <b-form-select v-model="selectedArea" :options="areaOptions" @change="changeArea" required class="ml-2"></b-form-select>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map" @click="resetDetail" v-if="!showMeditag"></canvas>
      <b-col  v-if="showMeditag">
        <canvas id="map" ref="map" @click="resetDetail"></canvas>
      </b-col>
      <b-col class="rightPane" v-if="showMeditag">
        <sensor :sensors="meditagSensors" class="rightPane"></sensor>
      </b-col>
    </b-row>
    <div v-if="selectedTx.txId" >
      <txdetail :selectedTx="selectedTx" @resetDetail="resetDetail"></txdetail>
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
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import * as mock from '../../assets/mock/mock'
import txdetail from '../../components/txdetail.vue'
import { Tx, EXB, APP, DISP, DEV } from '../../sub/constant/config'
import { SHAPE, SENSOR } from '../../sub/constant/Constants'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import showmapmixin from '../../components/showmapmixin.vue'
import sensor from '../../components/sensor.vue'
import moment from 'moment'
import { rightpanewidth, rightpaneleft } from '../../sub/constant/config.scss'

let that

export default {
  mixins: [showmapmixin],
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
      positions: [],
      count: 0, // for mock test 
      txsMap: {},
      pot: {},
      showMeditag: APP.USE_MEDITAG,
      meditagSensors: [],
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
      'orgPositions',
    ]),
  },
  async mounted() {
    that = this
    this.replace({title: this.$i18n.tnl('label.showPosition')})
    await this.fetchData()
    if (this.selectedTx.txId) {
      this.showInitDetail(this.selectedTx)
    }
  },
  updated(){
    if (this.isFirstTime) return
    // this.fetchData()
  },
  beforeDestroy() {
    this.resetDetail()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
      this.resetDetail()
    },
    async showDetail(txId, x, y) {
      let rev = y > 400
      let map = HtmlUtil.getRect("#map")
      let containerParent = HtmlUtil.getRect("#mapContainer", "parentNode")
      let offsetX = map.left - containerParent.left
      let offsetY = map.top - containerParent.top
      const tipOffsetX = -34.5
      const tipOffsetY = 15
      const targetId = this.txsMap[txId]
      const p = await this.getDetail(targetId)
      const position = this.positions.find((e) => {
        return e.btx_id === txId
      })
      console.log(p)
      let selectedTx = {
        txId,
        minor: 'minor:' + txId,
        major: p.tx && p.tx.major? 'major:' + p.tx.major : '',
        class: !txId? "": "balloon" + (rev? "-u": ""),
        left: x + offsetX + tipOffsetX + (rev? - 7: 0),
        top: y + offsetY + tipOffsetY + DISP.TX_R + (rev? - 232: 0),
        name: p.potName ? p.potName : '',
        timestamp: position ? this.getFinalReceiveTime(position.timestamp) : '',
        thumbnail: p.thumbnail ? p.thumbnail : '',
        category: p.potCategoryList && p.potCategoryList.length > 0 ? p.potCategoryList[0].category.categoryName : '',
        group: p.potGroupList && p.potGroupList.length > 0 ? p.potGroupList[0].group.groupName : ''
      }
      this.replaceMain({selectedTx})
    },
    showInitDetail(tx) {
      const position = PositionHelper.adjustPosition(this.positions, this.mapImageScale, this.positionedExb)
          .filter((pos) => pos.btx_id == tx.btxId)
      if (position.length == 1) {
        this.showDetail(tx.txId, position[0].x, position[0].y)
      }
    },
    resetDetail() {
      let selectedTx = {}
      this.replaceMain({selectedTx})
    },
    getFinalReceiveTime (time) {
      return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : ''
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await this.fetchAreaExbs(true)

        if (DEV.USE_MOCK_EXC) {
          // var pMock = mock.position
          var pMock = mock.positions[this.count]
        }
        let positions = await EXCloudHelper.fetchPosition(this.exbs, this.txs, pMock)
        let orgPositions = _.clone(this.orgPositions)
        if (orgPositions.length >= DISP.MOVING_AVERAGE) { // 移動平均数分のポジションデータを保持する
          orgPositions.shift()
        }
        orgPositions.push(positions)
        this.replaceMain({orgPositions})

        this.showMapImage()

        if (APP.USE_MEDITAG) {
          let meditagSensors = await EXCloudHelper.fetchSensor(SENSOR.MEDITAG)
          this.meditagSensors = _(meditagSensors)
          .map((val) => {
              return {...val, bg: SensorHelper.getStressBg(val.stress), down: val.down?val.down:0}
          })
          .filter((val) => this.txs.some((tx) => tx.btxId == val.id))
          .sortBy((val) => (new Date().getTime() - val.downLatest < DISP.DOWN_RED_TIME)? val.downLatest * -1: val.id)
          .value()
        }

        if (APP.USE_MAGNET) {
          let magnetSensors = await EXCloudHelper.fetchSensor(SENSOR.MAGNET)
        }

        if (payload && payload.done) {
          payload.done()
        }

        this.txsMap = this.txs.reduce((obj, record) => {
          obj[record.btxId] = record.txId
          return obj
        }, {})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    async getDetail(txId) {
      let pot = await AppServiceHelper.fetch('/basic/pot', txId)
      return pot
    },
    showMapImage() {
      if (this.showMapImageDef()) {
        return
      }

      if (!this.txCont) {
        this.txCont = new Container()
        this.txCont.width = this.bitmap.width
        this.txCont.height = this.bitmap.height
        this.stage.addChild(this.txCont)
        this.stage.update()
      }

      let now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + this.count++ * mock.positions_conf.interval  // for mock
      this.positions = PositionHelper.correctPosId(this.orgPositions, now)
      if (APP.USE_MEDITAG && this.meditagSensors) {
        this.positions = SensorHelper.setStress(this.positions, this.meditagSensors)
      }

      this.positionedExb = _(this.exbs).filter((exb) => {
        Util.debug(exb, this.selectedArea)
        return exb.enabled && exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0
      }).value()
      Util.debug(this.positionedExb)
      if (this.positionedExb.length == 0) {
        console.warn("positionedExb is empty. check if exbs are enabled")
      }

      this.showTxAll()
    },
    showTxAll() {
      if (!this.txCont) {
        return
      }
      this.txCont.removeAllChildren()
      this.stage.update()
      PositionHelper.adjustPosition(this.positions, this.mapImageScale, this.positionedExb).forEach((pos) => { // TODO: Txのチェックも追加
        Util.debug(pos)
        this.showTx(pos)
      })
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
    showTx(pos) {
      let tx = this.txs.find((tx) => tx.btxId == pos.btx_id)
      let display = this.getDisplay(tx)

      let stage = this.stage
      let txBtn = new Container()
      let btnBg = new Shape()
      btnBg.graphics.beginStroke("#ccc").beginFill('#' + display.bgColor)
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
      label.font = DISP.TX_FONT
      label.color = '#' + display.color
      label.textAlign = "center"
      label.textBaseline = "middle"
      txBtn.addChild(label)

      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) =>{
        let txBtn = evt.currentTarget
        that.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      })

      this.txCont.addChild(txBtn)
      stage.update()
    },
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
  overflow: scroll;
  height: calc(100vh - 100px);
}

</style>