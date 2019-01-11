<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :reload="true" />
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <label class="ml-3 mr-2">
          {{ $t('label.area') }}
        </label>
        <b-form-select v-model="selectedArea" :options="areaOptions" required class="ml-2" @change="changeArea" />
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map" />
    </b-row>
    <div v-if="selectedTx.btxId && showReady">
      <txdetail :selected-tx="selectedTx" :selected-sensor="[]" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/PositionHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as Util from '../../sub/util/Util'
import txdetail from '../../components/parts/txdetail.vue'
import { DISP, APP } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'
import { Shape, Container, Text } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'

export default {
  components: {
    breadcrumb,
    'txdetail': txdetail,
  },
  mixins: [showmapmixin],
  data() {
    return {
      keepExbPosition: false,
      toggleCallBack: () => {
        this.keepExbPosition = true
        this.reset()
      },
      noImageErrorKey: 'noMapImage',
      items: [
        {
          text: this.$i18n.tnl('label.main'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.pir'),
          active: true
        },
      ],
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
    ]),
    ...mapState('app_service', [
      'txs',
      'forceFetchTx',
    ]),
    ...mapState([
      'reload',
    ]),
  },
  mounted() {
    document.addEventListener('touchstart', this.touchEnd)
    this.fetchData()
  },
  beforeDestroy() {
    this.resetDetail()
  },
  methods: {
    async fetchData(payload) {
      try {
        this.reloadSelectedTx = this.reload? this.selectedTx: {}
        this.replace({reload: false})
        this.showProgress()
        await this.fetchAreaExbs(true)

        const pirSensors = await EXCloudHelper.fetchSensor(SENSOR.PIR)
        const thermopileSensors = APP.USE_THERMOPILE? await EXCloudHelper.fetchSensor(SENSOR.THERMOPILE): []

        this.getPositionedExb(
          null,
          (exb) => {
            const pir = pirSensors.find((val) => val.deviceid == exb.deviceId && val.count >= DISP.PIR_MIN_COUNT)
            const thermopile = thermopileSensors.find((val) => val.deviceid == exb.deviceId)
            console.log({exb, pir, thermopile, pirSensors, thermopileSensors})
            return pir? {id: SENSOR.PIR, ...pir}: thermopile? {id: SENSOR.THERMOPILE, ...thermopile}: null
          },
          (exb) => exb.count > 0 || DISP.PIR_EMPTY_SHOW
        )

        if (APP.SHOW_MAGNET_ON_PIR) {
          await StateHelper.load('tx', this.forceFetchTx)
          StateHelper.setForceFetch('tx', false)
          await this.storePositionHistory(this.count)
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
      this.hideProgress()
    },
    showMapImage() {
      this.showMapImageDef(() => {
        this.resetExb()

        if (APP.SHOW_MAGNET_ON_PIR) {
          this.stage.on('click', (evt) => {
            this.resetDetail()
          })
          this.setPositionedExb()
          this.showTxAll()
        }
      })
    },
    showExb(exb) {
      console.log({exb})

      const stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
        stage.addChild(this.exbCon)
      }
      const exbBtn = new Container()
      if (exb.sensorId == SENSOR.THERMOPILE) {
        // not use?
        // if (exb.count > 10) {
        //   w = DISP.THERMOPILE_L_SIZE
        // }
        // else if (exb.count > 5) {
        //   w = DISP.THERMOPILE_M_SIZE          
        // }
        // else {
        //   w = DISP.THERMOPILE_S_SIZE
        // }

        // only for Exhibition（delete immediately）
        let label = new Text(exb.count + '名','bold 32px Arial','#FF3222')
        label.textAlign = 'center'
        label.textBaseline = 'middle'
        exbBtn.addChild(label)
        exbBtn.x = exb.x
        exbBtn.y = exb.y
        exbBtn.cursor = ''
        this.exbCon.addChild(exbBtn)
        stage.update()
        return 
      }

      const w = DISP.PIR_R_SIZE
      const btnBg = new Shape()
      const bgColor = (exb.count > 0)? DISP.PIR_BGCOLOR: DISP.PIR_EMPTY_BGCOLOR
      btnBg.graphics.beginFill(bgColor).drawCircle(0, 0, w, w)
      // btnBg.alpha = 0.9;
      exbBtn.addChild(btnBg)

      if (DISP.PIR_INUSE_LABEL || DISP.PIR_EMPTY_LABEL) {
        const label = new Text(this.$i18n.tnl('label.' + (exb.count > 0? DISP.PIR_INUSE_LABEL: DISP.PIR_EMPTY_LABEL)))
        label.font = exb.count > 0? DISP.PIR_INUSE_FONT: DISP.PIR_EMPTY_FONT
        label.color = DISP.PIR_FGCOLOR
        label.textAlign = 'center'
        label.textBaseline = 'middle'
        exbBtn.addChild(label)
      }

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.cursor = ''

      this.exbCon.addChild(exbBtn)
      stage.update()
    },
    showTxAll() {
      if (!this.txCont) {
        this.txCont = new Container()
        this.txCont.width = this.bitmap.width
        this.txCont.height = this.bitmap.height
        this.stage.addChild(this.txCont)
        this.stage.update()
      }
      if (!this.txCont) {
        this.txCont.removeAllChildren()
      }
      this.stage.update()
      // for debug
      this.disableExbsCheck()
      const position = PositionHelper.adjustPosition(this.positions(), this.mapImageScale, this.positionedExb)
      position.forEach((pos) => { // TODO: Txのチェックも追加
        this.showTx(pos)
      })
      this.reShowTx(position)
    },
    showTx(pos) {
      const tx = this.txs.find((tx) => tx.btxId == pos.btx_id)
      Util.debug('showTx', pos, tx && tx.sensor)
      if (!tx) {
        console.warn('tx not found. btx_id=' + pos.btx_id)
        return
      }
      if (tx.sensorId != SENSOR.MAGNET) {
        return
      }
      const magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btx_id == tx.btxId)
      Util.debug('magnet', magnet)

      const display = this.getDisplay(tx)
      const color = this.isMagnetOn(magnet)? display.bgColor : display.color
      const bgColor = this.isMagnetOn(magnet)? display.color: display.bgColor
      const txBtn = this.createTxBtn(pos, display.shape, color, bgColor)

      if(this.reloadSelectedTx.btxId == pos.btx_id){
        this.showingDetailTime = new Date().getTime()
        this.showDetail(txBtn.txId, txBtn.x, txBtn.y)
      }
      this.txCont.addChild(txBtn)
      this.stage.update()
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

::-webkit-scrollbar { 
  display: none; 
}


</style>