<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table ref="monitorTable" type="gw" :all-count="allCount" :fields="fields" :list="gateways" :tr-class="getClass" max-filter-length="40" />
    </div>
  </div>
</template>

<script>
import { DISP, EXSERVER } from '../../sub/constant/config'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
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
      breadCrumbs: ViewHelper.createBreadCrumbItems('monitor', 'gateway'),
      fields: ViewHelper.addLabelByKey(this.$i18n, EXSERVER.ENABLE?[
        { key: 'deviceId', label: 'deviceId', sortable: true, tdClass: 'action-rowdata'},
        { key: 'updated', label: 'finalReceiveTimestamp', sortable: true, tdClass: 'action-rowdata'},
        { key: 'state', sortable: true, tdClass: 'action-rowdata'},
      ]:[
        { key: 'num' , label: 'no', sortable: true, tdClass: 'action-rowdata'},
        { key: 'deviceId', label: 'deviceId', sortable: true, tdClass: 'action-rowdata'},
        { key: 'updated', label: 'finalReceiveTimestamp', sortable: true, tdClass: 'action-rowdata'},
        { key: 'state'},
      ]),
      gateways: [],
      csvHeaders: EXSERVER.ENABLE ? {
        'deviceId': 'deviceId',
        'updated': 'timestamp',
        'state': 'state',
      } : {
        'num': 'num',
        'deviceId': 'deviceId',
        'updated': 'timestamp',
        'state': 'state',
      },
      reloadState: { isLoad: false },
    }
  },
  computed: {
    allCount() {
      return this.gateways.length
    },
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    getClass(gateway){
      return {undetect: DetectStateHelper.isUndetectFromDetail('gw', gateway.updated)}
    },
    async fetchData(payload) {
      this.showProgress()
      this.isLoad = true
      try {
        const gateways = await EXCloudHelper.fetchGateway()
        if (payload && payload.done) {
          payload.done()
        }
        this.gateways = gateways.map(e => {
          if(EXSERVER.ENABLE){
            e.timestamp *= 1000
            const state = this.$refs.monitorTable.getStateLabel('gw', e.timestamp)
            return { ...e, state: state }
          }else{
            const state = this.$refs.monitorTable.getStateLabel('gw', e.timestamp)
            return { ...e, state: state }
          }
        })
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
      this.isLoad = false
    },
    download() {
      const dldata = this.gateways.map(gw => {
        const obj = {}
        Object.keys(this.csvHeaders).forEach(csvHeader => {
          obj[this.csvHeaders[csvHeader]] = gw[csvHeader]
        })
        return obj
      })
      BrowserUtil.fileDL(
        'gateway.csv', 
        CsvUtil.converToCsv(dldata, null, this.getCsvHeaderList()), 
        getCharSet(this.$store.state.loginId)
      )
    },
    getCsvHeaderList() {
      return EXSERVER.ENABLE ? [
        this.$i18n.tnl('label.deviceId'),
        this.$i18n.tnl('label.finalReceiveTimestamp'),
        this.$i18n.tnl('label.state'),
        '\n'
      ]: [
        this.$i18n.tnl('label.no'),
        this.$i18n.tnl('label.deviceId'),
        this.$i18n.tnl('label.finalReceiveTimestamp'),
        this.$i18n.tnl('label.state'),
        '\n'
      ]
    }
  }
}
</script>

<style scoped lang="scss">
</style>