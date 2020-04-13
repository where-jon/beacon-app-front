<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table ref="monitorTable" type="tx" :all-count="allCount" :fields="fields" :list="positions" :tr-class="getClass" max-filter-length="40" />
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
import monitorTable from '../../components/parts/monitortable.vue'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [commonmixin, reloadmixin],
  data () {
    return {
      breadCrumbs: ViewHelper.createBreadCrumbItems('monitor', 'position'),
      fields: this.getHeaders(),
      positions: [],
      reloadState: { isLoad: false },
      csvHeaders: this.getCsvHeaders(),
      params: {
        name: 'position-list',
        id: 'positionListId',
      },
    }
  },
  computed: {
    allCount() {
      return this.positions.length
    },
  },
  mounted() {
    this.fetchData()
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
      return ViewHelper.addLabelByKey(this.$i18n, APP.TX_MON.WITH.map(val => ({
        key: this.convertColumnName(val), sortable: true, tdClass: 'action-rowdata'
      })).concat([
        { key: 'finalReceiveTimestamp', sortable: true, tdClass: 'action-rowdata' },
        { key: 'state' , sortable: true, tdClass: 'action-rowdata'},
        { key: 'powerLevelTimestamp' , sortable: true, tdClass: 'action-rowdata'},
      ]).filter(val => val))
    },
    getCsvHeaders(){
      const ret = {}
      APP.TX_MON.WITH.forEach(val => {
        ret[this.convertColumnName(val)] = val == 'btxId'? 'btxId': val
      })
      ret['finalReceiveTimestamp'] = 'timestamp'
      ret['state'] = 'state'
      return ret
    },
    getClass(position){
      return {undetect: DetectStateHelper.isUndetectFromDetail('tx', position.timestamp)}
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
      return positions.map(e => {
        const tx = this.btxIdMap[e.btxId]
        const exb = this.deviceIdMap[e.deviceId]
        return {
          ...e,
          name: tx != null ? tx.pot.potName : '—',
          finalReceiveLocation: Util.getValue(exb, 'location.locationName', ''),
          finalReceiveTimestamp: this.getTimestamp(e.timestamp),
          powerLevel: this.$refs.monitorTable.getPositionPowerLevelLabel ? this.$refs.monitorTable.getPositionPowerLevelLabel(e.power_level) : null,
          state: this.$refs.monitorTable.getStateLabel('tx', e.timestamp),
          sensorIdList: Util.getValue(tx, 'sensorList', []).map(sensor => sensor.sensorId),
          powerLevelTimestamp: this.getTimestamp(e.power_level_timestamp),
        }
      })
    },
    async margeSensorRecords(positions){
      const sensorHistories = await this.fetchSensorHistory()
      const ret = positions.map(position => {
        if(!Util.hasValue(position.sensorIdList)){
          return position
        }
        const sensorDataList = []
        position.sensorIdList.forEach(sensorId => {
          const mergeData = sensorHistories[`${sensorId}`]? sensorHistories[`${sensorId}`].find(sensorHistory => sensorHistory.btxId == position.btxId): null
          if(mergeData){
            sensorDataList.push(mergeData)
          }
        })
        if(!Util.hasValue(sensorDataList)){
          return position
        }
        const target = sensorDataList.reduce((prev, cur) => EXCloudHelper.getDispTime(prev) > EXCloudHelper.getDispTime(cur)? prev: cur)
        position.powerLevel = this.$refs.monitorTable.getPositionPowerLevelLabel(target.power_level),
        position.power_level = target.power_level
        position.finalReceiveTimestamp = this.getTimestamp(EXCloudHelper.getDispTime(target))
        return position
      })
      if(!Util.hasValue(ret)){
        const sRet = []
        Object.keys(sensorHistories).forEach(key => {
          sensorHistories[key].forEach(sensorHistory => {
            const tx = this.btxIdMap[sensorHistory.btxId]
            sRet.push({
              ...sensorHistory,
              btxId: sensorHistory.btxId,
              name: Util.getValue(tx, 'pot.potName'),
              powerLevel: this.$refs.monitorTable.getPositionPowerLevelLabel(sensorHistory.power_level),
              finalReceiveTimestamp: this.getTimestamp(EXCloudHelper.getDispTime(sensorHistory)),
              state: this.$refs.monitorTable.getStateLabel('tx', EXCloudHelper.getDispTime(sensorHistory)),
            })
          })
        })
        return sRet
      }
      return ret
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
      const ret = []
      APP.TX_MON.WITH.forEach((key) => {
        if (key == 'locationName') {
          ret.push(this.$i18n.tnl('label.finalReceiveLocation'))
        } else {
          ret.push(this.$i18n.tnl('label.' + key))
        }
      })
      ret.push(this.$i18n.tnl('label.finalReceiveTimestamp'))
      ret.push(this.$i18n.tnl('label.state'))
      ret.push('\n')
      return ret
    }
  }
}
</script>

<style scoped lang="scss">
</style>