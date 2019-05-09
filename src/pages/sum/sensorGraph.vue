<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group class="mr-5">
          <b-form-row class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.sensor'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.sensorId" :options="sensorOptions" class="ml-2 inputSelect" required @change="changeSensorId" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group v-if="showDevice" class="mr-5">
          <b-form-row class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.device'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="deviceType" :options="deviceOptions" class="ml-2 inputSelect" required />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group>
          <b-form-row v-if="showExb" class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.exb'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.exbId" :options="exbOptions" class="ml-2 inputSelect" required />
            </b-form-row>
          </b-form-row>
          <b-form-row v-if="showTx" class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.tx'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.txId" :options="txOptions" class="ml-2 inputSelect" required />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mr-2 mb-3">
              <span v-t="'label.historyDateFrom'" class="d-flex align-items-center" />
              <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="ml-2 inputdatefrom" required @change="changeDatetimeFrom" />
            </b-form-row>
            <b-form-row class="mb-3">
              <span v-t="'label.historyDateTo'" class="d-flex align-items-center" />
              <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="ml-2 inputdateto" required @change="changeDatetimeTo" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group class="mr-4">
          <b-form-row class="mb-3 mr-1">
            <b-form-row class="mr-1">
              <span v-t="'label.sumUnit'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.sumUnit" :options="sumUnitOptions" class="ml-2 inputSelect" required @change="changeSumUnit" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
        <b-form-group v-if="showSumTarget">
          <b-form-row class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.sumTarget'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <b-form-select v-model="form.sumTarget" :options="sumTargetOptions" class="ml-2 inputSelect" required />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" :variant="theme" @click="display" />
            <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="theme" :disabled="!dataList || dataList.length == 0" class="ml-2" @click="download" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <div>
        <canvas v-show="!showAlert && showChart" id="dayChart" :width="iosOrAndroid? 300: 450" :height="iosOrAndroid? 250: 400" />
      </div>
      <div>
        <canvas v-show="!showAlert && showSubChart" id="dayChartSub" :width="iosOrAndroid? 300: 450" :height="iosOrAndroid? 250: 400" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import { SENSOR, SUM_UNIT, SUM_TARGET, DEVICE } from '../../sub/constant/Constants'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import { DEV, APP } from '../../sub/constant/config'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import * as mock from '../../assets/mock/mock'
import validatemixin from '../../components/mixin/validatemixin.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'

