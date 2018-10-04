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
        <vue-scrolling-table>
          <template slot="thead">
            <th scope="col" v-for="(val, key) in telemetrys[0]" :key="key" >{{ key }}</th>
          </template>
          <template slot="tbody">
            <tr v-for="(telemetry, index) in telemetrys" :key="index">
              <td scope="row" v-for="(val, key) in telemetry" :key="key" :class="getTdClass(index, telemetry.timestamp)">{{ val }}</td>
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
    this.replace({title: this.$i18n.t('label.telemetry')})
    this.fetchData()
  },
  created(){
    EventBus.$on('reload', (payload)=>{
       this.fetchData(payload)
    })
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
    getTdClass (index, timestamp) {
      const color = this.isUndetect(timestamp) ? 'undetect' : (index % 2 === 1 ? 'odd' : '')
      return color + ' ' + (DEV.DEBUG < 1 ? 'equality' : '')
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

      const label_deviceId = this.$i18n.t('label.deviceId')
      const label_deviceIdX = this.$i18n.t('label.deviceIdX')
      const label_name = this.$i18n.t('label.name')
      const label_timestamp = this.$i18n.t('label.final-receive-timestamp')
      const label_powerLevel = this.$i18n.t('label.power-level')

      return telemetrys.map((e) => {
        const name = map[e.deviceid]
        const record = {}
        record[label_deviceId] = parseInt(e.deviceid, 16)
        record[label_deviceIdX] = e.deviceid.toUpperCase()
        record[label_name] = (typeof name) !== 'undefined' ? name : 'ー'
        record[label_timestamp] = e.timestamp
        record[label_powerLevel] = e.power_level * 2
        return record
      })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../../sub/constant/scrolltable.scss";

  table.scrolling td.equality {
    width: 20%;
  }
</style>