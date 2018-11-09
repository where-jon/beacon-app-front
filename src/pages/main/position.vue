<template>
    <div id="mapContainer" class="container-fluid" @click="resetDetail" >
      <breadcrumb :items="items" :extraNavSpec="extraNavSpec" :reload="true" :shortName="shortName" />
      <b-row class="mt-2">
        <b-form inline class="mt-2">
          <label class="ml-3 mr-2">{{ $t('label.area') }}</label>
          <b-form-select v-model="selectedArea" :options="areaOptions" @change="changeArea" required class="ml-2"></b-form-select>
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
        <txdetail :selectedTx="selectedTx" @resetDetail="resetDetail" :selectedSensor="selectedSensor" :isShowModal="isShowModal" />
      </div>
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
import { SHAPE, SENSOR, EXTRA_NAV, POSITION } from '../../sub/constant/Constants'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import showmapmixin from '../../components/showmapmixin.vue'
import sensor from '../../components/sensor.vue'
import moment from 'moment'
import { rightpanewidth, rightpaneleft } from '../../sub/constant/config.scss'

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
      showReady: false,
      shortName: this.$i18n.tnl('label.showPositionShort'),
      extraNavSpec: EXTRA_NAV,
      shwoIconMinWidth: POSITION.SHOW_ICON_MIN_WIDTH,
      isShowModal: false
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
      'orgPositions',
    ]),
    selectedSensor() {
      if (this.selectedTx && this.selectedTx.btxId) {
        var ret = this.getMeditagSensor(this.selectedTx.btxId)
      }
      return ret? [ret]: []
    }
  },
  mounted() {
    this.replace({title: this.$i18n.tnl('label.showPosition')})
    this.fetchData()
  },
  beforeDestroy() {
    this.resetDetail()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
      this.resetDetail()
    },
    async showDetail(btxId, x, y) {
      const tipOffsetX = 15
      const tipOffsetY = 15
      const popupHeight = this.getMeditagSensor(btxId)? 236: 156
      let tx = this.txs.find((tx) => tx.btxId == btxId)
      let display = this.getDisplay(tx)
      let map = HtmlUtil.getRect("#map")
      let containerParent = HtmlUtil.getRect("#mapContainer", "parentNode")
      let offsetX = map.left - containerParent.left
      let offsetY = map.top - containerParent.top
      const isDispRight = x + offsetX + 100 < window.innerWidth
      // rev === trueの場合、ポップアップを上に表示
      const rev = y + map.top + DISP.TX_R + tipOffsetY + popupHeight > window.innerHeight
      const targetId = this.txsMap[btxId]
      const p = await this.getDetail(targetId)
      const position = this.positions.find((e) => {
        return e.btx_id === btxId
      })
      const balloonClass = !btxId ? "": "balloon" + (rev ? "-u": "-b")
      let selectedTx = {
        btxId,
        minor: 'minor:' + btxId,
        major: p.tx && p.tx.major? 'major:' + p.tx.major : '',
        class: balloonClass,
        left: x + offsetX - DISP.TX_R,
        top: rev ? y + offsetY - DISP.TX_R - popupHeight : y + offsetY + DISP.TX_R + tipOffsetY,
        name: p.potName ? p.potName : '',
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
    },
    getMeditagSensor(btxId) {
      if (this.meditagSensors) {
        return this.meditagSensors.find((val) => btxId == val.btx_id)
      }
      return null
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

        if (APP.USE_MEDITAG) {
          let meditagSensors = await EXCloudHelper.fetchSensor(SENSOR.MEDITAG)
          this.meditagSensors = _(meditagSensors)
          .filter((val) => this.txs.some((tx) => tx.btxId == val.btx_id))
          .map((val) => {
              let tx = this.txs.find((tx) => tx.btxId == val.btx_id)
              let label = tx && tx.displayName? tx.displayName: val.btx_id
              return {...val, label, bg: SensorHelper.getStressBg(val.stress), down: val.down?val.down:0}
          })
          .sortBy((val) => (new Date().getTime() - val.downLatest < DISP.DOWN_RED_TIME)? val.downLatest * -1: val.btx_id)
          .value()
        }

        if (APP.USE_MAGNET) {
          this.magnetSensors = await EXCloudHelper.fetchSensor(SENSOR.MAGNET)
        }

        this.showMapImage()

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
      this.showMapImageDef(() => {

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
      })
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

      if (this.selectedTx.btxId) {
        const tx = this.selectedTx
        const position = PositionHelper.adjustPosition(this.positions, this.mapImageScale, this.positionedExb)
            .filter((pos) => pos.btx_id == tx.btxId)
        if (position.length == 1) {
          this.showDetail(tx.btxId, position[0].x, position[0].y)
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
    showTx(pos) {
      let tx = this.txs.find((tx) => tx.btxId == pos.btx_id)
      if (!tx) {
        console.warn("tx not found. btx_id=" + pos.btx_id)
        return
      }
      if (tx.sensorId === SENSOR.MAGNET) {
        var magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btx_id == tx.btxId)
      }
      let display = this.getDisplay(tx)

      let stage = this.stage
      let txBtn = new Container()
      let btnBg = new Shape()
      let bgColor = (magnet && magnet.magnet == SENSOR.MAGNET_STATUS.ON)? display.color: display.bgColor
      let color = (magnet && magnet.magnet == SENSOR.MAGNET_STATUS.ON)? display.bgColor : display.color
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
      label.font = DISP.TX_FONT
      label.color = '#' + color
      label.textAlign = "center"
      label.textBaseline = "middle"
      txBtn.addChild(label)

      txBtn.txId = pos.btx_id
      txBtn.x = pos.x
      txBtn.y = pos.y
      txBtn.on('click', (evt) => {
        let txBtn = evt.currentTarget
        this.isShowModal = window.innerWidth < this.shwoIconMinWidth
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
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

.clearfix:after {
  content: "";
  display: block;
  clear: both;
}

.description {
  float: left;
  font-weight: bold;
  padding-left: 10px;
}

.thumbnail {
  float: left;
  vertical-align: middle;
}

</style>