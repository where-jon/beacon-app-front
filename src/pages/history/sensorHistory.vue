<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="false" />
    <div class="container">
      <alert :message="message" />

      <div class="mapContainer mb-5">
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.sensor'" class="mr-2" />
                <b-form-select v-model="form.sensorId" :options="sensorOptions" class="mr-2" />
              </b-form-row>
            </b-form-row>
          </b-form-group>
        </b-form>
        <b-form inline>
          <b-form-group class="mr-5">
            <b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateFrom'" class="mr-2" />
                <date-picker v-model="form.datetimeFrom" :clearable="false" type="datetime" class="mr-2 inputdatefrom" required />
              </b-form-row>
              <b-form-row class="mb-3 mr-2">
                <label v-t="'label.historyDateTo'" class="mr-2" />
                <date-picker v-model="form.datetimeTo" :clearable="false" type="datetime" class="mr-2 inputdateto" required />
              </b-form-row>
            </b-form-row>
          </b-form-group>
          <b-form-group>
            <b-form-row class="mb-3 mr-2">
              <b-button v-t="'label.display'" :variant="theme" class="mx-1" @click="display" />
              <b-button v-if="!iosOrAndroid && bulkReferenceable" v-t="'label.download'" :variant="theme" class="mx-1" @click="exportCsv" />
            </b-form-row>
          </b-form-group>
        </b-form>
        <slot />
        <b-row class="mt-3" />
        <b-table :items="viewList" :fields="fields" :current-page="currentPage" :per-page="perPage" :sort-by.sync="sortBy" :sort-compare="defaultSortCompare" stacked="md" striped hover outlined />
        <b-row>
          <b-col md="6" class="my-1">
            {{ footerMessage }}
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6" class="mt-1 mb-3">
            <b-pagination v-model="currentPage" :total-rows="fetchRows" :per-page="perPage" class="my-0" />
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { DatePicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import _ from 'lodash'
import { APP_SERVICE } from '../../sub/constant/config'
import { SENSOR } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as HttpHelper from '../../sub/helper/base/HttpHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import alert from '../../components/parts/alert.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'

export default {
  components: {
    DatePicker,
    breadcrumb,
    alert,
  },
  mixins: [commonmixin],
  data () {
    return {
      name: 'sensorHistory',
      breadCrumbs: ViewHelper.createBreadCrumbItems('historyTitle', 'sensorHistory'),
      form: {
        sensorId: null,
        datetimeFrom: null,
        datetimeTo: null,
      },
      message: '',
      footerMessage: '',
      //
      viewList: [],
      fields: [],
      currentPage: 1,
      perPage: 20,
      limitViewRows: 100,
      fetchRows: 0,
      sortBy: null,
    }
  },
  async created() {
    this.form.sensorId = Util.hasValue(this.sensorOptions)? this.sensorOptions[0].value: null
    const date = DateUtil.getDefaultDate()
    this.form.datetimeFrom = DateUtil.getDatetime(date, {hours: -1})
    this.form.datetimeTo = DateUtil.getDatetime(date)
    this.fields = SensorHelper.getFields1([{ key: 'locationName', forceShow: true }])
  },
  mounted() {
    ViewHelper.importElementUI()
    this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.fetchRows, maxRows: this.limitViewRows})}`
  },
  methods: {
    async display() {
      this.container ? this.container.removeAllChildren() : null
      await this.displayImpl()
      this.stage ? this.stage.update() : null
    },
    editSensorHistoryData(senHist){
      const d = new Date(senHist.sensorDt)
      senHist.sensorDt = DateUtil.formatDate(d.getTime())

      let tx = this.txIdMap[senHist.txId]
      if (senHist.txId != null && tx) {
        senHist.potName = Util.getValue(tx, 'pot.potName', Util.getValue(tx, ConfigHelper.includesBtxMinor('btxId')? 'btxId': 'minor', ''))
        senHist.major = tx.major
        senHist.minor = tx.minor
        senHist.locationName = Util.v(tx, 'location.locationName')
        senHist.areaName = Util.v(tx, 'location.area.areaName')
      }

      let exb = this.exbIdMap[senHist.exbId]
      if (exb != null && exb) {
        senHist.deviceId = exb.deviceId
        senHist.deviceIdX = exb.deviceIdX
        senHist.locationName = exb.locationName
        senHist.areaName = exb.areaName
      }

      if (senHist.sensorId == SENSOR.TEMPERATURE) {
        senHist.humidity = isNaN(senHist.value.humidity)? '': NumberUtil.formatHumidity(Number(senHist.value.humidity))
        senHist.temperature = isNaN(senHist.value.temperature)? '': NumberUtil.formatTemperature(Number(senHist.value.temperature))
      }
      if (senHist.sensorId == SENSOR.PIR || senHist.sensorId == SENSOR.THERMOPILE) {
        senHist.count = senHist.value.count
      }
      if (senHist.sensorId == SENSOR.MEDITAG) {
        senHist.high = senHist.value.high
        senHist.low = senHist.value.low
        senHist.beat = senHist.value.beat
        senHist.step = senHist.value.step
        senHist.down = senHist.value.down
      }
      if (senHist.sensorId == SENSOR.MAGNET) {
        let labelKey = (senHist.value.magnet === SENSOR.MAGNET_STATUS.ON)? 'using': 'notUse'
        senHist.state = this.$i18n.tnl('label.' + labelKey)
      }
      if (senHist.sensorId == SENSOR.PRESSURE) {
        senHist.pressVol = senHist.value.press_vol
      }
      if (senHist.sensorId == SENSOR.OMR_ENV) {
        senHist.humidity = senHist.value.humidity
        senHist.temperature = senHist.value.temperature
        senHist.soundNoise = senHist.value.sound_noise
        senHist.ambientLight = senHist.value.ambient_light
      }
      if (senHist.sensorId == SENSOR.CO2) {
        senHist.co2 = senHist.value.co2
      }
    },
    async displayImpl(){
      this.replace({showAlert: false})
      this.viewList = []
      this.fetchRows = 0
      this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.fetchRows, maxRows: this.limitViewRows})}`
      try {
        const aSensorId = (this.form.sensorId != null)?this.form.sensorId:0
        this.fields = this.getFields(aSensorId)
        var fetchList = await HttpHelper.getAppService(
          `/basic/sensorHistory/findsensor/${aSensorId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/${this.limitViewRows}`
        )
        if (fetchList == null || !fetchList.length) {
          this.message = this.$i18n.tnl('message.notFoundData', {target: this.$i18n.tnl('label.sensorHistory')})
          this.replace({showAlert: true})
          return
        }
        var count = 0
        for (var senHist of fetchList) {
          this.editSensorHistoryData(senHist)
          if (++count <= this.limitViewRows) {
            this.viewList.push(senHist)
          }
        }
        this.fetchRows = this.viewList.length
        this.footerMessage = `${this.$i18n.tnl('message.totalRowsMessage', {row: this.fetchRows, maxRows: this.limitViewRows})}`
      } catch(e) {
        console.error(e)
      }
    },
    getFields(aSensorId) {
      if (aSensorId == SENSOR.PIR || aSensorId == SENSOR.THERMOPILE) {
        return SensorHelper.getFields2()
      }
      if (aSensorId == SENSOR.MEDITAG) {
        return SensorHelper.getFields5()
      }
      if (aSensorId == SENSOR.MAGNET) {
        return SensorHelper.getFields6()
      }
      if (aSensorId == SENSOR.PRESSURE) {
        return SensorHelper.getFields8()
      }
      if (aSensorId == SENSOR.OMR_ENV) {
        return SensorHelper.getFields9()
      }
      if (aSensorId == SENSOR.CO2) {
        return SensorHelper.getFields14()
      }
      return SensorHelper.getFields1([{ key: 'locationName', forceShow: true }])
    },
    async fetchData(payload) {
    },
    async exportCsv() {
      const aSensorId = (this.form.sensorId != null)?this.form.sensorId:0
      const headerLabels = this.getCsvHeaderList(aSensorId)
      BrowserUtil.executeFileDL(
        APP_SERVICE.BASE_URL
        + `/basic/sensorHistory/csvdownload/${aSensorId}/${this.form.datetimeFrom.getTime()}/${this.form.datetimeTo.getTime()}/`
        + getCharSet(this.$store.state.loginId)
        + `?headerLabels=${headerLabels}`
     )
    },
    getCsvHeaderList(aSensorId) {
      return encodeURI(this.getFields(aSensorId).map(field => field.label).join(','))
    },
  }
}
</script>
