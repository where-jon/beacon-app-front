<template>
  <div>
    <breadcrumb :items="items" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <label v-t="'label.sensor'" />
            <b-form-select v-model="form.sensorId" :options="sensorOptions" class="ml-2 inputSelect" required @change="changeSensorId" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row>
            <b-form-row class="mb-3">
              <label v-t="'label.historyDateFrom'" />
              <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="ml-2 inputdatefrom" required @change="changeDatetimeFrom" />
            </b-form-row>
            <b-form-row class="ml-2 mb-3">
              <label v-t="'label.historyDateTo'" />
              <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="ml-2 inputdateto" required @change="changeDatetimeTo" />
            </b-form-row>
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <label v-t="'label.sumUnit'" />
            <b-form-select v-model="form.sumUnit" :options="sumUnitOptions" class="ml-2 inputSelect" required @change="changeSumUnit" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form v-if="showSumTarget" inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <label v-t="'label.sumTarget'" />
            <b-form-select v-model="form.sumTarget" :options="sumTargetOptions" class="ml-2 inputSelect" required />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row v-if="showExb" class="mb-3">
            <label v-t="'label.exb'" />
            <b-form-select v-model="form.exbId" :options="exbOptions" class="ml-2 inputSelect" required />
          </b-form-row>
          <b-form-row v-if="showTx" class="mb-3">
            <label v-t="'label.tx'" />
            <b-form-select v-model="form.txId" :options="txOptions" class="ml-2 inputSelect" required />
          </b-form-row>
        </b-form-group>
      </b-form>
      <b-form inline @submit.prevent>
        <b-form-group>
          <b-form-row class="mb-3">
            <b-button v-t="'label.display'" :variant="theme" @click="display" />
            <b-button v-t="'label.download'" :variant="theme" :disabled="!dataList || dataList.length == 0" class="ml-2" @click="download" />
          </b-form-row>
        </b-form-group>
      </b-form>
      <div>
        <canvas v-show="!showAlert" id="dayChart" width="450" height="200" />
      </div>
      <div>
        <canvas v-show="!showAlert" id="dayChartSub" width="450" height="200" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import { SENSOR, SUM_UNIT, SUM_TARGET } from '../../sub/constant/Constants'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import { DEV } from '../../sub/constant/config'
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
      items: [
        {
          text: this.$i18n.tnl('label.sumTitle'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.sensorGraph'),
          active: true
        }
      ],
      headers: {
        temperature: [ 'sensorKey', 'temperature(max)', 'temperature(avg)', 'temperature(min)', 'humidity(max)', 'humidity(avg)', 'humidity(min)' ],
        pir: [ 'sensorKey', 'count(max)', 'count(avg)', 'count(min)' ],
        thermopile: [ 'sensorKey', 'count(max)', 'count(avg)', 'count(min)' ],
        meditag: [ 'sensorKey', 'high(max)', 'high(avg)', 'high(min)', 'low(max)', 'low(avg)', 'low(min)', 'beat(max)', 'beat(avg)', 'beat(min)', 'step(max)', 'step(avg)', 'step(min)', 'down(max)', 'down(avg)', 'down(min)' ],
        magnet: [ 'sensorKey', 'magnet(max)', 'magnet(min)' ]
      },
      sumUnitOptions: [],
      exbOptions: [],
      txOptions: [],
      showExb: true,
      showTx: true,
      showSumTarget: true,
      hourOver: 4,
      dateOver: 3,
      dataSensorId: null,
      dataList: [],
      message: '',
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
      return this.sensors.filter((sensor) => sensor.sensorId != SENSOR.LED).map((sensor) => {
        return {
          value: sensor.sensorId,
          text: this.$i18n.tnl('label.' + sensor.sensorName)
        }
      })
    },
    sumTargetOptions() {
      return SUM_TARGET.getOptions()
    },
  },
  async created() {
    await StateHelper.load('sensor')
    await StateHelper.load('tx')
    await StateHelper.load('exb')
    this.form.sensorId = SENSOR.TEMPERATURE
    this.form.sumUnit = SUM_UNIT.getOptions()[1].value
    this.form.sumTarget = this.sumTargetOptions[0].value
    this.changeSensorId()
    const date = new Date()
    this.form.datetimeFrom = Util.getDatetime(date, {date: -1})
    this.form.datetimeTo = Util.getDatetime(date)
    this.getSumUnitOptions()
    this.changeSumUnit()
  },
  async mounted() {
    import(`element-ui/lib/locale/lang/${this.$i18n.locale}`).then( (mojule) =>{
      locale.use(mojule.default)
    })
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
      this.exbOptions = exbs? exbs.map((val) => ({value: val.exbId, text: val.locationName})): []
      this.form.exbId = this.exbOptions.length == 0? null: this.exbOptions[0].value
    },
    getTxOptions(newVal = this.form.sensorId){
      const txs = this.txs.filter((val) => val.sensorId == newVal)
      this.txOptions = txs? txs.map((val) => ({value: val.txId, text: val.txName})): []
      this.form.txId = this.txOptions.length == 0? null: this.txOptions[0].value
    },
    changeSensorId(newVal = this.form.sensorId) {
      this.showExb = [SENSOR.TEMPERATURE, SENSOR.PIR, SENSOR.THERMOPILE, SENSOR.LED].includes(newVal)
      this.showTx = [SENSOR.MEDITAG, SENSOR.MAGNET].includes(newVal)
      this.getExbOptions(newVal)
      this.getTxOptions(newVal)
      this.form.sensorId = newVal
      this.showSumTarget = this.isShowSumTarget()
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
      }))
      const count = {
        temperature: 0, humidity: 0, count: 0, step: 0, beat: 0, stress: 0,
        low: 0, high: 0, pressure: 0, downLatest: 0, down: 0, magnet: 0
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
      }))
    },
    createCsvData(sensorKey, average, max, min){
      const ret = {}
      const sumUnit = SUM_UNIT.getOptions()
      ret['sensorKey'] = this.form.sumUnit == sumUnit[0].value? `${sensorKey}:00`:
        this.form.sumUnit == sumUnit[1].value? `${sensorKey}:00`:
          this.form.sumUnit == sumUnit[2].value? `${sensorKey.substring(0, sensorKey.length - 6)}`: sensorKey
      if(this.form.sensorId == SENSOR.TEMPERATURE){
        ret['humidity(max)'] = max.humidity
        ret['humidity(avg)'] = average.humidity
        ret['humidity(min)'] = min.humidity
        ret['temperature(max)'] = max.temperature
        ret['temperature(avg)'] = average.temperature
        ret['temperature(min)'] = min.temperature
      }
      if(this.form.sensorId == SENSOR.PIR || this.form.sensorId == SENSOR.THERMOPILE){
        ret['count(max)'] = max.count
        ret['count(avg)'] = average.count
        ret['count(min)'] = min.count
      }
      if(this.form.sensorId == SENSOR.MEDITAG){
        ret['step(max)'] = max.step
        ret['step(avg)'] = average.step
        ret['step(min)'] = min.step
        ret['beat(max)'] = max.beat
        ret['beat(avg)'] = average.beat
        ret['beat(min)'] = min.beat
        ret['low(max)'] = max.low
        ret['low(avg)'] = average.low
        ret['low(min)'] = min.low
        ret['high(max)'] = max.high
        ret['high(avg)'] = average.high
        ret['high(min)'] = min.high
        ret['down(max)'] = max.down
        ret['down(avg)'] = average.down
        ret['down(min)'] = min.down
      }
      if(this.form.sensorId == SENSOR.MAGNET){
        ret['magnet(max)'] = max.magnet
        ret['magnet(min)'] = min.magnet
      }
      return ret
    },
    async fetch(by){
      const sumUnitOption = SUM_UNIT.getOptions()
      const id = `${this.showExb? `1/${this.form.exbId}`: `0/${this.form.txId}`}`
      const time = `${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}`
      let sensorData = await AppServiceHelper.fetchList(`/basic/sensorHistory/graph/${this.form.sensorId}/${id}/${time}/${by}`)
      if (DEV.USE_MOCK_EXC) {
        let key = this.form.sumUnit == sumUnitOption[0].value? 'minute': this.form.sumUnit == sumUnitOption[1].value? 'hour': 'day'
        sensorData = {data: mock.sensorGraph()[key]}
      }
      if(!sensorData || !sensorData.data || sensorData.data.length == 0){
        return []
      }
      const sensorEditData = {}
      sensorData.data.forEach((val) => {
        const key = val.sensorKey
        if(!sensorEditData[key]){
          sensorEditData[key] = []
        }
        sensorEditData[key].push(val)
      })
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
          csvData: this.createCsvData(key, average, max, min),
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
      if (errorMessage) {
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
      SensorHelper.showChartDetail('dayChart', this.form.sensorId, this.form.datetimeFrom, this.form.datetimeTo, sensorData, by, this.$i18n)
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
              this.dataSensorId == SENSOR.MAGNET? this.headers.magnet: null
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
