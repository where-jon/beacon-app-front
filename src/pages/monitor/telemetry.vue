<template>
  <div>
    <breadcrumb :items="items" :reload="true" :isLoad="isLoad"  @click-reload-button="fetchData" />
    <div class="container">
      <b-row align-h="end">
        <b-col md="2" class="mb-3 mr-3">
          <b-button :variant='getTheme' @click="download()" v-t="'label.download'" />
        </b-col>
      </b-row>
      <div class="table-area">
        <table v-if="!isDev" class="table striped">
          <thead>
            <th scope="col" v-for="(val, key) in telemetrys[0]" :key="key" >{{ key }}</th>
          </thead>
          <tbody>
            <tr v-for="(telemetry, index) in telemetrys" :key="index">
              <td scope="row" v-for="(val, key) in telemetry" :key="key" :class="getTdClass(index, telemetry.timestamp, key)">
                <i :class="getPowerLevelClass(val)" v-if="key === label_powerLevel"></i>
                {{ val + (key !== label_powerLevel ? '' : '%') }}
              </td>
            </tr>
          </tbody>
        </table>
        <vue-scrolling-table v-if="isDev">
          <template slot="thead">
            <th scope="col" v-for="(val, key) in telemetrys[0]" :key="key" >{{ key }}</th>
          </template>
          <template slot="tbody">
            <tr v-for="(telemetry, index) in telemetrys" :key="index">
              <td scope="row" v-for="(val, key) in telemetry" :key="key" :class="getTdClass(index, telemetry.timestamp, key)">{{ val }}</td>
            </tr>
          </template>
        </vue-scrolling-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { EventBus } from '../../sub/helper/EventHelper'
import { EXB, DISP, APP, DEV } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import VueScrollingTable from "vue-scrolling-table"
import { getTheme } from '../../sub/helper/ThemeHelper'
import * as AppServiceHelper from '../../sub/helper/AppServiceHelper'

export default {
  components: {
    breadcrumb,
    VueScrollingTable,
  },
  data () {
    return {
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.telemetry'),
          active: true
        }
      ],
      isLoad: false,
      label_deviceId: this.$i18n.t('label.deviceId'),
      label_deviceIdX: this.$i18n.t('label.deviceIdX'),
      label_name: this.$i18n.t('label.name'),
      label_timestamp: this.$i18n.t('label.final-receive-timestamp'),
      label_powerLevel: this.$i18n.t('label.power-level'),
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
    getTheme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
    },
    ...mapState('monitor', [
      'telemetrys',
    ])
  },
  mounted() {
    this.interval = setInterval(()=>{
      this.fetchData()
    }, DISP.AUTO_RELOAD)
    this.replace({title: this.$i18n.t('label.telemetry')})
    this.fetchData()
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
  },
  beforeDestroy() {
    clearInterval(this.interval)
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
    isUndetect(updated) {
      return updated == "" || new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    getTdClass (index, timestamp, key) {
      const color = this.isUndetect(timestamp) ? 'undetect' : (index % 2 === 1 ? 'odd' : '')
      return color + ' ' + (!this.isDev && key === this.label_powerLevel ? 'powerlevel' : '')
    },
    download() {
      HtmlUtil.fileDL("telemetry.csv", Util.converToCsv(this.telemetrys))
    },
    ...mapMutations([
      'replace', 
    ]),
    ...mapMutations('monitor', [
      'replaceMonitor', 
    ]),
    async makeTelemetryRecords(telemetrys) {
      if (this.isDev) {
        return telemetrys
      }
      const exbs = await AppServiceHelper.fetchList('/core/exb/withLocation', 'exbId')
      const map = {}
      exbs.forEach((e) => {
        map[e.deviceId.toString(16)] = e.location.locationName
      })

      const that = this
      return telemetrys.map((e) => {
        const name = map[e.deviceid]
        const record = {
          [that.label_deviceId]: parseInt(e.deviceid, 16),
          [that.label_deviceIdX]: e.deviceid.toUpperCase(),
          [that.label_name]: (typeof name) !== 'undefined' ? name : 'ー',
          [that.label_timestamp]: e.timestamp,
          [that.label_powerLevel]:e.power_level * 2
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
    }
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