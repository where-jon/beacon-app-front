<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <div>
      <alert :warn-message="warnMessage" />

      <b-row class="mt-2">
        <b-form inline class="ml-3 mt-2" @submit.prevent>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row>
                <span class="mr-2 d-flex align-items-center">
                  {{ $t('label.area') }}
                </span>
              </b-form-row>
              <b-form-row>
                <b-form-select v-model="selectedArea" :options="areaOptions" required class="ml-2" @change="changeArea" />
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group>
            <b-form-row>
              <b-form-row>
                <b-form-checkbox v-model="isHeatmap" :value="true" :unchecked-value="false">
                  {{ $t('label.showHeatmap') }}
                </b-form-checkbox>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
      </b-row>
      <b-row class="mt-3">
        <canvas v-show="isLoading || !isHeatmap" id="map" ref="map" />
        <div v-show="isLoading || isHeatmap" id="heatmap" ref="heatmap" class="mx-auto" />
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
  </div>
</template>

<script>
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as HeatmapHelper from '../../sub/helper/HeatmapHelper'
import * as Util from '../../sub/util/Util'
import { DEV, APP, DISP } from '../../sub/constant/config'
import * as mock from '../../assets/mock/mock'
import { SENSOR, DISCOMFORT } from '../../sub/constant/Constants'
import { Shape, Container, Bitmap, Text } from '@createjs/easeljs/dist/easeljs.module'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import cold from '../../assets/icon/cold.png'
import hot from '../../assets/icon/hot.png'
import comfort from '../../assets/icon/comfort.png'

