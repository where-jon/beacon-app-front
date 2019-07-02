<template>
  <div id="mapContainer" class="container-fluid" @click="resetDetail">
    <breadcrumb :items="items" :reload="true" :state="reloadState" />
    <b-row class="mt-2">
      <b-form inline class="mt-2" @submit.prevent>
        <label class="ml-3 mr-2">
          {{ $t('label.area') }}
        </label>
        <span :title="vueSelectTitle(vueSelected.area)">
          <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="ml-1 vue-options" :style="vueSelectStyle">
            <template slot="selected-option" slot-scope="option">
              {{ vueSelectCutOn(option, true) }}
            </template>
          </v-select>
        </span>
      </b-form>
    </b-row>
    <b-row class="mt-3">
      <canvas id="map" ref="map" @click="closeVueSelect" />
    </b-row>
    <div v-if="selectedTx.btxId && showReady">
      <txdetail :selected-tx="selectedTx" :selected-sensor="[]" :is-show-modal="isShowModal()" @resetDetail="resetDetail" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Container } from '@createjs/easeljs/dist/easeljs.module'
import { APP, DISP } from '../../sub/constant/config'
import { SENSOR, TX } from '../../sub/constant/Constants'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as IconHelper from '../../sub/helper/IconHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import txdetail from '../../components/parts/txdetail.vue'

