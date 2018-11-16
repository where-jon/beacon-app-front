<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad"  @reload="fetchData" />
    <div class="container" v-show="!isLoad">
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button v-if="!ios" :variant='theme' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th scope="col" v-for="(val, key) in fields.filter(e => e)" :key="key" :class="val.key !== 'state' ? '' : 'exb-state'">{{ val.label }}</th>
          </thead>
          <tbody>
            <tr v-for="(telemetry, index) in telemetrys" :key="index" :class="getTrClass(index, telemetry[label_timestamp])">
              <td scope="row" v-for="(val, key) in telemetry" :key="key" :class="getTdClass(index, val, key)" v-if="val !== null">
                <span v-if="key === label_powerLevel"><i :class="getPowerLevelClass(val)"></i>{{ val }}</span>
                <span :class="exbStateClass(val)" v-else-if="key === label_state">{{ val }}</span>
                {{ key !== label_powerLevel && key !== label_state ? val : '' }}
              </td>
            </tr>
          </tbody>
        </table>
        <vue-scrolling-table v-if="isDev">
          <template slot="thead">
            <th scope="col" v-for="(val, key) in telemetrys[0]" :key="key" >{{ key }}</th>
          </template>
          <template slot="tbody">
            <tr v-for="(telemetry, index) in telemetrys" :key="index" :class="getTrClass(index, telemetry.timestamp)">
              <td scope="row" v-for="(val, key) in telemetry" :key="key">{{ val }}</td>
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
import { EXB, DISP, APP, DEV, TELEMETRY } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import VueScrollingTable from "vue-scrolling-table"
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'
import reloadmixinVue from '../../components/reloadmixin.vue'
import gatewayVue from './gateway.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import moment from 'moment'
import { addLabelByKey } from '../../sub/helper/ViewHelper'

export default {
  mixins: [reloadmixinVue],
  components: {
    breadcrumb,
    VueScrollingTable,
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
        APP.EXB_WITH_DEVICE_NUM ? {key: "deviceNum", sortable: true }: null,
        APP.EXB_WITH_DEVICE_ID ? {key: "deviceId", sortable: true }: null,
        APP.EXB_WITH_DEVICE_IDX ? {key: "deviceIdX", sortable: true }: null,
        {key: "locationName", label:'locationName', sortable: true,},
        {key: "power-level", label:'power-level', sortable: true,},
        {key: "final-receive-timestamp", label:'final-receive-timestamp', sortable: true,},
        {key: "state", label:'state', sortable: true,},
      ]),
      isLoad: false,
      label_deviceId: this.$i18n.tnl('label.deviceId'),
      label_deviceNum: this.$i18n.tnl('label.deviceNum'),
      label_deviceIdX: this.$i18n.tnl('label.deviceIdX'),
      label_name: this.$i18n.tnl('label.location'),
      label_timestamp: this.$i18n.tnl('label.final-receive-timestamp'),
      label_powerLevel: this.$i18n.tnl('label.power-level'),
      label_receiveNormal: this.$i18n.tnl('label.receiveNormal'),
      label_state: this.$i18n.tnl('label.state'),
      label_undetect: this.$i18n.tnl('label.undetect'),
      label_nosignal: this.$i18n.tnl('label.no-signal', {min: TELEMETRY.NOSIGNAL / (60 * 1000)}),
      badgeClassPrefix: 'badge badge-pill badge-',
      csvHeaders: {
        [this.$i18n.tnl('label.deviceNum')]: APP.EXB_WITH_DEVICE_NUM ? 'deviceNum' : null,
        [this.$i18n.tnl('label.deviceId')]: APP.EXB_WITH_DEVICE_ID ? 'deviceId' : null,
        [this.$i18n.tnl('label.deviceIdX')]: APP.EXB_WITH_DEVICE_IDX ? 'deviceId(HEX)' : null,
        [this.$i18n.tnl('label.location')]: 'finalReceivePlace',
        [this.$i18n.tnl('label.final-receive-timestamp')]: 'timestamp',
        [this.$i18n.tnl('label.power-level')]: 'powerLevel',
        [this.$i18n.tnl('label.state')]: 'state'
      },
      interval: null,
    }
  },
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'telemetrys',
    ]),
    ...mapState('app_service', [
      'exbs',
    ]),
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
    isUndetect(yyymmddHHmiss) {
      const time = moment(yyymmddHHmiss).local().toDate().getTime()
      return new Date().getTime() - time > APP.UNDETECT_TIME
    },
    getTrClass (index, timestamp) {
      return this.isUndetect(timestamp) ? 'undetect' : (index % 2 === 1 ? 'odd' : '')
    },
    getTdClass (index, val, key) {
      const tdClass = !this.isDev && key === this.label_powerLevel ? 'powerlevel' : ''
      return tdClass + ' ' + (!this.isDev && (key === this.label_state || key === this.label_timestamp) ? 'exb-state' : '')
    },
    download() {
      const records = this.telemetrys.map(e => {
        const obj = {}
        Object.keys(e).filter(k => this.csvHeaders[k]).forEach(k => obj[this.csvHeaders[k]] = e[k])
        return obj
      })
      HtmlUtil.fileDL("telemetry.csv", Util.converToCsv(records), getCharSet(this.$store.state.loginId))
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
          [this.label_state]: this.exbState(e.timestamp)
        }
      })
    },
    getPowerLevelClass(val) {
      const num = parseInt(val , 10)
      if (79 < num) {
        return "fas fa-battery-full power-safe"
      }
      if (59 < num) {
        return "fas fa-three-quarters power-safe"
      }
      if (39 < num) {
        return "fas fa-half power-warning"
      }
      if (19 < num) {
        return "fas fa-battery-quarter power-empty"
      }
      return "fas fa-battery-empty power-empty"
    },
    exbState(updatetime) {
      const time = new Date().getTime() - moment(updatetime).local().toDate().getTime()
      return time < TELEMETRY.NOSIGNAL ? this.label_receiveNormal :
      (this.isUndetect(updatetime) ? this.label_undetect : this.label_nosignal)
    },
    exbStateClass(exbState) {
      return this.badgeClassPrefix + (exbState === this.label_receiveNormal ?
      'success' : (exbState === this.label_nosignal ? 'warning' : 'danger'))
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
    color: #00ff00;
  }
  
  .power-warning {
    color: #ffd700;
  }

  .power-empty {
    color: #b22222;
  }
</style>