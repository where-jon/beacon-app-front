<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table ref="monitorTable" type="position" :vue-table-mode="isDev" :all-count="allCount" :headers="headers" :datas="positions" :tr-class="getClass" />
    </div>
  </div>
</template>

<script>
import { APP } from '../../sub/constant/config'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/base/CharSetHelper'
import * as DetectStateHelper from '../../sub/helper/domain/DetectStateHelper'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixin from '../../components/mixin/commonmixin.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import monitorTable from '../../components/parts/monitortable-dev.vue'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [commonmixin, reloadmixin],
  data () {
    return {
      isDev: true,
      items: ViewHelper.createBreadCrumbItems('develop', 'position'),
      headers: this.getHeaders(),
      positions: [],
      reloadState: { isLoad: false },
      csvHeaders: this.getCsvHeaders(),
    }
  },
  computed: {
    allCount() {
      return this.positions.length
    },
  },
  mounted() {
    this.fetchData()
    this.items = ViewHelper.createBreadCrumbItems('develop', 'position')
  },
  methods: {
    convertColumnName(name){
      if(name == 'btxId'){
        return 'btxId'
      }
      if(name == 'locationName'){
        return 'finalReceiveLocation'
      }
      return name
    },
    getHeaders(){
      return ViewHelper.addLabelByKey(null, [
        { key: 'btxId' }, { key: 'deviceId' }, { key: 'pos_id' }, { key: 'phase' }, { key: 'power_level' }, { key: 'updatetime' }, { key: 'nearest1' }, { key: 'nearest2' }, { key: 'nearest3' },
      ])
    },
    getCsvHeaders(){
      return {
        'btxId': 'btxId',
        'deviceId': 'deviceId',
        'pos_id': 'pos_id',
        'phase': 'phase',
        'power_level': 'power_level',
        'updatetime': 'updatetime',
        'nearest1': 'nearest1',
        'nearest2': 'nearest2',
        'nearest3': 'nearest3',
      }
    },
    getClass(position){
      return {undetect: DetectStateHelper.isUndetectFromDetail('tx', position.updatetime)}
    },
    async fetchSensorHistory(){
      const exCloudSensors = {}
      if(!Util.hasValue(APP.TX_MON.WITH_SENSOR)){
        return exCloudSensors
      }
      for(let idx = 0; idx < APP.TX_MON.WITH_SENSOR.length; idx++){
        exCloudSensors[`${APP.TX_MON.WITH_SENSOR[idx]}`] = await EXCloudHelper.fetchSensor(APP.TX_MON.WITH_SENSOR[idx])
      }
      return exCloudSensors
    },
    async fetchData(payload) {
      this.showProgress()
      this.isLoad = true
      try {
        const positions = await EXCloudHelper.fetchRawPosition()
        this.positions = await this.makePositionRecords(positions)
        this.positions = await this.margeSensorRecords(this.positions)
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
    async makePositionRecords(positions) {
      return positions.map((position) =>{
        return {
          ...position,
          nearest1: position.nearest && position.nearest.length > 0? position.nearest[0]: null,
          nearest2: position.nearest && position.nearest.length > 1? position.nearest[1]: null,
          nearest3: position.nearest && position.nearest.length > 2? position.nearest[2]: null,
        }
      })
    },
    async margeSensorRecords(positions){
      return positions
    },
    getTimestamp(timestamp) {
      if (timestamp) {
        try {
          return DateUtil.formatDate(timestamp)
        } catch (e) {}
      }
      return this.$i18n.tnl('label.undetect')
    },
    download() {
      const dldata = this.positions.map((pos) => {
        const obj = {}
        Object.keys(this.csvHeaders).forEach(csvHeader => {
          obj[this.csvHeaders[csvHeader]] = pos[csvHeader]
        })
        return obj
      })
      BrowserUtil.fileDL(
        'position.csv', 
        CsvUtil.converToCsv(dldata, null, this.getCsvHeaderList()), 
        getCharSet(this.$store.state.loginId)
      )
    },
    getCsvHeaderList() {
      return [
        'btxId',
        'deviceId',
        'pos_id',
        'phase',
        'power_level',
        'updatetime',
        'nearest1',
        'nearest2',
        'nearest3',
        '\n'
      ]
    }
  }
}
</script>

<style scoped lang="scss">
</style>