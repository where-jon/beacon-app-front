<template>
  <div class="container">
    <breadcrumb :items="items" :reload="true" />
    <NowLoading v-if="loading" />
    <div v-if="!loading">
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
import { EXB, DISP, APP } from '../../sub/constant/config'
import breadcrumb from '../../components/breadcrumb.vue'
import NowLoading from '../../components/nowloading.vue'
import VueScrollingTable from "vue-scrolling-table"
import { getTheme } from '../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    VueScrollingTable,
    NowLoading,
  },
  data () {
    return {
      loading: true,
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.telemetry'),
          active: true
        }
      ]
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
      this.loading = true
      try {
        let telemetrys = await EXCloudHelper.fetchTelemetry()
        if (payload && payload.done) {
          payload.done()
        }
        this.loading = false
        this.replaceMonitor({telemetrys})
      }
      catch(e) {
        console.error(e)
        this.loading = false
      }
    },
    isUndetect(updated) {
      return updated == "" || new Date() - new Date(updated) > APP.UNDETECT_TIME
    },
    getTdClass (index, timestamp) {
      return this.isUndetect(timestamp) ? 'undetect' : (index % 2 === 1 ? 'odd' : '')
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
  }
}
</script>

<style scoped lang="scss">
  @import "../../sub/constant/scrolltable.scss";
</style>