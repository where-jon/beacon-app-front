<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <div>
      <alert :warn-message="warnMessage" :fix="fixHeight" :alert-style="alertStyle" />

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
import * as ViewHelper from '../../sub/helper/ViewHelper'
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
      items: ViewHelper.createBreadCrumbItems('main', 'thermohumidity'),
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
      thermoPatternConfig: SensorHelper.getThermoPatternConfig(),
      humidityPatternConfig: SensorHelper.getHumidityPatternConfig(),
      exbIcons: [],
      txIcons: [],
      iconInterval: 100,
      warnMessage: null,
      iconAlphaMin: 0.1,
      fixHeight: DISP.THERMOH_ALERT_FIX_HEIGHT,
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
    },
    alertStyle(){
      return {
        'font-weight': DISP.THERMOH_ALERT_WEIGHT,
      }
    },
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
    iconMouseOver(event){
      if(DISP.THERMOH_TOOLTIP_USE){
        this.createTooltip(event.target.parent)
      }
    },
    iconMouseOut(){
      if(DISP.THERMOH_TOOLTIP_USE){
        this.removeTooltip()
      }
    },
    setWarnDevices(){
      this.humidityPatternConfig.less.forEach(conf => {
        conf.exbs = []
        conf.txs = []
      })
      this.humidityPatternConfig.more.forEach(conf => {
        conf.exbs = []
        conf.txs = []
      })
      this.exbIcons.forEach(exbIcon => {
        const alertInfo = SensorHelper.getHumidityInfo(this.humidityPatternConfig, exbIcon.device.humidity)
        if(alertInfo){
          alertInfo.exbs.push(exbIcon.device)
        }
      })
      this.txIcons.forEach(txIcon => {
        const alertInfo = SensorHelper.getHumidityInfo(this.humidityPatternConfig, txIcon.device.humidity)
        if(alertInfo){
          alertInfo.txs.push(txIcon.device)
        }
      })
    },
    createWarnMessages(){
      this.setWarnDevices()
      const ret = []
      const exbIdName = StateHelper.getDeviceIdName({exbId: true}, {ignorePrimaryKey: true})
      const txIdName = StateHelper.getDeviceIdName({txId: true}, {ignorePrimaryKey: true, forceSensorName: true})
      const pattern = this.humidityPatternConfig.more.sort((a, b) => {
        return a.base > b.base? -1: a.base < b.base? 1: 0
      }).concat(this.humidityPatternConfig.less.sort((a, b) => {
        return a.base < b.base? -1: a.base > b.base? 1: 0
      }))
      pattern.forEach(conf => {
        if(conf.exbs.length == 0 && conf.txs.length == 0){
          return
        }
        const exbAlert = conf.exbs.length == 0? '': `${conf.exbs.map(exb => exb[exbIdName]).filter(val => val).join(this.$i18n.tnl('message.readingPoint'))}`
        const txAlert = conf.txs.length == 0? '': `${conf.txs.map(tx => tx[txIdName]).filter(val => val).join(this.$i18n.tnl('message.readingPoint'))}`
        ret.push(this.$i18n.tnl(`message.${conf.label}AlertHumidity`, {
          sensors: `${exbAlert}${exbAlert && txAlert? `${this.$i18n.tnl('message.readingPoint')}`: ''}${txAlert}`,
          humidity: conf.base,
        }))
      })
      return ret.join('')
    },
    addWarnMessage(){
      if(APP.USE_HUMIDITY_ALERT){
        const mes = this.createWarnMessages()
        this.warnMessage = Util.hasValue(mes)? mes: null
        this.replace({showWarn: Util.hasValue(this.warnMessage)})
      }
    },
    iconTick() {
      const allIcons = [this.exbIcons, this.txIcons]
      allIcons.forEach((icons) => {
        icons.forEach((icon) => {
          if(icon.config.flash != null){
            const per = this.iconInterval* 2 / icon.config.flash 
            icon.button.alpha += icon.sign * per
            if(icon.button.alpha < this.iconAlphaMin){
              icon.button.alpha = this.iconAlphaMin
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
          (exb) => exb.sensorId == SENSOR.TEMPERATURE,
          // (exb) => this.getSensorIds(exb).includes(SENSOR.TEMPERATURE),　 一旦単数に戻す
          (exb) => {return {id: SENSOR.TEMPERATURE, ...sensors.find((sensor) => sensor.deviceid == exb.deviceId && (sensor.timestamp || sensor.updatetime))}},
          (exb) => exb.temperature != null
        )

        this.getPositionedTx(
          (tx) => tx.sensorId == SENSOR.TEMPERATURE,
          (tx) => {return {id: SENSOR.TEMPERATURE, ...sensors.find((sensor) => (sensor.btxid == tx.btxId || sensor.btx_id == tx.btxId) && (sensor.timestamp || sensor.updatetime))}},
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
            gradient: HeatmapHelper.createGradient(),
            width: this.$refs.map.width,
            height: this.$refs.map.height,
          },
          this.heatmapData
        )
        // Retina解像度対応
        if (devicePixelRatio > 0) {
          map.style.width = String(map.width / devicePixelRatio) + 'px'
          map.style.height = String(map.height / devicePixelRatio) + 'px'

          const canvasElements = HeatmapHelper.getCanvasElements(mapElement)
          canvasElements.forEach((canvasElement) => {
            canvasElement.style.width = String(map.width) + 'px'
            canvasElement.style.height = String(map.height) + 'px'
          })
        }
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
      btnicon.graphics.beginFill(iconInfo.color).drawCircle(0, 0, DISP.THERMOH_R_SIZE, DISP.THERMOH_R_SIZE)
      btnicon.alpha = DISP.THERMOH_ALPHA
      btnicon.addEventListener('mouseover', this.iconMouseOver)
      btnicon.addEventListener('mouseout', this.iconMouseOut)
      return btnicon
    },
    createButtonLabel(device){
      const text = Util.formatTemperature(device.temperature) + '℃\n' + Util.formatHumidity(device.humidity) + '%'
      const label = new Text(Util.inLabel(DISP.THERMOH_R_SIZE, DISP.THERMOH_FONT, DISP.THERMOH_WITH_LABEL)? text: '')
      label.font = DISP.THERMOH_FONT
      label.color = DISP.THERMOH_COLOR
      label.textAlign = 'center'
      label.textBaseline = 'middle'
      label.y = -5
      label.addEventListener('mouseover', this.iconMouseOver)
      label.addEventListener('mouseout', this.iconMouseOut)
      return label
    },
    showExb(exb) {
      console.log({exb})

      const stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
      }
      const exbBtn = new Container()

      const iconInfo = SensorHelper.getThermohumidityIconInfo(this.thermoPatternConfig, exb.temperature, exb.humidity)
      if (DISP.THERMOH_DISP == 'icon') {
        exbBtn.addChild(this.createIcon(stage, exb))
      }
      else {
        exbBtn.addChild(this.createButtonIcon(exb, iconInfo))
        exbBtn.addChild(this.createButtonLabel(exb))
      }

      exbBtn.deviceId = exb.deviceId
      exbBtn.exbId = exb.exbId
      exbBtn.device = exb
      exbBtn.x = exb.x
      exbBtn.y = exb.y
      exbBtn.cursor = 'pointer'
      stage.enableMouseOver()

      exbBtn.on('click', async (evt) =>{
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/1/' + exb.exbId + '/today/hour', null, pMock)
        sensorData.data = sensorData.data.map(val => {
          if(val.temperature){
            val.temperature = Util.formatTemperature(val.temperature)
          }
          if(val.humidity){
            val.humidity = Util.formatHumidity(val.humidity)
          }
          return val
        })
        this.showChart(exb, sensorData)
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

      const iconInfo = SensorHelper.getThermohumidityIconInfo(this.thermoPatternConfig, tx.temperature, tx.humidity)
      if (DISP.THERMOH_DISP == 'icon') {
        txBtn.addChild(this.createIcon(stage, tx))
      }
      else {
        txBtn.addChild(this.createButtonIcon(tx, iconInfo))
        txBtn.addChild(this.createButtonLabel(tx))
      }

      txBtn.txId = tx.txId
      txBtn.device = tx
      txBtn.x = tx.x
      txBtn.y = tx.y
      txBtn.cursor = 'pointer'
      stage.enableMouseOver()

      txBtn.on('click', async (evt) =>{
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/0/' + tx.txId + '/today/hour', null, pMock)
        sensorData.data = sensorData.data.map(val => {
          val.key = Util.formatDate(val.sensor_dt, 'HH')
          if(val.temperature){
            val.temperature = Util.formatTemperature(val.temperature)
          }
          if(val.humidity){
            val.humidity = Util.formatHumidity(val.humidity)
          }
          return val
        })
        this.showChart(tx, sensorData)
      })

      this.txIcons.push({button: txBtn, device: tx, config: iconInfo, sign: -1})
      this.txCon.addChild(txBtn)
      stage.addChild(this.txCon)
      stage.update()
    },
    removeTooltip() {
      if (this.tooltipCon) {
        this.tooltipCon.removeAllChildren()
      }
    },
    createTooltipInfo(container){
      const device = container.device
      const ret = {
        fontSize: Util.getFont2Size(DISP.THERMOH_FONT),
        sensorName: device.txName? device.txName: device.locationName,
        temperature: Util.formatTemperature(device.temperature),
        humidity: Util.formatHumidity(device.humidity),
        description: Util.cutOnLong(device.description, 10),
      }
      const count = [ret.sensorName, ret.temperature, ret.humidity, ret.description].reduce((a, b) => b? a + 1: a, 0)
      ret.width = ret.fontSize * Util.getMaxTextLength([Util.cutOnLongByte(ret.sensorName, 10, false), ret.temperature, ret.humidity, Util.cutOnLongByte(ret.description, 10, false)])
      ret.height = ret.fontSize * (count + 2)
      const right = container.x + ret.width
      ret.x = right >= this.stage.canvas.width? container.x - ret.width: container.x + 4
      const y = container.y - ret.height
      ret.y = y < 0? container.y + 4: y
      return ret
    },
    createTooltip(container) {
      const stage = this.stage
      stage.enableMouseOver()

      if (!this.tooltipCon) {
        this.tooltipCon = new Container()
        stage.addChild(this.tooltipCon)
      }
      this.removeTooltip()

      const tooltipInfo = this.createTooltipInfo(container)

      const tooltip = new Shape()
      tooltip.graphics.beginFill(DISP.THERMOH_TOOLTIP_BORDERCOLOR)
      tooltip.graphics.drawRoundRect(tooltipInfo.x - 1, tooltipInfo.y - 1, tooltipInfo.width + 2, tooltipInfo.height + 2, DISP.THERMOH_TOOLTIP_ROUNDRECT, DISP.THERMOH_TOOLTIP_ROUNDISP)
      tooltip.graphics.beginFill(DISP.THERMOH_TOOLTIP_BGCOLOR)
      tooltip.graphics.drawRoundRect(tooltipInfo.x, tooltipInfo.y, tooltipInfo.width, tooltipInfo.height, DISP.THERMOH_TOOLTIP_ROUNDRECT, DISP.THERMOH_TOOLTIP_ROUNDISP)
      this.tooltipCon.addChild(tooltip)

      const label = new Text(this.$i18n.tnl('message.positionTooltip',{
        sensorName: tooltipInfo.sensorName,
        temperature: tooltipInfo.temperature,
        humidity: tooltipInfo.humidity,
        description: tooltipInfo.description,
      }))
      label.x = tooltipInfo.x + DISP.THERMOH_TOOLTIP_ROUNDRECT / 2
      label.y = tooltipInfo.y + DISP.THERMOH_TOOLTIP_ROUNDRECT
      label.font = DISP.THERMOH_FONT
      label.color = DISP.THERMOH_TOOLTIP_COLOR
      label.textBaseline = 'middle'
      this.tooltipCon.addChild(label)
      stage.setChildIndex(this.tooltipCon, stage.numChildren - 1)
      stage.update()
    },
    showChart(device, sensorData) {
      SensorHelper.showThermoHumidityChart('dayChart', sensorData.data, this.$i18n)
      this.isShownChart = true
      this.chartTitle = this.$i18n.tnl('message.monthDayTemperature', {
        month: sensorData.month,
        day: sensorData.day,
        name: device.txName? device.txName: device.locationName? device.locationName: '',
        description: device.description? ` : ${Util.cutOnLong(device.description, 10)}`: ''
      })
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