<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table type="gw" :all-count="allCount" :headers="headers" :datas="gateways" :tr-class="getClass" />
    </div>
  </div>
</template>

<script>
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import monitorTable from '../../components/parts/monitortable.vue'
import statusmixin from '../../components/mixin/statusmixin.vue'
import { APP } from '../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [reloadmixin, commonmixin, statusmixin],
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('monitor', 'gateway'),
      gateways: [],
      headers: ViewHelper.addLabelByKey(this.isDev? null: this.$i18n, APP.SVC.POS.EXSERVER?[
        { key: 'deviceid', label: this.isDev? 'deviceid': 'deviceId'},
        { key: 'updated', label: this.isDev? 'updated': 'finalReceiveTimestamp'},
        { key: 'state'},
      ]:[
        { key: 'num' , label: 'no'},
        { key: 'deviceid', label: this.isDev? 'deviceid': 'deviceId'},
        { key: 'updated', label: this.isDev? 'updated': 'finalReceiveTimestamp'},
        { key: 'state'},
      ]),
      csvHeaders: APP.SVC.POS.EXSERVER ? {
        'deviceid': 'deviceid',
        'updated': 'updated',
        'state': 'state',
      } : {
        'num': 'num',
        'deviceid': 'deviceid',
        'updated': 'updated',
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
    if (!this.isDev) {
      return
    }
    this.items = ViewHelper.createBreadCrumbItems('develop', 'gateway')
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
        this.gateways = gateways.map((e) => {
          if(APP.SVC.POS.EXSERVER){
            const state = this.getStateLabel('gw', e.timestamp*1000)
            return { ...e, state: state }
          }else{
            const state = this.getStateLabel('gw', e.timestamp)
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
      const dldata = this.gateways.map((gw) => {
        const obj = {}
        Object.keys(this.csvHeaders).forEach(csvHeader => {
          obj[this.csvHeaders[csvHeader]] = gw[csvHeader]
        })
        return obj
      })
      HtmlUtil.fileDL('gateway.csv', Util.converToCsv(dldata), getCharSet(this.$store.state.loginId))
    },
  }
}
</script>

<style scoped lang="scss">
</style>