export default {
  components: {
    breadcrumb,
    alert,
    DatePicker,
  },
  mixins: [validatemixin, commonmixinVue],
  data () {
    return {
      form: {
        sensorId: null,
        datetimeFrom: null,
        datetimeTo: null,
        sumUnit: null,
        sumTarget: null,
        exbId: null,
        txId: null,
      },
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'sensorGraph'),
      headers: {
        temperature: [
          'dt',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'humidity(lat)': null, 'humidity(max)', 'humidity(avg)', 'humidity(min)',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'temperature(lat)': null, 'temperature(max)', 'temperature(avg)', 'temperature(min)',
        ].filter(val => val),
        pir: [
          'dt',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'count(lat)': null, 'count(max)', 'count(avg)', 'count(min)'
        ].filter(val => val),
        thermopile: [
          'dt',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'count(lat)': null, 'count(max)', 'count(avg)', 'count(min)'
        ].filter(val => val),
        meditag: [
          'dt',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'high(lat)': null, 'high(max)', 'high(avg)', 'high(min)',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'low(lat)': null, 'low(max)', 'low(avg)', 'low(min)',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'beat(lat)': null, 'beat(max)', 'beat(avg)', 'beat(min)',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'step(lat)': null, 'step(max)', 'step(avg)', 'step(min)',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'down(lat)': null, 'down(max)', 'down(avg)', 'down(min)',
        ].filter(val => val),
        magnet: [ 'dt', 'magnet(max)', 'magnet(min)' ],
        pressure: [
          'dt',
          APP.SENSORGRAPH_CSV_IMMEDIATE? 'pressVol(lat)': null, 'pressVol(max)', 'pressVol(avg)', 'pressVol(min)',
        ].filter(val => val),
      },
      exbType: [SENSOR.PIR, SENSOR.THERMOPILE, SENSOR.LED],
      txType: [SENSOR.MEDITAG, SENSOR.MAGNET],
      sumUnitOptions: [],
      exbOptions: [],
      txOptions: [],
      deviceType: DEVICE.EXB,
      showSumTarget: true,
      hourOver: 4,
      dateOver: 3,
      dataSensorId: null,
      dataList: [],
      message: '',
      showChart: false,
      showSubChart: false,
    }
  },
  computed: {
    theme () {
      const theme = getTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'exbs',
      'txs',
      'sensors',
    ]),
    ...mapState([
      'showAlert',
    ]),
    sensorOptions() {
      return StateHelper.getOptionsFromState('sensor', 
        sensor => this.$i18n.tnl('label.' + sensor.sensorName),
        true,
        sensor => {
          return SensorHelper.availableSensorAll().includes(sensor.sensorId) 
            && sensor.sensorId != SENSOR.LED && sensor.sensorId != SENSOR.BUTTON
        }
      )
    },
    sumTargetOptions() {
      return SUM_TARGET.getOptions()
    },
    deviceOptions() {
      return DEVICE.getOptions().filter((val) => {
        if(val.value == DEVICE.EXB){
          return Util.hasValue(this.exbOptions)
        }
        if(val.value == DEVICE.TX){
          return Util.hasValue(this.txOptions)
        }
        return false
      })
    },
    iosOrAndroid() {
      return Util.isAndroidOrIOS()
    },
    showDevice(){
      return this.form.sensorId == SENSOR.TEMPERATURE && APP.SENSORGRAPH_WITH_DEVICE
    },
    showTx(){
      return this.deviceType == DEVICE.TX
    },
    showExb(){
      return this.deviceType == DEVICE.EXB
    },
  },
  async created() {
    await StateHelper.load('sensor')
    await StateHelper.load('tx')
    await StateHelper.load('exb')
    this.form.sensorId = SENSOR.TEMPERATURE
    this.form.sumUnit = SUM_UNIT.getOptions()[1].value
    this.form.sumTarget = this.sumTargetOptions[1].value
    this.changeSensorId()
    const date = new Date()
    this.form.datetimeFrom = Util.getDatetime(date, {date: -1})
    this.form.datetimeTo = Util.getDatetime(date)
    this.getSumUnitOptions()
    this.changeSumUnit()
  },
  async mounted() {
    HtmlUtil.importElementUI()
  },
  methods: {
    getSumUnitOptions(newDatetimeFrom = this.form.datetimeFrom, newDatetimeTo = this.form.datetimeTo) {
      const sumUnitOptions = SUM_UNIT.getOptions()
      const subDatetime = Util.getSubDatetime(newDatetimeFrom, newDatetimeTo)
      const options = [sumUnitOptions[2]]
      if(subDatetime.date >= this.dateOver){
        this.form.sumUnit = sumUnitOptions[2].value
        this.changeSumUnit()
        this.sumUnitOptions = options
        return
      }
      options.unshift(sumUnitOptions[1])
      if(subDatetime.hour > this.hourOver){
        if(this.form.sumUnit == sumUnitOptions[0].value){
          this.form.sumUnit = sumUnitOptions[1].value
          this.changeSumUnit()
        }
        this.sumUnitOptions = options
        return
      }
      options.unshift(sumUnitOptions[0])
      this.sumUnitOptions = options
    },
    getExbOptions(newVal = this.form.sensorId){
      const exbs = this.exbs.filter((val) => val.sensorId == newVal)
      // const exbs = this.exbs.filter((val) => this.getSensorIds(val).includes(newVal)) 一旦単数に戻す
      this.exbOptions = exbs? exbs.map((val) => ({value: val.exbId, text: val.locationName})): []
      this.form.exbId = this.exbOptions.length == 0? null: this.exbOptions[0].value
    },
    getTxOptions(newVal = this.form.sensorId){
      const txs = this.txs.filter((val) => val.sensorId == newVal)
      this.txOptions = txs? txs.map((val) => ({value: val.txId, text: Util.getValue(val, 'potName', APP.TX_BTX_MINOR == 'minor'? val.minor: val.btxId)})): []
      this.form.txId = this.txOptions.length == 0? null: this.txOptions[0].value
    },
    setDeviceTypeFromSensorId(sensorId){
      this.deviceType = Util.hasValue(this.deviceOptions)? this.deviceOptions[0].value: this.txType.includes(sensorId)? DEVICE.TX: DEVICE.EXB
    },
    changeSensorId(newVal = this.form.sensorId) {
      this.getExbOptions(newVal)
      this.getTxOptions(newVal)
      this.form.sensorId = newVal
      this.showSumTarget = this.isShowSumTarget()
      this.setDeviceTypeFromSensorId(newVal)
    },
    changeDatetime(timeFrom, timeTo) {
      this.getSumUnitOptions(timeFrom, timeTo)
    },
    changeDatetimeFrom(newVal = this.form.datetimeFrom) {
      this.changeDatetime(newVal, this.form.datetimeTo)
    },
    changeDatetimeTo(newVal = this.form.datetimeTo) {
      this.changeDatetime(this.form.datetimeFrom, newVal)
    },
    changeSumUnit(newVal = this.form.sumUnit){
      this.form.sumUnit = newVal
      this.showSumTarget = this.isShowSumTarget()
    },
    isShowSumTarget(){
      if(this.form.sensorId == SENSOR.MAGNET){
        this.form.sumTarget = this.sumTargetOptions[0].value
        return false
      }
      if(this.form.sumUnit == SUM_UNIT.getOptions()[2].value){
        this.form.sumTarget = this.sumTargetOptions[1].value
        return false
      }
      return true
    },
    add(num1, num2){
      if(isNaN(num1) && isNaN(num2)){
        return num1
      }
      if(isNaN(num1)){
        return num2
      }
      if(isNaN(num2)){
        return num1
      }
      return Number(num1) + Number(num2)
    },
    compare(num1, num2){
      if(isNaN(num1) && isNaN(num2)){
        return 0
      }
      if(isNaN(num1)){
        return 1
      }
      if(isNaN(num2)){
        return -1
      }
      return Number(num2) - Number(num1)
    },
    createAverageDataList(sensorKey, dataList){
      const ret = dataList.reduce( (a, b) => ({
        sensorKey: sensorKey,
        temperature: this.add(a.temperature, b.temperature),
        humidity: this.add(a.humidity, b.humidity),
        count: this.add(a.count, b.count),
        step: this.add(a.step, b.step),
        beat: this.add(a.beat, b.beat),
        stress: this.add(a.stress, b.stress),
        low: this.add(a.low, b.low),
        high: this.add(a.high, b.high),
        pressure: this.add(a.pressure, b.pressure),
        downLatest: this.add(a.downLatest, b.downLatest),
        down: this.add(a.down, b.down),
        magnet: this.add(a.magnet, b.magnet),
        pressVol: this.add(a.pressVol, b.pressVol),
      }))
      const count = {
        temperature: 0, humidity: 0, count: 0, step: 0, beat: 0, stress: 0,
        low: 0, high: 0, pressure: 0, downLatest: 0, down: 0, magnet: 0, pressVol: 0,
      }
      dataList.forEach((data) => {
        Object.keys(data).forEach((key) => {
          if(data[key] != null){
            count[key]++
          }
        })
      })
      Object.keys(ret).forEach((key) => {
        ret[key] = count[key] == 0? 0: Math.round(ret[key] * 100 / count[key]) / 100
      })
      return ret
    },
    createMaxDataList(sensorKey, dataList){
      return dataList.reduce( (a, b) => ({
        sensorKey: sensorKey,
        temperature: this.compare(a.temperature, b.temperature) < 0? a.temperature: b.temperature,
        humidity: this.compare(a.humidity, b.humidity) < 0? a.humidity: b.humidity,
        count: this.compare(a.count, b.count) < 0? a.count: b.count,
        step: this.compare(a.step, b.step) < 0? a.step: b.step,
        beat: this.compare(a.beat, b.beat) < 0? a.beat: b.beat,
        stress: this.compare(a.stress, b.stress) < 0? a.stress: b.stress,
        low: this.compare(a.low, b.low) < 0? a.low: b.low,
        high: this.compare(a.high, b.high) < 0? a.high: b.high,
        pressure: this.compare(a.pressure, b.pressure) < 0? a.pressure: b.pressure,
        downLatest: this.compare(a.downLatest, b.downLatest) < 0? a.downLatest: b.downLatest,
        down: this.compare(a.down, b.down) < 0? a.down: b.down,
        magnet: this.compare(a.magnet, b.magnet) < 0? a.magnet: b.magnet,
        pressVol: this.compare(a.pressVol, b.pressVol) < 0? a.pressVol: b.pressVol,
      }))
    },
    createMinDataList(sensorKey, dataList){
      return dataList.reduce( (a, b) => ({
        sensorKey: sensorKey,
        temperature: this.compare(a.temperature, b.temperature) > 0? a.temperature: b.temperature,
        humidity: this.compare(a.humidity, b.humidity) > 0? a.humidity: b.humidity,
        count: this.compare(a.count, b.count) > 0? a.count: b.count,
        step: this.compare(a.step, b.step) > 0? a.step: b.step,
        beat: this.compare(a.beat, b.beat) > 0? a.beat: b.beat,
        stress: this.compare(a.stress, b.stress) > 0? a.stress: b.stress,
        low: this.compare(a.low, b.low) > 0? a.low: b.low,
        high: this.compare(a.high, b.high) > 0? a.high: b.high,
        pressure: this.compare(a.pressure, b.pressure) > 0? a.pressure: b.pressure,
        downLatest: this.compare(a.downLatest, b.downLatest) > 0? a.downLatest: b.downLatest,
        down: this.compare(a.down, b.down) > 0? a.down: b.down,
        magnet: this.compare(a.magnet, b.magnet) > 0? a.magnet: b.magnet,
        pressVol: this.compare(a.pressVol, b.pressVol) > 0? a.pressVol: b.pressVol,
      }))
    },
    createCsvData(sensorKey, immediate, average, max, min){
      const ret = {}
      const sumUnit = SUM_UNIT.getOptions()
      ret['dt'] = this.form.sumUnit == sumUnit[0].value? `${sensorKey}:00`:
        this.form.sumUnit == sumUnit[1].value? `${sensorKey}:00`:
          this.form.sumUnit == sumUnit[2].value? `${sensorKey.substring(0, sensorKey.length - 6)}`: sensorKey
      if(this.form.sensorId == SENSOR.TEMPERATURE){
        ret['humidity(lat)'] = immediate.humidity
        ret['humidity(max)'] = max.humidity
        ret['humidity(avg)'] = average.humidity
        ret['humidity(min)'] = min.humidity
        ret['temperature(lat)'] = immediate.temperature
        ret['temperature(max)'] = max.temperature
        ret['temperature(avg)'] = average.temperature
        ret['temperature(min)'] = min.temperature
      }
      if(this.form.sensorId == SENSOR.PIR || this.form.sensorId == SENSOR.THERMOPILE){
        ret['count(lat)'] = immediate.count
        ret['count(max)'] = max.count
        ret['count(avg)'] = average.count
        ret['count(min)'] = min.count
      }
      if(this.form.sensorId == SENSOR.MEDITAG){
        ret['step(lat)'] = immediate.step
        ret['step(max)'] = max.step
        ret['step(avg)'] = average.step
        ret['step(min)'] = min.step
        ret['beat(lat)'] = immediate.beat
        ret['beat(max)'] = max.beat
        ret['beat(avg)'] = average.beat
        ret['beat(min)'] = min.beat
        ret['low(lat)'] = immediate.low
        ret['low(max)'] = max.low
        ret['low(avg)'] = average.low
        ret['low(min)'] = min.low
        ret['high(lat)'] = immediate.high
        ret['high(max)'] = max.high
        ret['high(avg)'] = average.high
        ret['high(min)'] = min.high
        ret['down(lat)'] = immediate.down
        ret['down(max)'] = max.down
        ret['down(avg)'] = average.down
        ret['down(min)'] = min.down
      }
      if(this.form.sensorId == SENSOR.MAGNET){
        ret['magnet(max)'] = max.magnet
        ret['magnet(min)'] = min.magnet
      }
      if(this.form.sensorId == SENSOR.PRESSURE){
        ret['pressVol(lat)'] = immediate.pressVol
        ret['pressVol(max)'] = max.pressVol
        ret['pressVol(avg)'] = average.pressVol
        ret['pressVol(min)'] = min.pressVol
      }
      return ret
    },
    unitFunc(dayFunc, hourFunc, minuteFunc){
      const sumUnitOption = SUM_UNIT.getOptions()
      return this.form.sumUnit == sumUnitOption[0].value? minuteFunc(): this.form.sumUnit == sumUnitOption[1].value? hourFunc(): dayFunc()
    },
    async fetch(by){
      const id = `${this.showExb? `1/${this.form.exbId}`: `0/${this.form.txId}`}`
      const time = `${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}`
      let sensorData = await AppServiceHelper.fetchList(`/basic/sensorHistory/graph/${this.form.sensorId}/${id}/${time}/${by}`)
      if (DEV.USE_MOCK_EXC) {
        let key = this.unitFunc(() => 'day', () => 'hour', () => 'minute')
        sensorData = {data: mock.sensorGraph()[key]}
      }
      if(!sensorData || !sensorData.data || sensorData.data.length == 0){
        return []
      }
      const sensorEditData = {}
      sensorData.data.forEach((val) => {
        const key = Util.formatDate(val.sensorDt, this.unitFunc(() => 'YYYY/MM/DD [00]:[00]', () => 'YYYY/MM/DD HH:[00]', () => 'YYYY/MM/DD HH:mm'))
        if(!sensorEditData[key]){
          sensorEditData[key] = []
        }
        if(val.humidity){
          val.humidity = Util.formatHumidity(val.humidity)
        }
        if(val.temperature){
          val.temperature = Util.formatTemperature(val.temperature)
        }
        sensorEditData[key].push(val)
      })
      const sumUnitOption = SUM_UNIT.getOptions()
      return Object.keys(sensorEditData).map((keyVal) => {
        const key = keyVal
        const immediate = sensorEditData[key].reduce((a, b) => this.compare(a.sensorDt, b.sensorDt) > 0? a: b)
        const average = this.createAverageDataList(key, sensorEditData[key])
        const max = this.createMaxDataList(key, sensorEditData[key])
        const min = this.createMinDataList(key, sensorEditData[key])
        const data = this.form.sumTarget == this.sumTargetOptions[0].value? immediate:
          this.form.sumTarget == this.sumTargetOptions[1].value? average:
            this.form.sumTarget == this.sumTargetOptions[2].value? max:
              this.form.sumTarget == this.sumTargetOptions[3].value? min: {}
        return {
          key: key,
          data: data,
          csvData: this.createCsvData(key, immediate, average, max, min),
          immediate: this.form.sumTarget == this.sumTargetOptions[0].value ? immediate: null,
          average: this.form.sumTarget == this.sumTargetOptions[1].value || (this.form.sumUnit == sumUnitOption[2].value && this.form.sensorId != SENSOR.MAGNET)? average: null,
          max: this.form.sumTarget == this.sumTargetOptions[2].value || this.form.sumUnit == sumUnitOption[2].value? max: null,
          min: this.form.sumTarget == this.sumTargetOptions[3].value || this.form.sumUnit == sumUnitOption[2].value? min: null,
        }
      })
    },
    validate() {
      const errors = this.validateCheck([
        {type: 'require', 
          names: [this.showExb? 'exbId': null, this.showTx? 'tx': null].filter((val) => val),
          values: [this.showExb? this.form.exbId: null, this.showTx? this.form.txId: null].filter((val) => val)},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
      ].filter((val) => val && val.names.length >= 1))
      return this.formatValidateMessage(errors)
    },
    async display() {
      this.replace({showAlert: false})
      const errorMessage = this.validate()
      this.dataList = []
      this.showChart = false
      this.showSubChart = false
      if (Util.hasValue(errorMessage)) {
        this.message = errorMessage
        this.replace({showAlert: true})
        return
      }
      const by = SUM_UNIT.getOptions().find((val) => val.value == this.form.sumUnit).param
      const sensorData = await this.fetch(by)
      this.dataList = sensorData.map((val) => val.csvData)
      if (sensorData.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }
      this.dataSensorId = this.form.sensorId
      this.showChart = true
      this.showSubChart = this.form.sensorId == SENSOR.MEDITAG
      this.$nextTick(() => {
        SensorHelper.showChartDetail('dayChart', this.form.sensorId, this.form.datetimeFrom, this.form.datetimeTo, sensorData, by, this.$i18n)
      })
    },
    async download(){
      if (this.dataList == null || this.dataList.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        return
      }
      const header = this.dataSensorId == SENSOR.TEMPERATURE? this.headers.temperature: 
        this.dataSensorId == SENSOR.PIR? this.headers.pir: 
          this.dataSensorId == SENSOR.THERMOPILE? this.headers.thermopile: 
            this.dataSensorId == SENSOR.MEDITAG? this.headers.meditag: 
              this.dataSensorId == SENSOR.MAGNET? this.headers.magnet: 
                this.dataSensorId == SENSOR.PRESSURE? this.headers.pressure: null
      HtmlUtil.fileDL(
        'sensorGraph.csv',
        Util.converToCsv(this.dataList, header),
        getCharSet(this.$store.state.loginId)
      )
    }
  }
}
</script>

<style scoped lang="scss">
.inputSelect {
  min-width: 160px;
}
.inputdatefrom {
  width: 200px;
}
.inputdateto {
  width: 200px;
}
</style>
