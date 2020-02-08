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
              <b-form-select v-model="form.sensorId" :options="sensorGraphOptions" class="ml-2 inputSelect" required @change="changeSensorId" />
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
              <span :title="vueSelectTitle(vueSelected.exb)">
                <v-select v-model="vueSelected.exb" :options="exbOptions" :clearable="false" class="ml-2 inputSelect vue-options" :style="vueSelectStyle">
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
          <b-form-row v-if="showTx" class="mb-3">
            <b-form-row class="mr-1">
              <span v-t="'label.tx'" class="d-flex align-items-center" />
            </b-form-row>
            <b-form-row>
              <span :title="vueSelectTitle(vueSelected.tx)">
                <v-select v-model="vueSelected.tx" :options="txOptions" :clearable="false" class="ml-2 inputSelect vue-options" :style="vueSelectStyle">
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
            <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" :disabled="!dataList || dataList.length == 0" class="ml-2" @click="download" />
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
import * as mock from '../../assets/mock/mock'
import { DEV, APP } from '../../sub/constant/config'
import { SENSOR, SUM_UNIT, SUM_TARGET, DEVICE } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import alert from '../../components/parts/alert.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('sumTitle', 'sensorGraph'),
      form: {
        sensorId: null,
        datetimeFrom: null,
        datetimeTo: null,
        sumUnit: null,
        sumTarget: null,
        exbId: null,
        txId: null,
      },
      vueSelected: {
        exb: null,
        tx: null,
      },
      message: '',
      sumUnitOptions: [],
      exbOptions: [], // FIXME: commonmixinに定義されている
      txOptions: [], // FIXME: commonmixinに定義されている
      exbType: [SENSOR.PIR, SENSOR.THERMOPILE, SENSOR.LED_TYPE2, SENSOR.LED_TYPE5],
      txType: [SENSOR.MEDITAG, SENSOR.MAGNET],
      deviceType: DEVICE.EXB,
      showSumTarget: true,
      hourOver: 4,
      dateOver: 3,
      dataSensorId: null,
      dataList: [],
      showChart: false,
      showSubChart: false,
      headers: {
        temperature: [
          'dt',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'humidity(lat)': null, 'humidity(max)', 'humidity(avg)', 'humidity(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'temperature(lat)': null, 'temperature(max)', 'temperature(avg)', 'temperature(min)',
        ].filter(val => val),
        pir: [
          'dt',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'count(lat)': null, 'count(max)', 'count(avg)', 'count(min)'
        ].filter(val => val),
        thermopile: [
          'dt',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'count(lat)': null, 'count(max)', 'count(avg)', 'count(min)'
        ].filter(val => val),
        meditag: [
          'dt',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'high(lat)': null, 'high(max)', 'high(avg)', 'high(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'low(lat)': null, 'low(max)', 'low(avg)', 'low(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'beat(lat)': null, 'beat(max)', 'beat(avg)', 'beat(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'step(lat)': null, 'step(max)', 'step(avg)', 'step(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'down(lat)': null, 'down(max)', 'down(avg)', 'down(min)',
        ].filter(val => val),
        magnet: [ 'dt', 'magnet(max)', 'magnet(min)' ],
        pressure: [
          'dt',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'pressVol(lat)': null, 'pressVol(max)', 'pressVol(avg)', 'pressVol(min)',
        ].filter(val => val),
        omr_env: [
          'dt',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'humidity(lat)': null, 'humidity(max)', 'humidity(avg)', 'humidity(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'temperature(lat)': null, 'temperature(max)', 'temperature(avg)', 'temperature(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'soundNoise(lat)': null, 'soundNoise(max)', 'soundNoise(avg)', 'soundNoise(min)',
          APP.SENSORGRAPH.CSV_IMMEDIATE? 'ambientLight(lat)': null, 'ambientLight(max)', 'ambientLight(avg)', 'ambientLight(min)',
        ].filter(val => val),
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'exbs',
      'txs',
      'sensors',
    ]),
    ...mapState([
      'showAlert',
    ]),
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
      return BrowserUtil.isAndroidOrIOS()
    },
    showDevice(){
      return this.form.sensorId == SENSOR.TEMPERATURE && APP.SENSORGRAPH.WITH_DEVICE
    },
    showTx(){
      return this.deviceType == DEVICE.TX
    },
    showExb(){
      return this.deviceType == DEVICE.EXB
    },
  },
  watch: {
    'vueSelected.exb': {
      handler: function(newVal, oldVal){
        this.form.exbId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
    'vueSelected.tx': {
      handler: function(newVal, oldVal){
        this.form.txId = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created() {
    // await Promise.all(['sensor', 'tx', 'exb'].map(StateHelper.load))
    this.form.sensorId = SENSOR.TEMPERATURE
    this.form.sumUnit = SUM_UNIT.getOptions()[1].value
    this.form.sumTarget = SUM_TARGET.AVERAGE
    this.changeSensorId()
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {date: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)
    this.getSumUnitOptions()
    this.changeSumUnit()
  },
  async mounted() {
    ViewHelper.importElementUI()
  },
  methods: {
    getSumUnitOptions(newDatetimeFrom = this.form.datetimeFrom, newDatetimeTo = this.form.datetimeTo) {
      const sumUnitOptions = SUM_UNIT.getOptions()
      const subDatetime = DateUtil.getSubDatetime(newDatetimeFrom, newDatetimeTo)
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
      const exbs = this.exbs.filter(exb => exb.sensorIds.includes(newVal))
      this.exbOptions = exbs? exbs.map(val => ({value: val.exbId, label: val.locationName})): []
      this.vueSelected.exb = VueSelectHelper.getVueSelectData(this.exbOptions, null, true)
    },
    getTxOptions(newVal = this.form.sensorId){
      const txs = this.txs.filter(val => val.sensorId == newVal)
      this.txOptions = txs? txs.map(val => ({value: val.txId, label: Util.getValue(val, 'potName', APP.TX.BTX_MINOR == 'minor'? val.minor: val.btxId)})): []
      this.vueSelected.tx = VueSelectHelper.getVueSelectData(this.txOptions, null, true)
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
        return false
      }
      if(this.form.sumUnit == SUM_UNIT.getOptions()[2].value){
        this.form.sumTarget = SUM_TARGET.AVERAGE
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
        soundNoise: this.add(a.soundNoise, b.soundNoise),
        ambientLight: this.add(a.ambientLight, b.ambientLight),
      }))
      const count = {
        temperature: 0, humidity: 0, count: 0, step: 0, beat: 0, stress: 0,
        low: 0, high: 0, pressure: 0, downLatest: 0, down: 0, magnet: 0, pressVol: 0,
        soundNoise: 0, ambientLight: 0
      }
      dataList.forEach((data) => {
        Object.keys(data).forEach(key => {
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
        soundNoise: this.compare(a.soundNoise, b.soundNoise) < 0? a.soundNoise: b.soundNoise,
        ambientLight: this.compare(a.ambientLight, b.ambientLight) < 0? a.ambientLight: b.ambientLight,
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
        soundNoise: this.compare(a.soundNoise, b.soundNoise) > 0? a.soundNoise: b.soundNoise,
        ambientLight: this.compare(a.ambientLight, b.ambientLight) > 0? a.ambientLight: b.ambientLight,
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
      if(this.form.sensorId == SENSOR.OMR_ENV){
        ret['humidity(lat)'] = immediate.humidity
        ret['humidity(max)'] = max.humidity
        ret['humidity(avg)'] = average.humidity
        ret['humidity(min)'] = min.humidity
        ret['temperature(lat)'] = immediate.temperature
        ret['temperature(max)'] = max.temperature
        ret['temperature(avg)'] = average.temperature
        ret['temperature(min)'] = min.temperature
        ret['soundNoise(lat)'] = immediate.soundNoise
        ret['soundNoise(max)'] = max.soundNoise
        ret['soundNoise(avg)'] = average.soundNoise
        ret['soundNoise(min)'] = min.soundNoise
        ret['ambientLight(lat)'] = immediate.ambientLight
        ret['ambientLight(max)'] = max.ambientLight
        ret['ambientLight(avg)'] = average.ambientLight
        ret['ambientLight(min)'] = min.ambientLight
      }
      return ret
    },
    unitFunc(dayFunc, hourFunc, minuteFunc){
      const sumUnitOption = SUM_UNIT.getOptions()
      return this.form.sumUnit == sumUnitOption[0].value? minuteFunc(): this.form.sumUnit == sumUnitOption[1].value? hourFunc(): dayFunc()
    },
    convertSumTarget(){
      if(this.form.sensorId == SENSOR.MAGNET){
        return SUM_TARGET.IMMEDIATE
      }
      return this.form.sumTarget
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
        const key = DateUtil.formatDate(val.sensorDt, this.unitFunc(() => 'YYYY/MM/DD [00]:[00]', () => 'YYYY/MM/DD HH:[00]', () => 'YYYY/MM/DD HH:mm'))
        if(!sensorEditData[key]){
          sensorEditData[key] = []
        }
        if(val.humidity){
          val.humidity = NumberUtil.formatHumidity(val.humidity)
        }
        if(val.temperature){
          val.temperature = NumberUtil.formatTemperature(val.temperature)
        }
        sensorEditData[key].push(val)
      })
      const sumUnitOption = SUM_UNIT.getOptions()
      const sumTarget = this.convertSumTarget()
      return Object.keys(sensorEditData).map(keyVal => {
        const key = keyVal
        const immediate = sensorEditData[key].reduce((a, b) => this.compare(a.sensorDt, b.sensorDt) > 0? a: b)
        const average = this.createAverageDataList(key, sensorEditData[key])
        const max = this.createMaxDataList(key, sensorEditData[key])
        const min = this.createMinDataList(key, sensorEditData[key])
        const data = sumTarget == SUM_TARGET.IMMEDIATE? immediate:
          sumTarget == SUM_TARGET.AVERAGE? average:
            sumTarget == SUM_TARGET.MAX? max:
              sumTarget == SUM_TARGET.MIN? min: {}
        return {
          key: key,
          data: data,
          csvData: this.createCsvData(key, immediate, average, max, min),
          immediate: sumTarget == SUM_TARGET.IMMEDIATE? immediate: null,
          average: sumTarget == SUM_TARGET.AVERAGE || (this.form.sumUnit == sumUnitOption[2].value && this.form.sensorId != SENSOR.MAGNET)? average: null,
          max: sumTarget == SUM_TARGET.MAX || this.form.sumUnit == sumUnitOption[2].value? max: null,
          min: sumTarget == SUM_TARGET.MIN || this.form.sumUnit == sumUnitOption[2].value? min: null,
        }
      })
    },
    validate() {
      const errors = ValidateHelper.validateCheck([
        {type: 'require', 
          names: [this.showExb? 'exbId': null, this.showTx? 'tx': null].filter(val => val),
          values: [this.showExb? this.form.exbId: null, this.showTx? this.form.txId: null].filter(val => val)},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeFrom]},
        {type: 'require', names: ['historyDateFrom'], values: [this.form.datetimeTo]},
        this.form.datetimeFrom && this.form.datetimeTo? {type: 'asc', names: ['historyDateFrom'], values: [this.form.datetimeFrom.getTime(), this.form.datetimeTo.getTime()], equal: false}: null,
      ].filter(val => val && val.names.length >= 1))
      return ValidateHelper.formatValidateMessage(errors)
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
      const by = SUM_UNIT.getOptions().find(val => val.value == this.form.sumUnit).param
      this.showProgress()
      const sensorData = await this.fetch(by)
      this.dataList = sensorData.map(val => val.csvData)
      if (sensorData.length == 0) {
        this.message = this.$i18n.tnl('message.notFound')
        this.replace({showAlert: true})
        this.hideProgress()
        return
      }
      this.dataSensorId = this.form.sensorId
      this.showChart = true
      this.showSubChart = this.form.sensorId == SENSOR.MEDITAG
      this.$nextTick(() => {
        SensorHelper.showChartDetail('dayChart', this.form.sensorId, this.form.datetimeFrom, this.form.datetimeTo, sensorData, by)
        this.hideProgress()
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
                this.dataSensorId == SENSOR.PRESSURE? this.headers.pressure: 
                  this.dataSensorId == SENSOR.OMR_ENV? this.headers.omr_env: null

      BrowserUtil.fileDL(
        'sensorGraph.csv',
        CsvUtil.converToCsv(this.dataList, header, this.getCsvHeaderList(header)),
        getCharSet(this.$store.state.loginId)
      )
    },
    getCsvHeaderList(header) {
      var regex = /\(/g;
      const ret = []
      header.forEach((head) => {
        const hasSet = head && head.search(regex) > 0
        if (hasSet) {
          let splitData = head.split(regex)
          ret.push(this.$i18n.tnl('label.' + splitData[0]) 
          + '(' + this.$i18n.tnl('label.' + splitData[1].slice(0,-1)) + ')')
        } else {
          ret.push(this.$i18n.tnl('label.' + head))
        }
      })
      ret.push('\n')
      return ret
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/input.scss";
@import "../../sub/constant/vue.scss";
</style>