export default {
  components: {
    breadcrumb,
    'txdetail': txdetail,
  },
  mixins: [commonmixin, showmapmixin],
  data() {
    return {
      items: ViewHelper.createBreadCrumbItems('main', 'pirMenu'),
      keepExbPosition: false,
      noImageErrorKey: 'noMapImage',
      INUSE_FONTSIZE_RATIO: 0.9,
      FONTSIZE_RATIO_EN: 0.5,
      EMPTY_FONTSIZE_RATIO: 1.2,
      reloadState: {isLoad: false, initialize: false},
      toggleCallBack: () => {
        this.keepExbPosition = true
        this.reset()
      },
    }
  },
  computed: {
    ...mapState('main', [
      'selectedTx',
    ]),
    ...mapState('app_service', [
      'txs',
    ]),
    ...mapState([
      'reload',
    ]),
  },
  watch: {
    'vueSelected.area': {
      handler: function(newVal, oldVal){
        this.selectedArea = Util.getValue(newVal, 'value', null)
        this.changeArea(this.selectedArea)
      },
      deep: true,
    },
  },
  mounted() {
    document.addEventListener('touchstart', this.touchEnd)
    // this.fetchData()
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
        const pressureSensors = APP.SENSOR.USE_PRESSURE? await EXCloudHelper.fetchSensor(SENSOR.PRESSURE): []
        const thermopileSensors = APP.SENSOR.USE_THERMOPILE? await EXCloudHelper.fetchSensor(SENSOR.THERMOPILE): []

        this.getPositionedExb(
          null,
          (exb) => {
            const pir = pirSensors.find((val) => val.deviceid == exb.deviceId && val.count >= DISP.PIR.MIN_COUNT)
            const pressure = pressureSensors.find((val) => val.deviceid == exb.deviceId && val.press_vol != null)
            const thermopile = thermopileSensors.find((val) => val.deviceid == exb.deviceId)
            Util.debug({exb, pir, pressure, thermopile, pirSensors, pressureSensors, thermopileSensors})
            return pir? {id: SENSOR.PIR, ...pir}: pressure? {id: SENSOR.PRESSURE, count: pressure.press_vol, ...pressure}: thermopile? {id: SENSOR.THERMOPILE, ...thermopile}: null
          },
          (exb) => exb.sensorId == SENSOR.PRESSURE? exb.count <= DISP.PRESSURE.VOL_MIN || DISP.PRESSURE.EMPTY_SHOW: exb.count > 0 || DISP.PIR.EMPTY_SHOW
        )

        if (APP.SENSOR.SHOW_MAGNET_ON_PIR) {
          await StateHelper.load('tx')
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

        if (APP.SENSOR.SHOW_MAGNET_ON_PIR) {
          this.stage.on('click', (evt) => {
            this.resetDetail()
          })
          this.setPositionedExb()
          this.showTxAll()
        }
      })
    },
    createCountButton(count){
      const scale = this.getMapScale()
      const label = IconHelper.createCircleIcon(this.$i18n.tnl('message.count', {count}), DISP.PIR.R_SIZE / scale, '#FF3222', '#FFFFFF', {bold: true, circle: false, alpha: 0, fontSize: 40 / scale})
      label.cursor = ''
      return label
    },
    createShapeInfo(sensorId, count){
      if(sensorId == SENSOR.PRESSURE){
        return {
          bgColor: (count <= DISP.PRESSURE.VOL_MIN)? DISP.PRESSURE.BGCOLOR: DISP.PRESSURE.EMPTY_BGCOLOR,
          width: DISP.PRESSURE.R_SIZE,
        }
      }
      return {
        bgColor: (count > 0)? DISP.PIR.BGCOLOR: DISP.PIR.EMPTY_BGCOLOR,
        width: DISP.PIR.R_SIZE,
      }
    },
    createLabelInfo(sensorId, count){
      if(sensorId == SENSOR.PRESSURE){
        return {
          label: this.$i18n.tnl('label.' + (count <= DISP.PRESSURE.VOL_MIN? DISP.PRESSURE.INUSE_LABEL: DISP.PRESSURE.EMPTY_LABEL)),
          color: DISP.PRESSURE.FGCOLOR
        }
      }
      return {
        label: this.$i18n.tnl('label.' + (count > 0? DISP.PIR.INUSE_LABEL: DISP.PIR.EMPTY_LABEL)),
        color: DISP.PIR.FGCOLOR
      }
    },
    createIcon(sensorId, count){
      const scale = this.getMapScale()
      const shapeInfo = this.createShapeInfo(sensorId, count)
      const labelInfo = this.createLabelInfo(sensorId, count)
      return IconHelper.createCircleIcon(labelInfo.label, shapeInfo.width / scale, labelInfo.color, shapeInfo.bgColor, {bold: false})
    },
    showExb(exb) {
      if (!ArrayUtil.equalsAny(exb.sensorId, [SENSOR.PIR, SENSOR.PRESSURE, SENSOR.THERMOPILE])) {
        return
      }

      if (!this.exbCon) {
        this.exbCon = new Container()
        this.stage.addChild(this.exbCon)
      }
      let exbBtn = null
      if (exb.sensorId == SENSOR.THERMOPILE && exb.count != null) {
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
        exbBtn = this.createCountButton(exb.count)
      }
      else {
        exbBtn = this.createIcon(exb.sensorId, exb.count)
      }

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.cursor = ''

      this.exbCon.addChild(exbBtn)
      this.stage.update()
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

      //　表示条件：マグネットセンサ、固定位置登録＆同一エリア、PIR画面表示設定
      _(this.txs).filter((tx) => tx.sensorId == SENSOR.MAGNET && tx.location && tx.location.x * tx.location.y > 0 
        && tx.location.areaId == this.selectedArea && NumberUtil.bitON(tx.disp, TX.DISP.PIR))
        .forEach((tx) => {
          this.showTx(tx)
        })
    },
    showTx(tx) {
      Util.debug('showTx', tx)
      const magnet = this.magnetSensors && this.magnetSensors.find((sensor) => sensor.btxid == tx.btxId || sensor.btx_id == tx.btxId)
      Util.debug('magnet', magnet)

      const magnetOn = (magnet.magnet == SENSOR.MAGNET_STATUS.ON)
      const count = (APP.SENSOR.MAGNET_ON_IS_USED && magnetOn || !APP.SENSOR.MAGNET_ON_IS_USED && !magnetOn)? 1: 0
      const txBtn = this.createIcon(tx.sensorId, count)

      txBtn.x = tx.location.x
      txBtn.y = tx.location.y
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
@import "../../sub/constant/browser.scss";
@import "../../sub/constant/vue.scss";
</style>