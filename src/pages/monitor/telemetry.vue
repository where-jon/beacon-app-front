<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table ref="monitorTable" type="exb" :all-count="allCount" :fields="fields" :list="telemetrys" :tr-class="getClass" :td-class="getTdClass" max-filter-length="40" />
    </div>
  </div>
</template>

<script>
import { APP, DISP } from '../../sub/constant/config'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
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
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('monitor', 'telemetry'),
      fields: this.getHeaders(),
      telemetrys: [],
      reloadState: { isLoad: false },
      csvHeaders: this.getCsvHeaders(),
    }
  },
  computed: {
    allCount() {
      return this.telemetrys.length
    },
  },
  mounted() {
    this.fetchData()
    return
  },
  methods: {
    getHeaders(){
      return ViewHelper.addLabelByKey(this.$i18n,
        [
          ConfigHelper.includesDeviceType('deviceId')? { key: 'deviceId' ,sortable: true, tdClass: 'action-rowdata' }: null,
          ConfigHelper.includesDeviceType('deviceIdX')? { key: 'deviceIdX' ,sortable: true, tdClass: 'action-rowdata' }: null,
          { key: 'name', label: 'locationName' ,sortable: true, tdClass: 'action-rowdata'},
          APP.TELEMETRY.WITH_POWER_LEVEL? { key: 'powerLevel' ,sortable: true, tdClass: 'action-rowdata' }: null,
          { key: 'timestamp', label: 'finalReceiveTimestamp' ,sortable: true, tdClass: 'action-rowdata'},
          { key: 'state' },
        ].filter((val) => val))
    },
    getCsvHeaders(){
      return {
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
      const tdClass = key === this.label_powerLevel ? 'powerlevel' : ''
      return tdClass + ' ' + ((key === this.label_state || key === this.label_timestamp) ? 'exb-state' : '')
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
      const map = {}
      this.exbs.forEach((e) => {
        const deviceId = DISP.POS.EXSERVER ? e.deviceId.toString() : e.deviceId.toString(16)
        if(Util.hasValue(e.location)){
          map[deviceId] = e.location.locationName
        }
      })

      return telemetrys.map((e) => {
        const name = map[e.deviceId]
        const ret = {
          name: name != null ? name : 'ー',
          powerLevel:e.power_level * 2,
          timestamp: e.timestamp,
          state: this.$refs.monitorTable.getStateLabel('exb', e.timestamp)
        }

        const deviceId = DISP.POS.EXSERVER ? e.deviceId : parseInt(e.deviceId, 16)

        if(ConfigHelper.includesDeviceType('deviceId')){
          ret.deviceId = deviceId
        }
        if(ConfigHelper.includesDeviceType('deviceIdX')){
          ret.deviceIdX= e.deviceId.toUpperCase()
        }
        return ret
      })
    },
  }
}
</script>

<style scoped lang="scss">
</style>