<template>
  <div id="mapContainer" class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" />
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
                <span :title="vueSelectTitle(vueSelected.area)">
                  <v-select v-model="vueSelected.area" :options="areaOptions" :clearable="false" class="ml-2 vue-options" :style="vueSelectStyle">
                    <template slot="selected-option" slot-scope="option">
                      {{ vueSelectCutOn(option, true) }}
                    </template>
                    <template slot="no-options">
                      {{ vueSelectNoMatchingOptions }}
                    </template>
                  </v-select>
                </span>
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group>
            <b-form-row>
              <b-form-row>
                <b-form-checkbox v-if="useHeatMap" v-model="isHeatmap" :value="true" :unchecked-value="false">
                  {{ $t('label.showHeatmap') }}
                </b-form-checkbox>
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
      </b-row>
      <b-row class="mt-3">
        <canvas v-show="isLoading || !isHeatmap" id="map" ref="map" @click="closeVueSelect" />
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
    <tool-tip id="toolTip" :tool-tip-show="toolTipShow" :tool-tip-label="toolTipLabel" :tool-tip-style="toolTipStyle" />
  </div>
</template>

<script>
import { Shape, Container, Bitmap, Text } from 'createjs-module'
import cold from '../../assets/icon/cold.png'
import comfort from '../../assets/icon/comfort.png'
import hot from '../../assets/icon/hot.png'
import * as mock from '../../assets/mock/mock'
import { DEV, APP, DISP } from '../../sub/constant/config'
import { SENSOR, DISCOMFORT } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as HeatmapHelper from '../../sub/helper/ui/HeatmapHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../sub/helper/ui/StyleHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import alert from '../../components/parts/alert.vue'
import ToolTip from '../../components/parts/toolTip.vue'

