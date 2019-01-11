<template>
  <div>
    <breadcrumb :items="items" :reload="true" :is-load="isLoad" @reload="fetchData" />
    <div v-show="!isLoad" class="container">
      <monitor-table type="telemetry" :vue-table-mode="isDev" :all-count="allCount" :headers="headers" :datas="telemetrys" :tr-class="getClass" :td-class="getTdClass" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import monitorTable from '../../components/parts/monitortable.vue'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import statusmixinVue from '../../components/mixin/statusmixin.vue'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [reloadmixinVue, commonmixinVue, statusmixinVue ],
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.tnl('label.monitor'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.telemetry'),
          active: true
        }
      ],
      headers: addLabelByKey(this.isDev? null: this.$i18n,
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
          APP.EXB_WITH_DEVICE_NUM? { key: 'deviceNum' }: null,
          APP.EXB_WITH_DEVICE_ID? { key: 'deviceId' }: null,
          APP.EXB_WITH_DEVICE_IDX? { key: 'deviceIdX' }: null,
          { key: 'name', label: 'locationName'},
          { key: 'powerLevel' },
          { key: 'timestamp', label: 'finalReceiveTimestamp'},
          { key: 'state' },
        ].filter((val) => val)),
      telemetrys: [],
      isLoad: false,
      csvHeaders: this.isDev?
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
          deviceNum: APP.EXB_WITH_DEVICE_NUM ? 'deviceNum' : null,
          deviceId: APP.EXB_WITH_DEVICE_ID ? 'deviceId' : null,
          deviceIdX: APP.EXB_WITH_DEVICE_IDX ? 'deviceId(HEX)' : null,
          name: 'finalReceivePlace',
          powerLevel: 'powerLevel',
          timestamp: 'timestamp',
          state: 'state'
        },
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
    this.items = [
      {
        text: this.$i18n.tnl('label.develop'),
        active: true
      },
      {
        text: this.$i18n.tnl('label.telemetry'),
        active: true
      }
    ]
  },
  methods: {
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
      HtmlUtil.fileDL('telemetry.csv', Util.converToCsv(records), getCharSet(this.$store.state.loginId))
    },
    async makeTelemetryRecords(telemetrys) {
      if (this.isDev) {
        return telemetrys
      }
      await StateHelper.load('exb')
      const map = {}
      this.exbs.forEach((e) => {
        map[e.deviceId.toString(16)] = e.location.locationName
      })

      return telemetrys.map((e) => {
        const name = map[e.deviceid]
        const ret = {
          name: name != null ? name : 'ー',
          powerLevel:e.power_level * 2,
          timestamp: e.timestamp,
          state: this.getStateLabel('exb', e.timestamp)
        }

        const offset = this.$store.state.currentRegion.deviceOffset
        const deviceId = parseInt(e.deviceid, 16)
        if(APP.EXB_WITH_DEVICE_NUM){
          ret.deviceNum = deviceId - offset
        }
        if(APP.EXB_WITH_DEVICE_ID){
          ret.deviceNum = deviceId
        }
        if(APP.EXB_WITH_DEVICE_IDX){
          ret.deviceNum = e.deviceid.toUpperCase()
        }
        return ret
      })
    },
  }
}
</script>

<style scoped lang="scss">
</style>