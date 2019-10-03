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
import monitorTable from '../../components/parts/monitortable.vue'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [commonmixin, reloadmixin],
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('monitor', 'telemetry'),
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
    if (!this.isDev) {
      return
    }
    this.items = ViewHelper.createBreadCrumbItems('develop', 'telemetry')
  },
  methods: {
    getHeaders(){
      return ViewHelper.addLabelByKey(this.isDev? null: this.$i18n,
        this.isDev? [
          { key: 'meshid_deviceid' },
          { key: 'deviceid' },
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
        ]: [
          ConfigHelper.includesDeviceType('deviceId')? { key: 'deviceId' }: null,
          ConfigHelper.includesDeviceType('deviceIdX')? { key: 'deviceIdX' }: null,
          { key: 'name', label: 'locationName'},
          APP.TELEMETRY.WITH_POWER_LEVEL? { key: 'powerLevel' }: null,
          { key: 'timestamp', label: 'finalReceiveTimestamp'},
          { key: 'state' },
        ].filter((val) => val))
    },
    getCsvHeaders(){
      return this.isDev?
        {
          meshid_deviceid: 'meshid_deviceid',
          deviceid: 'deviceid',
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
        }:
        {
          deviceId: ConfigHelper.includesDeviceType('deviceId')? 'deviceId': null,
          deviceIdX: ConfigHelper.includesDeviceType('deviceIdX')? 'deviceId(HEX)': null,
          name: 'finalRevceivePlace',
          powerLevel: 'powerLevel',
          timestamp: 'timestamp',
          state: 'state'
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
      const tdClass = !this.isDev && key === this.label_powerLevel ? 'powerlevel' : ''
      return tdClass + ' ' + (!this.isDev && (key === this.label_state || key === this.label_timestamp) ? 'exb-state' : '')
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
      if (this.isDev) {
        return [
          'meshid_deviceid',
          'deviceid',
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
      }
      const ret = []
      if (ConfigHelper.includesDeviceType('deviceId')) {
        ret.push(this.$i18n.tnl('label.deviceId'))
      }
      if (ConfigHelper.includesDeviceType('deviceIdX')) {
        ret.push(this.$i18n.tnl('label.deviceIdX'))
      }
      ret.push(this.$i18n.tnl('label.locationName'))
      if (APP.TELEMETRY.WITH_POWER_LEVEL) {
        ret.push(this.$i18n.tnl('label.powerLevel'))
      }
      ret.push(this.$i18n.tnl('label.finalReceiveTimestamp'))
      ret.push(this.$i18n.tnl('label.state'))
      ret.push('\n')
      return ret
    },
    async makeTelemetryRecords(telemetrys) {
      if (this.isDev) {
        return telemetrys
      }
      await StateHelper.load('exb')
      const map = {}
      this.exbs.forEach((e) => {
        const deviceId = APP.SVC.POS.EXSERVER ? e.deviceId.toString() : e.deviceId.toString(16)
        if(Util.hasValue(e.location)){
          map[deviceId] = e.location.locationName
        }
      })

      return telemetrys.map((e) => {
        const name = map[e.deviceid]
        const ret = {
          name: name != null ? name : 'ー',
          powerLevel:e.power_level * 2,
          timestamp: e.timestamp,
          state: this.$refs.monitorTable.getStateLabel('exb', e.timestamp)
        }

        const deviceId = APP.SVC.POS.EXSERVER ? e.deviceid : parseInt(e.deviceid, 16)

        if(ConfigHelper.includesDeviceType('deviceId')){
          ret.deviceId = deviceId
        }
        if(ConfigHelper.includesDeviceType('deviceIdX')){
          ret.deviceIdX= e.deviceid.toUpperCase()
        }
        return ret
      })
    },
  }
}
</script>

<style scoped lang="scss">
</style>