export default {
  components: {
    breadcrumb,
    alert,
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
      keepTxPosition: false,
      toggleCallBack: () => {
        this.keepExbPosition = true
        this.keepTxPosition = true
      },
      noImageErrorKey: 'noMapImage',
      isHeatmap: false,
      isLoading: false,
      iconTicker: null,
      iconConfig: SensorHelper.getThermohumidityIconConfig(),
      exbIcons: [],
      txIcons: [],
      iconInterval: 100,
      warnMessage: null,
    }
  },
  computed: {
    heatmapData() {
      const dataList = this.positionedTx.concat(this.positionedExb)
      return HeatmapHelper.collect(dataList,
        {max: DISP.TEMPERATURE_MAX, min: DISP.TEMPERATURE_MIN},
        (data) => `${data.x}-${data.y}`,
        (result, data) => data.temperature,
        (data) => {return {x: data.x * this.mapImageScale, y: data.y * this.mapImageScale}}
      )
    }
  },
  mounted() {
    this.fetchData()
  },
  beforeDestroy(){
    this.removeTick()
  },
  methods: {
    reset() {
      this.isShownMapImage = false
    },
    addTick(){
      this.removeTick()
      this.iconTicker = setInterval(this.iconTick, this.iconInterval)
    },
    removeTick(){
      if(this.iconTicker){
        clearInterval(this.iconTicker)
        this.iconTicker = null
      }
    },
    getWarnDevices(){
      const exbRet = this.exbIcons.filter((val) => val.device.humidity >= APP.HUMIDITY_ALERT).map((val) => StateHelper.getDeviceId(val.device))
      const txRet = this.txIcons.filter((val) => val.device.humidity >= APP.HUMIDITY_ALERT).map((val) => StateHelper.getDeviceId(val.device))
      return {
        exbWarn: Util.hasValue(exbRet)? this.$i18n.tnl(`label.${StateHelper.getDeviceIdName({exbId: true})}`): null,
        exb: exbRet,
        txWarn: Util.hasValue(txRet)? this.$i18n.tnl(`label.${StateHelper.getDeviceIdName({txId: true})}`): null,
        tx: txRet
      }
    },
    addWarnMessage(){
      if(APP.USE_HUMIDITY_ALERT){
        const warnDevices = this.getWarnDevices()
        const exbMessage = warnDevices.exbWarn? `${warnDevices.exbWarn}[${warnDevices.exb}]`: ''
        const txMessage = warnDevices.txWarn? `${warnDevices.txWarn}[${warnDevices.tx}]`: ''
        const sensorMessage = [exbMessage, txMessage].filter((val) => val).join(', ')
        if(Util.hasValue(sensorMessage)){
          this.warnMessage = this.$i18n.tnl('message.alertHumidity', {
            sensors: sensorMessage,
            humidity: APP.HUMIDITY_ALERT
          })
          this.replace({showWarn: true})
        }
      }
    },
    iconTick() {
      const allIcons = [this.exbIcons, this.txIcons]
      allIcons.forEach((icons) => {
        icons.forEach((icon) => {
          if(icon.config.flash != null){
            const per = this.iconInterval* 2 / icon.config.flash 
            icon.button.alpha += icon.sign * per
            if(icon.button.alpha < 0){
              icon.button.alpha = 0
              icon.sign *= -1
            }
            if(icon.button.alpha > 1){
              icon.button.alpha = 1
              icon.sign *= -1
            }
          }
        })
      })
      this.stage.update()
    },
    async fetchData(payload) {
      try {
        this.removeTick()
        this.replace({showWarn: false})
        this.showProgress()
        await this.fetchAreaExbs(true)

        const sensors = await EXCloudHelper.fetchSensor(SENSOR.TEMPERATURE)

        this.getPositionedExb(
          (exb) => this.getSensorId(exb) == SENSOR.TEMPERATURE,
          (exb) => {return {id: SENSOR.TEMPERATURE, ...sensors.find((sensor) => sensor.deviceid == exb.deviceId && (sensor.timestamp || sensor.updatetime))}},
          (exb) => exb.temperature != null
        )

        this.getPositionedTx(
          (tx) => tx.sensorId == SENSOR.TEMPERATURE,
          (tx) => {return {id: SENSOR.TEMPERATURE, ...sensors.find((sensor) => sensor.btx_id == tx.btxId && (sensor.timestamp || sensor.updatetime))}},
          (tx) => tx.temperature != null
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
    createHeatmap(onLoad){
      HeatmapHelper.create('heatmap', this.mapImage(), (evt, mapElement, map) => {
        map.width = this.$refs.map.width
        map.height = this.$refs.map.height
        HeatmapHelper.draw(
          mapElement, 
          {
            radius: DISP.TEMPERATURE_RADIUS * this.mapImageScale,
            gradient: HeatmapHelper.createGradient()
          },
          this.heatmapData
        )
        onLoad && onLoad()
      })
    },
    showMapImage() {
      this.isLoading = true
      this.exbIcons = []
      this.txIcons = []
      this.showMapImageDef(() => {
        this.resetExb()
        this.resetTx()
        this.isLoading = false
        this.addTick()
        this.addWarnMessage()
      })
      this.createHeatmap(() => {
        this.isLoading = false
      })
    },
    createIcon(stage, exb){
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
      return icon
    },
    createButtonIcon(device, iconInfo){
      const btnicon = new Shape()
      btnicon.graphics.beginFill(iconInfo.color).drawCircle(0, 0, DISP.PIR_R_SIZE, DISP.PIR_R_SIZE)
      btnicon.alpha = DISP.THERMON_ALPHA
      return btnicon
    },
    createButtonLabel(device){
      const label = new Text(device.temperature + '℃\n' + device.humidity + '%')
      label.font = DISP.THERMOH_FONT
      label.color = 'black'
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      label.y = -5
      return label
    },
    showExb(exb) {
      console.log({exb})

      const stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
      }
      const exbBtn = new Container()

      const iconInfo = SensorHelper.getThermohumidityIconInfo(this.iconConfig, exb.temperature, exb.humidity)
      if (DISP.THERMOH_DISP == 'icon') {
        exbBtn.addChild(this.createIcon(stage, exb))
      }
      else {
        exbBtn.addChild(this.createButtonIcon(exb, iconInfo))
        exbBtn.addChild(this.createButtonLabel(exb))
      }

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.cursor = 'pointer'
      stage.enableMouseOver()

      exbBtn.on('click', async (evt) =>{
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/1/' + exb.exbId + '/today/hour', null, pMock)
        this.showChart(sensorData)
      })

      this.exbIcons.push({button: exbBtn, device: exb, config: iconInfo, sign: -1})
      this.exbCon.addChild(exbBtn)
      stage.addChild(this.exbCon)
      stage.update()
    },
    showTx(tx) {
      const stage = this.stage
      if (!this.txCon) {
        this.txCon = new Container()
      }
      const txBtn = new Container()

      const iconInfo = SensorHelper.getThermohumidityIconInfo(this.iconConfig, tx.temperature, tx.humidity)
      if (DISP.THERMOH_DISP == 'icon') {
        txBtn.addChild(this.createIcon(stage, tx))
      }
      else {
        txBtn.addChild(this.createButtonIcon(tx, iconInfo))
        txBtn.addChild(this.createButtonLabel(tx))
      }

      txBtn.txId = tx.txId
      txBtn.x = tx.x
      txBtn.y = tx.y
      txBtn.cursor = 'pointer'
      stage.enableMouseOver()

      txBtn.on('click', async (evt) =>{
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/0/' + tx.txId + '/today/hour', null, pMock)
        this.showChart(sensorData)
      })

      this.txIcons.push({button: txBtn, device: tx, config: iconInfo, sign: -1})
      this.txCon.addChild(txBtn)
      stage.addChild(this.txCon)
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