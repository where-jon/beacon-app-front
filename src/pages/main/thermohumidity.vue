<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <b-row class="mt-2">
      <b-form inline @submit.prevent class="mt-2">
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
    <b-modal v-model="isShownChart" size="lg" :title="chartTitle" header-bg-variant="light" hide-footer>
       <b-container fluid style="height:350px;">
         <b-row class="mb-1">
           <b-col cols="12">
            <canvas id="dayChart" width="450" height="200"></canvas>
           </b-col>
         </b-row>
       </b-container>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import txdetail from '../../components/parts/txdetail.vue'
import { DEV, DISP, APP } from '../../sub/constant/config'
import * as mock from '../../assets/mock/mock'
import * as Util from '../../sub/util/Util'
import { SENSOR, DISCOMFORT } from '../../sub/constant/Constants'
import { Shape, Stage, Container, Bitmap, Text, Touch } from '@createjs/easeljs/dist/easeljs.module'
import { Tween, Ticker } from '@createjs/tweenjs/dist/tweenjs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import cold from '../../assets/icon/cold.png'
import hot from '../../assets/icon/hot.png'
import comfort from '../../assets/icon/comfort.png'

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
          text: this.$i18n.tnl('label.main'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.thermohumidity'),
          active: true
        },
      ],
      isShownChart: false,
      chartTitle: "",
      keepExbPosition: false,
      toggleCallBack: () => {
        this.keepExbPosition = true
      },
    }
  },
  computed: {
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
    },
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await this.fetchAreaExbs()

        let sensors = await EXCloudHelper.fetchSensor(SENSOR.TEMPERATURE)

        this.positionedExb = _(this.exbs).filter((exb) => {
          return exb.location && exb.location.areaId == this.selectedArea && exb.location.x && exb.location.y > 0 && this.getSensorId(exb) == SENSOR.TEMPERATURE
        })
        .map((exb) => {
          let sensor = sensors.find((val) => val.deviceid == exb.deviceId && (val.timestamp||val.updatetime))
          return {
            exbId: exb.exbId, deviceId: exb.deviceId, x: exb.location.x, y: exb.location.y,
            humidity: sensor? sensor.humidity: null,
            temperature: sensor? sensor.temperature: null,
            sensorId: SENSOR.TEMPERATURE
          }
        })
        .filter((exb) => exb.temperature != null)
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
      this.showMapImageDef(() => {
        this.positionedExb.forEach((exb) => {
          this.replaceExb(exb, (exb) => {
            exb.x *= this.mapImageScale
            exb.y *= this.mapImageScale
          })
          this.showExb(exb)
        })
        this.keepExbPosition = false
      })
    },
    showExb(exb) {
      console.log({exb})

      let stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
      }
      let exbBtn = new Container()

      if (DISP.THERMOH_DISP == 'icon') {
        let discomfort = SensorHelper.getDiscomfort(exb.temperature, exb.humidity)
        let bitmap = discomfort == DISCOMFORT.COLD? cold: discomfort == DISCOMFORT.COMFORT? comfort: hot
        let icon = new Bitmap(bitmap)
        icon.image.onload = () => {
          icon.x = 0
          icon.y = 0
          icon.scaleX = 40 / icon.image.width
          icon.scaleY = icon.scaleX 
          icon.regX = icon.image.width / 2
          icon.regY = icon.image.height / 2
          stage.update()
        }
        exbBtn.addChild(icon)
      }
      else {
        let btnicon = new Shape()
        let w = DISP.PIR_R_SIZE
        let iconcolor = SensorHelper.getDiscomfortColor(exb.temperature, exb.humidity)
        btnicon.graphics.beginFill(iconcolor).drawCircle(0, 0, w, w)
        btnicon.alpha = 0.5;
        exbBtn.addChild(btnicon)

        let label = new Text(exb.temperature + "℃\n" + exb.humidity + "%")
        label.font = DISP.THERMOH_FONT
        label.color = "black"
        label.textAlign = "center"
        label.textBaseline = "middle"
        label.y = -5
        exbBtn.addChild(label)
      }

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.cursor = 'pointer'
      stage.enableMouseOver()

      exbBtn.on('click', async (evt) =>{
        let exbBtn = evt.currentTarget
        if (DEV.USE_MOCK_EXC) {
          let key = '/basic/sensorHistory/1/1/today/hour'
          var pMock = mock[key]
        }
        let sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/' + exb.exbId + '/today/hour', null, pMock)
        this.showChart(sensorData)
      })

      this.exbCon.addChild(exbBtn)
      stage.addChild(this.exbCon)
      stage.update()
    },
    showChart(sensorData) {
      const dayChart = SensorHelper.showThermoHumidityChart("dayChart", sensorData.data, this.$i18n)
      this.isShownChart = true
      this.chartTitle = this.$i18n.tnl('message.monthDayTemperature', {month: sensorData.month, day: sensorData.day})
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