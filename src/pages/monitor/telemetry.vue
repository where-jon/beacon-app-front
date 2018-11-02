<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad"  @reload="fetchData" />
    <div class="container" v-show="!isLoad">
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button :variant='theme' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th scope="col" v-for="(val, key) in telemetrys[0]" :key="key">{{ key }}</th>
          </thead>
          <tbody>
            <tr v-for="(telemetry, index) in telemetrys" :key="index" :class="getTrClass(index, telemetry[label_timestamp])">
              <td scope="row" v-for="(val, key) in telemetry" :key="key" :class="getTdClass(index, val, key)">
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
      isLoad: false,
      label_deviceId: this.$i18n.tnl('label.deviceId'),
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
        [this.$i18n.tnl('label.deviceId')]: 'deviceId',
        [this.$i18n.tnl('label.deviceIdX')]: 'deviceId(HEX)',
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
        Object.keys(e).forEach(k => {
          obj[this.csvHeaders[k]] = e[k]
        })
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
        const record = {
          [this.label_deviceId]: parseInt(e.deviceid, 16),
          [this.label_deviceIdX]: e.deviceid.toUpperCase(),
          [this.label_name]: name != null ? name : 'ー',
          [this.label_powerLevel]:e.power_level * 2,
          [this.label_timestamp]: e.timestamp,
          [this.label_state]: this.exbState(e.timestamp)
        }
        return record
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

  tbody {
    display:block;
    height:400px;
    overflow:auto;
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