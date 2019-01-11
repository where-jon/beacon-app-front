<template>
  <div id="mapContainer" class="container-fluid">
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
    <b-modal v-model="isShownChart" :title="chartTitle" size="lg" header-bg-variant="light" hide-footer>
      <b-container fluid style="height:350px;">
        <b-row class="mb-1">
          <b-col cols="12">
            <canvas id="dayChart" width="450" height="200" />
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import { DEV, DISP } from '../../sub/constant/config'
import * as mock from '../../assets/mock/mock'
import { SENSOR, DISCOMFORT } from '../../sub/constant/Constants'
import { Shape, Container, Bitmap, Text } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import cold from '../../assets/icon/cold.png'
import hot from '../../assets/icon/hot.png'
import comfort from '../../assets/icon/comfort.png'

export default {
  components: {
    breadcrumb,
  },
  mixins: [showmapmixin],
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
      chartTitle: '',
      keepExbPosition: false,
      toggleCallBack: () => {
        this.keepExbPosition = true
      },
      noImageErrorKey: 'noMapImage',
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
        this.showProgress()
        await this.fetchAreaExbs()

        const sensors = await EXCloudHelper.fetchSensor(SENSOR.TEMPERATURE)

        this.getPositionedExb(
          (exb) => this.getSensorId(exb) == SENSOR.TEMPERATURE,
          (exb) => {return {id: SENSOR.TEMPERATURE, ...sensors.find((val) => val.deviceid == exb.deviceId && (val.timestamp || val.updatetime))}},
          (exb) => exb.temperature != null
        )

        if (payload && payload.done) {
          payload.done()
        }
        this.showMapImage()
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    showMapImage() {
      this.showMapImageDef(() => {
        this.resetExb()
      })
    },
    showExb(exb) {
      console.log({exb})

      const stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
      }
      const exbBtn = new Container()

      if (DISP.THERMOH_DISP == 'icon') {
        const discomfort = SensorHelper.getDiscomfort(exb.temperature, exb.humidity)
        const bitmap = discomfort == DISCOMFORT.COLD? cold: discomfort == DISCOMFORT.COMFORT? comfort: hot
        const icon = new Bitmap(bitmap)
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
        const btnicon = new Shape()
        const w = DISP.PIR_R_SIZE
        const iconcolor = SensorHelper.getDiscomfortColor(exb.temperature, exb.humidity)
        btnicon.graphics.beginFill(iconcolor).drawCircle(0, 0, w, w)
        btnicon.alpha = 0.5
        exbBtn.addChild(btnicon)

        const label = new Text(exb.temperature + '℃\n' + exb.humidity + '%')
        label.font = DISP.THERMOH_FONT
        label.color = 'black'
        label.textAlign = 'center'
        label.textBaseline = 'middle'
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
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/' + exb.exbId + '/today/hour', null, pMock)
        this.showChart(sensorData)
      })

      this.exbCon.addChild(exbBtn)
      stage.addChild(this.exbCon)
      stage.update()
    },
    showChart(sensorData) {
      SensorHelper.showThermoHumidityChart('dayChart', sensorData.data, this.$i18n)
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