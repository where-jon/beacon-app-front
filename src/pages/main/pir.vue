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
      <canvas id="map" ref="map"></canvas>
    </b-row>
    <!-- modal -->
    <b-modal id="modalError" :title="$t('label.error')" ok-only>
      {{ $t('message.noMapImage') }}
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import txdetail from '../../components/txdetail.vue'
import { DEV, DISP, APP } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/breadcrumb.vue'
import showmapmixin from '../../components/showmapmixin.vue'

let that

export default {
  mixins: [showmapmixin],
  components: {
    'txdetail': txdetail,
    breadcrumb,
  },
  data() {
     return {
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.pir'),
          active: true
        },
      ],
    }
  },
  computed: {
  },
  mounted() {
    that = this
    this.replace({title: this.$i18n.t('label.pir')})
    this.fetchData()
  },
  updated(){
    if (this.isFirstTime) return
    // this.fetchData()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await this.fetchAreaExbs()

        let pirSensors = await EXCloudHelper.fetchSensor(SENSOR.PIR)
        let thermopileSensors = APP.USE_THERMOPILE? await EXCloudHelper.fetchSensor(SENSOR.THERMOPILE): []

        this.positionedExb = _(this.exbs).filter((exb) => {
          return exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0 // && Util.equalsAny(that.getSensorId(exb), [SENSOR.PIR, SENSOR.THERMOPILE])
        })
        .map((exb) => {
          let pir = pirSensors.find((val) => val.deviceid == exb.deviceId && val.count >= DISP.PIR_MIN_COUNT)
          let thermopile = thermopileSensors.find((val) => val.deviceid == exb.deviceId && val.count > 0)
          console.log({exb, pir, thermopile, pirSensors, thermopileSensors})
          return {
            exbId: exb.exbId, deviceId: exb.deviceId, x: exb.location.x, y: exb.location.y,
            count: pir? pir.count: thermopile? thermopile.count: 0,
            sensorId: pir? SENSOR.PIR: thermopile? SENSOR.THERMOPILE: null
          }
        })
        .filter((exb) => exb.count > 0 || DISP.PIR_EMPTY_SHOW)
        .value()

        if (payload && payload.done) {
          payload.done()
        }
        this.showMapImage()
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
    showMapImage() {
      if (this.showMapImageDef()) {
        return
      }

      if (this.exbCon) {
        this.exbCon.removeAllChildren()
      }
      this.positionedExb.forEach((exb) => {
        exb.x *= this.mapImageScale
        exb.y *= this.mapImageScale
        this.showExb(exb)
      })

    },
    showExb(exb) {
      console.log({exb})

      let stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
      }
      let exbBtn = new Container()
      let btnBg = new Shape()
      let w = DISP.PIR_R_SIZE
      if (exb.sensorId == SENSOR.THERMOPILE) {
        if (exb.count > 10) {
          w = DISP.THERMOPILE_L_SIZE
        }
        else if (exb.count > 5) {
          w = DISP.THERMOPILE_M_SIZE          
        }
        else {
          w = DISP.THERMOPILE_S_SIZE
        }

        // only for Exhibition（delete immediately）
        let label = new Text(exb.count + "名","bold 32px Arial","#FF3222")
        label.textAlign = "center"
        label.textBaseline = "middle"
        exbBtn.addChild(label)
        exbBtn.x = exb.x
        exbBtn.y = exb.y
        exbBtn.cursor = ""
        this.exbCon.addChild(exbBtn)
        stage.addChild(this.exbCon)
        stage.update()
        return 
      }

      let bgColor = (exb.count > 0)? DISP.PIR_BGCOLOR: DISP.PIR_EMPTY_BGCOLOR
      btnBg.graphics.beginFill(bgColor).drawCircle(0, 0, w, w)
      // btnBg.alpha = 0.9;
      exbBtn.addChild(btnBg)

      if (DISP.PIR_INUSE_LABEL || DISP.PIR_EMPTY_LABEL) {
        let label = new Text(this.$i18n.t("label." + (exb.count > 0? DISP.PIR_INUSE_LABEL: DISP.PIR_EMPTY_LABEL)))
        label.font = exb.count > 0? DISP.PIR_INUSE_FONT: DISP.PIR_EMPTY_FONT
        label.color = DISP.PIR_FGCOLOR
        label.textAlign = "center"
        label.textBaseline = "middle"
        exbBtn.addChild(label)
      }

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.cursor = ""

      this.exbCon.addChild(exbBtn)
      stage.addChild(this.exbCon)
      stage.update()
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";

::-webkit-scrollbar { 
  display: none; 
}


</style>