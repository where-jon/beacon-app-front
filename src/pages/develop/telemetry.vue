<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table ref="monitorTable" type="telemetry" :vue-table-mode="isDev" :all-count="allCount" :headers="headers" :datas="telemetrys" :tr-class="getClass" :td-class="getTdClass" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../sub/constant/config'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import monitorTable from '../../components/parts/monitortable-dev.vue'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [commonmixin, reloadmixin],
  data () {
    return {
      isDev: true,
      items: ViewHelper.createBreadCrumbItems('develop', 'telemetry'),
      headers: this.getHeaders(),
      telemetrys: [],
      reloadState: { isLoad: false },
      csvHeaders: this.getCsvHeaders(),
    }
  },
  computed: {
    ...mapState('app_service', [
      'exbs',
    ]),
    allCount() {
      return this.telemetrys.length
    },
  },
  mounted() {
    this.fetchData()
    this.items = ViewHelper.createBreadCrumbItems('develop', 'telemetry')
  },
  methods: {
    getHeaders(){
      return ViewHelper.addLabelByKey(null,
        [
          { key: 'meshid_deviceid' },
          { key: 'deviceId' },
          { key: 'description' },
          { key: 'timestamp' },
          { key: 'firm_ver' },
          { key: 'power_level' },
          { key: 'ibeacon_major' },
          { key: 'ibeacon_minor' },
          { key: 'ibeacon_txpower' },
          { key: 'ibeacon_interval' },
          { key: 'hour168_count' },
          { key: 'hour24_count' },
          { key: 'hour12_count' },
          { key: 'hour6_count' },
          { key: 'hour3_count' },
          { key: 'ibeacon_received' },
        ])
    },
    getCsvHeaders(){
      return {
        meshid_deviceid: 'meshid_deviceid',
        deviceId: 'deviceId',
        description: 'description',
        timestamp: 'timestamp',
        firm_ver: 'firm_ver',
        power_level: 'power_level',
        ibeacon_major: 'ibeacon_major',
        ibeacon_minor: 'ibeacon_minor',
        ibeacon_txpower: 'ibeacon_txpower',
        ibeacon_interval: 'ibeacon_interval',
        hour168_count: 'hour168_count',
        hour24_count: 'hour24_count',
        hour12_count: 'hour12_count',
        hour6_count: 'hour6_count',
        hour3_count: 'hour3_count',
        ibeacon_received: 'ibeacon_received',
      }
    },
    getClass(telemetry, index){
      return this.getTrClass(index, telemetry.timestamp)
    },
    async fetchData(payload) {
      this.showProgress()
      this.isLoad = true
      try {
        const telemetrys = await EXCloudHelper.fetchTelemetry()
        this.telemetrys = await this.makeTelemetryRecords(telemetrys)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
      this.isLoad = false
    },
    getTrClass (index, updatetime) {
      const state = DetectStateHelper.getState('exb', updatetime)
      return DetectStateHelper.isUndetect(state) ? 'undetect' : (index % 2 === 1 ? 'odd' : '')
    },
    getTdClass (index, val, key) {
      const tdClass = ''
      return tdClass
    },
    download() {
      const records = this.telemetrys.map(e => {
        const obj = {}
        Object.keys(this.csvHeaders)
          .filter(csvHeader => this.csvHeaders[csvHeader])
          .forEach(csvHeader => obj[this.csvHeaders[csvHeader]] = e[csvHeader])
        return obj
      })
      BrowserUtil.fileDL('telemetry.csv', CsvUtil.converToCsv(records, null, this.getCsvHeaderList()), getCharSet(this.$store.state.loginId))
    },
    getCsvHeaderList(){
      return [
        'meshid_deviceid',
        'deviceId',
        'description',
        'timestamp',
        'firm_ver',
        'power_level',
        'ibeacon_major',
        'ibeacon_minor',
        'ibeacon_txpower',
        'ibeacon_interval',
        'hour168_count',
        'hour24_count',
        'hour12_count',
        'hour6_count',
        'hour3_count',
        'ibeacon_received',
      ]
    },
    async makeTelemetryRecords(telemetrys) {
      return telemetrys
    },
  }
}
</script>

<style scoped lang="scss">
</style>