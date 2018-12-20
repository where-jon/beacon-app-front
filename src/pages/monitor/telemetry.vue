<template>
  <div>
    <breadcrumb :items="items" :reload="true" :is-load="isLoad" @reload="fetchData" />
    <div v-show="!isLoad" class="container">
      <b-row align-h="end">
        <all-count :count="allCount" />
        <b-col md="2" class="mb-3 mr-3">
          <b-button v-if="!iosOrAndroid" v-t="'label.download'" :variant="getButtonTheme()" @click="download()" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th v-for="(val, key) in fields.filter(e => e)" :key="key" scope="col" :class="val.key !== 'state' ? '' : 'exb-state'">
              {{ val.label }}
            </th>
          </thead>
          <tbody>
            <tr v-for="(telemetry, index) in telemetrys" :key="index" :class="getTrClass(index, telemetry[label_timestamp])">
              <td v-for="(val, key) in telemetry" v-if="val !== null" :key="key" scope="row" :class="getTdClass(index, val, key)">
                <span v-if="key === label_powerLevel">
                  <i :class="getPowerLevelClass(val)" />{{ val }}
                </span>
                <span v-else-if="key === label_state" :class="getStateClass('exb', telemetry[label_timestamp])">
                  {{ val }}
                </span>
                {{ key !== label_powerLevel && key !== label_state ? val : '' }}
              </td>
            </tr>
          </tbody>
        </table>
        <vue-scrolling-table v-if="isDev">
          <template slot="thead">
            <th v-for="(val, key) in telemetrys[0]" :key="key" scope="col">
              {{ key }}
            </th>
          </template>
          <template slot="tbody">
            <tr v-for="(telemetry, index) in telemetrys" :key="index" :class="getTrClass(index, telemetry.timestamp)">
              <td v-for="(val, key) in telemetry" :key="key" scope="row">
                {{ val }}
              </td>
            </tr>
          </template>
        </vue-scrolling-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP, DEV } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'
import VueScrollingTable from 'vue-scrolling-table'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import gatewayVue from './gateway.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import moment from 'moment'
import { addLabelByKey } from '../../sub/helper/ViewHelper'
import allCount from '../../components/parts/allcount.vue'
import statusmixinVue from '../../components/mixin/statusmixin.vue'

export default {
  components: {
    breadcrumb,
    VueScrollingTable,
    allCount,
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
      fields: addLabelByKey(this.$i18n, [ 
        APP.EXB_WITH_DEVICE_NUM ? {key: 'deviceNum', sortable: true }: null,
        APP.EXB_WITH_DEVICE_ID ? {key: 'deviceId', sortable: true }: null,
        APP.EXB_WITH_DEVICE_IDX ? {key: 'deviceIdX', sortable: true }: null,
        {key: 'locationName', label:'locationName', sortable: true,},
        {key: 'powerLevel', label:'powerLevel', sortable: true,},
        {key: 'finalReceiveTimestamp', label:'finalReceiveTimestamp', sortable: true,},
        {key: 'state', label:'state', sortable: true,},
      ]),
      isLoad: false,
      label_deviceId: this.$i18n.tnl('label.deviceId'),
      label_deviceNum: this.$i18n.tnl('label.deviceNum'),
      label_deviceIdX: this.$i18n.tnl('label.deviceIdX'),
      label_name: this.$i18n.tnl('label.location'),
      label_timestamp: this.$i18n.tnl('label.finalReceiveTimestamp'),
      label_powerLevel: this.$i18n.tnl('label.powerLevel'),
      label_state: this.$i18n.tnl('label.state'),
      badgeClassPrefix: 'badge badge-pill badge-',
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
          [this.$i18n.tnl('label.deviceNum')]: APP.EXB_WITH_DEVICE_NUM ? 'deviceNum' : null,
          [this.$i18n.tnl('label.deviceId')]: APP.EXB_WITH_DEVICE_ID ? 'deviceId' : null,
          [this.$i18n.tnl('label.deviceIdX')]: APP.EXB_WITH_DEVICE_IDX ? 'deviceId(HEX)' : null,
          [this.$i18n.tnl('label.location')]: 'finalReceivePlace',
          [this.$i18n.tnl('label.powerLevel')]: 'powerLevel',
          [this.$i18n.tnl('label.finalReceiveTimestamp')]: 'timestamp',
          [this.$i18n.tnl('label.state')]: 'state'
        },
      interval: null,
    }
  },
  computed: {
    ...mapState('monitor', [
      'telemetrys',
    ]),
    ...mapState('app_service', [
      'exbs',
    ]),
    allCount() {
      return this.telemetrys.length
    },
  },
  mounted() {
    this.replace({title: this.$i18n.tnl('label.telemetry')})
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
    async fetchData(payload) {
      this.replace({showProgress: true})
      this.isLoad = true
      try {
        let telemetrys = await EXCloudHelper.fetchTelemetry()
        telemetrys = await this.makeTelemetryRecords(telemetrys)
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceMonitor({telemetrys})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
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
        const offset = this.$store.state.currentRegion.deviceOffset
        const deviceId = parseInt(e.deviceid, 16)
        return {
          [this.label_deviceNum]: APP.EXB_WITH_DEVICE_NUM ? deviceId - offset : null,
          [this.label_deviceId]: APP.EXB_WITH_DEVICE_ID ? deviceId : null,
          [this.label_deviceIdX]: APP.EXB_WITH_DEVICE_IDX ? e.deviceid.toUpperCase() : null,
          [this.label_name]: name != null ? name : 'ー',
          [this.label_powerLevel]:e.power_level * 2,
          [this.label_timestamp]: e.timestamp,
          [this.label_state]: this.getStateLabel('exb', e.timestamp)
        }
      })
    },
    getPowerLevelClass(val) {
      const num = parseInt(val , 10)
      if (79 < num) {
        return 'fas fa-battery-full power-safe'
      }
      if (59 < num) {
        return 'fas fa-battery-three-quarters power-safe'
      }
      if (39 < num) {
        return 'fas fa-battery-half power-warning'
      }
      if (19 < num) {
        return 'fas fa-battery-quarter power-empty'
      }
      return 'fas fa-battery-empty power-empty'
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../sub/constant/scrolltable.scss";

div.table-area {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

tbody {
  display:block;
  height:400px;
  overflow:auto;
  min-width: 630px;
}

thead, tbody tr {
  display:table;
  width:100%;
  table-layout:fixed;
}

span.badge {
  margin-right: 0px;
}

td.exb-state {
  padding: 0.75rem 0rem 0.75rem 0rem;
}

thead {
  width: calc( 100% - 1em )
}

.power-safe {
  color: #28a745;
}

.power-warning {
  color: #ffd700;
}

.power-empty {
  color: #f17777;
}

td {
  word-break: break-all;
}

</style>