export default {
  components: {
    breadcrumb,
    alert,
    ToolTip,
  },
  mixins: [commonmixin, showmapmixin],
  data() {
    return {
      items: ViewHelper.createBreadCrumbItems('main', 'thermohumidity'),
      exbIcons: [],
      txIcons: [],
      positionedTx: [],
      isShownChart: false,
      chartTitle: '',
      keepExbPosition: false,
      keepTxPosition: false,
      noImageErrorKey: 'noMapImage',
      isHeatmap: false,
      isLoading: false,
      iconTicker: null,
      thermoPatternConfig: SensorHelper.getThermoPatternConfig(),
      humidityPatternConfig: SensorHelper.getHumidityPatternConfig(),
      iconInterval: 100,
      warnMessage: null,
      iconAlphaMin: 0.1,
      fixHeight: DISP.THERMOH.ALERT_FIX_HEIGHT,
      useHeatMap: APP.SENSOR.USE_THERMOH_HEATMAP,
      toolTipShow: false,
      toolTipLabel: '',
      toolTipStyle: {
        'left': null,
        'top': null,
        'border-color': DISP.THERMOH.TOOLTIP_BORDERCOLOR,
        'border-radius': '' + DISP.THERMOH.TOOLTIP_ROUNDRECT + 'px',
        'font': DISP.THERMOH.TOOLTIP_FONT,
        'background-color': DISP.THERMOH.TOOLTIP_BGCOLOR,
        'color': DISP.THERMOH.TOOLTIP_COLOR,
      },
      reloadState: {isLoad: false, initialize: false},
      toggleCallBack: () => {
        this.keepExbPosition = true
        this.keepTxPosition = true
      },
    }
  },
  computed: {
    alertStyle(){
      return {
        'font-weight': DISP.THERMOH.ALERT_WEIGHT,
      }
    },
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
  async created() {
    const loadStates = ['exb','tx']
    await Promise.all(loadStates.map(StateHelper.load))
  },
  async mounted() {
    // this.fetchData()
  },
  beforeDestroy(){
    this.removeTick()
  },
  methods: {
    heatmapData() {
      const dataList = this.positionedTx.concat(this.positionedExb)
      return HeatmapHelper.collect(dataList,
        {max: DISP.THERMOH.TEMPERATURE_MAX, min: DISP.THERMOH.TEMPERATURE_MIN},
        (data) => `${data.x}-${data.y}`,
        (result, data) => data.temperature,
        (data) => {return {x: data.x * this.canvasScale, y: data.y * this.canvasScale}}
      )
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
      if(APP.SENSOR.USE_THERMOH_TOOLTIP){
        this.createTooltip(event, event.target.parent)
      }
    },
    iconMouseOut(){
      if(APP.SENSOR.USE_THERMOH_TOOLTIP){
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
      const exbIdName = StateHelper.getDeviceIdName({exbId: true})
      const txIdPotName = StateHelper.getDeviceIdName({txId: true}, {forceSensorName: true})
      const txIdName = StateHelper.getDeviceIdName({txId: true})
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
        const txAlert = conf.txs.length == 0? '': `${conf.txs.map(tx => Util.hasValue(tx[txIdPotName])? tx[txIdPotName]: tx[txIdName]).filter(val => val).join(this.$i18n.tnl('message.readingPoint'))}`
        ret.push(this.$i18n.tnl(`message.${conf.label}AlertHumidity`, {
          sensors: `${exbAlert}${exbAlert && txAlert? `${this.$i18n.tnl('message.readingPoint')}`: ''}${txAlert}`,
          humidity: conf.base,
        }))
      })
      return ret.join('')
    },
    addWarnMessage(){
      if(APP.SENSOR.USE_HUMIDITY_ALERT){
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

        const sensors = await EXCloudHelper.fetchSensor(SENSOR.TEMPERATURE)

        this.positionedExb = PositionHelper.getPositionedExbWithSensor(this.selectedArea,
          (exb) => exb.sensorIds.includes(SENSOR.TEMPERATURE),
          (exb) => {return {id: SENSOR.TEMPERATURE, ...sensors.find((sensor) => sensor.deviceid == exb.deviceId && (sensor.timestamp || sensor.updatetime))}},
          (exb) => exb.temperature != null
        )

        this.positionedTx = PositionHelper.getPositionedTx(this.selectedArea,
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
      let mapImage = StateHelper.getMapImage(this.getInitAreaOption())
      HeatmapHelper.create(this, 'heatmap', mapImage, (evt, mapElement, map) => {
        map.width = this.$refs.map.width
        map.height = this.$refs.map.height
        HeatmapHelper.draw(
          mapElement, 
          {
            radius: DISP.THERMOH.TEMPERATURE_RADIUS,
            gradient: HeatmapHelper.createGradient(),
            // ヒートマップは座標系が異なるので注意
            width: this.$refs.map.width * this.canvasScale,
            height: this.$refs.map.height * this.canvasScale,
          },
          this.heatmapData()
        )
        map.style.width = String(map.width * this.canvasScale) + 'px'
        map.style.height = String(map.height * this.canvasScale) + 'px'
        onLoad && onLoad()
      })
    },
    showMapImage() {
      this.isLoading = true
      this.showMapImageDef(() => {
        this.exbIcons = []
        this.txIcons = []
        this.resetExb()
        this.resetTx()
        this.isLoading = false
        this.addTick()
        this.addWarnMessage()
        this.stage.enableMouseOver()
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
        icon.scaleX = 25 / icon.image.width / this.canvasScale
        icon.scaleY = icon.scaleX 
        icon.regX = icon.image.width / 2
        icon.regY = icon.image.height / 2
        stage.update()
      }
      return icon
    },
    createButtonIcon(device, iconInfo){
      const btnicon = new Shape()
      btnicon.graphics.beginFill(iconInfo.color).drawCircle(0, 0, DISP.THERMOH.R_SIZE / this.canvasScale, DISP.THERMOH.R_SIZE / this.canvasScale)
      btnicon.alpha = DISP.THERMOH.ALPHA
      return btnicon
    },
    createButtonLabel(device){
      const text = NumberUtil.formatTemperature(device.temperature) + '℃\n' + NumberUtil.formatHumidity(device.humidity) + '%'
      const label = new Text(text)
      label.font = this.getThermothFont()
      label.color = DISP.THERMOH.COLOR
      label.textAlign = 'center'
      label.textBaseline = 'alphabetic'
      label.y = -2
      return label
    },
    showExb(exb) {
      const stage = this.stage
      if (!this.exbCon) {
        this.exbCon = new Container()
      }
      const exbBtn = new Container()

      const iconInfo = SensorHelper.getThermohumidityIconInfo(this.thermoPatternConfig, exb.temperature, exb.humidity)
      if (DISP.THERMOH.DISP == 'icon') {
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

      exbBtn.on('click', async (evt) =>{
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/1/' + exb.exbId + '/today/hour', null, pMock)
        sensorData.data = sensorData.data.map(val => {
          val.key = DateUtil.formatDate(val.sensor_dt, 'HH')
          if(val.temperature){
            val.temperature = NumberUtil.formatTemperature(val.temperature)
          }
          if(val.humidity){
            val.humidity = NumberUtil.formatHumidity(val.humidity)
          }
          return val
        })
        this.showChart(exb, sensorData)
      })
      exbBtn.on('mouseover', this.iconMouseOver)
      exbBtn.on('mouseout', this.iconMouseOut)

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
      if (DISP.THERMOH.DISP == 'icon') {
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

      txBtn.on('click', async (evt) =>{
        const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
        const sensorData = await AppServiceHelper.fetchList('/basic/sensorHistory/1/0/' + tx.txId + '/today/hour', null, pMock)
        sensorData.data = sensorData.data.map(val => {
          val.key = DateUtil.formatDate(val.sensor_dt, 'HH')
          if(val.temperature){
            val.temperature = NumberUtil.formatTemperature(val.temperature)
          }
          if(val.humidity){
            val.humidity = NumberUtil.formatHumidity(val.humidity)
          }
          return val
        })
        this.showChart(tx, sensorData)
      })
      txBtn.on('mouseover', this.iconMouseOver)
      txBtn.on('mouseout', this.iconMouseOut)

      this.txIcons.push({button: txBtn, device: tx, config: iconInfo, sign: -1})
      this.txCon.addChild(txBtn)
      stage.addChild(this.txCon)
      stage.update()
    },
    resetTx() { // thermohumidity
      if (this.txCon) {
        this.txCon.removeAllChildren()
      }
      this.positionedTx.forEach((tx) => {
        this.showTx(tx)
      })
      this.keepTxPosition = false
    },
    removeTooltip() {
      this.toolTipShow = false
      this.toolTipStyle.left = null
      this.toolTipStyle.top = null
    },
    createTooltipInfo(nativeEvent, container){
      const device = container.device
      const pageElement = document.getElementById('bd-page')
      return {
        fontSize: StyleHelper.getFont2Size(DISP.THERMOH.TOOLTIP_FONT),
        sensorName: DISP.THERMOH.TOOLTIP_ITEMS.TXNAME? device.potName? device.potName: device.locationName: '',
        temperature: DISP.THERMOH.TOOLTIP_ITEMS.TEMPERATURE? NumberUtil.formatTemperature(device.temperature) + this.$i18n.tnl('label.temperatureUnit'): '',
        humidity: DISP.THERMOH.TOOLTIP_ITEMS.HUMIDITY? NumberUtil.formatHumidity(device.humidity) + this.$i18n.tnl('label.humidityUnit'): '',
        description: DISP.THERMOH.TOOLTIP_ITEMS.DESCRIPTION? StringUtil.cutOnLong(device.description, 10): '',
        date: DISP.THERMOH.TOOLTIP_ITEMS.DATE? DateUtil.formatDate(device.timestamp || device.updatetime): '',
        baseX: window.pageXOffset + nativeEvent.clientX - Util.getValue(pageElement, 'offsetLeft', 0),
        baseY: window.pageYOffset + nativeEvent.clientY - Util.getValue(pageElement, 'offsetTop', 0),
        isDispRight: container.x * 2 <= this.stage.canvas.width,
      }
    },
    createTooltip(event, container) {
      const tooltipInfo = this.createTooltipInfo(event.nativeEvent, container)

      this.toolTipLabel = [tooltipInfo.sensorName, tooltipInfo.temperature, tooltipInfo.humidity, tooltipInfo.description, tooltipInfo.date]
      this.toolTipShow = true
      this.$nextTick(() => {
        const toolTipElement = document.getElementById('toolTipComponent')
        const left = tooltipInfo.baseX + (tooltipInfo.isDispRight? 8: -1 * Util.getValue(toolTipElement, 'clientWidth', 0) - 4)
        const top = tooltipInfo.baseY - Util.getValue(toolTipElement, 'clientHeight', 0) - 4
        this.toolTipStyle.left = '' + left + 'px'
        this.toolTipStyle.top = '' + top + 'px'
      })
    },
    showChart(device, sensorData) {
      SensorHelper.showThermoHumidityChart('dayChart', sensorData.data)
      this.isShownChart = true
      this.chartTitle = this.$i18n.tnl('message.monthDayTemperature', {
        month: sensorData.month,
        day: sensorData.day,
        name: device.potName? device.potName: device.locationName? device.locationName: '',
        description: device.description? ` : ${StringUtil.cutOnLong(device.description, 10)}`: ''
      })
    },
    getThermothFont(ft = DISP.THERMOH.FONT){
      const font = ft.split('px')
      const fontSize = Number(font[0]) / this.canvasScale
      return Math.round(fontSize) + 'px' + font[1]
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/config.scss";
@import "../../sub/constant/browser.scss";
@import "../../sub/constant/vue.scss";
</style>