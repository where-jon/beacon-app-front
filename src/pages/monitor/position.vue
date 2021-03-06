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
        { key: 'powerLevelTimestamp' , sortable: true, tdClass: 'action-rowdata'},
        { key: 'state' , sortable: true, tdClass: 'action-rowdata'},
      ]).filter(val => val))
    },
    getCsvHeaders(){
      const ret = {}
      APP.TX_MON.WITH.forEach(val => {
        ret[this.convertColumnName(val)] = val == 'btxId'? 'btxId': val
      })
      ret['finalReceiveTimestamp'] = 'timestamp'
      ret['powerLevelTimestamp'] = 'powerLevelTimestamp'
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
      for(let sensorId in sensorHistories) {
        const hist = sensorHistories[sensorId]
        hist.forEach(e => {
          const pos = positions.find(pos => pos.btxId == e.btx_id || pos.btxId == e.btxId)
          if(pos){
            // 測位結果にセンサー情報をマージ
            if(e.power_level){
              pos.power_level = e.power_level
              pos.powerLevelTimestamp = this.getTimestamp(EXCloudHelper.getDispTime(e))
            }else if(e.battery_level){
              pos.power_level = e.battery_level
              pos.powerLevelTimestamp = this.getTimestamp(EXCloudHelper.getDispTime(e))
            }            
          }else{
            // 測位がない場合は追加
            const btxId = e.btxId ? e.btxId : e.btx_id
            if(btxId){
              const tx = this.btxIdMap[btxId]
              const powerLevel = e.power_level ? e.power_level : e.battery_level
              positions.push({
                ...e,
                btxId,
                name: Util.getValue(tx, 'pot.potName'),
                power_level: powerLevel,
                timestamp: EXCloudHelper.getDispTime(e),
                powerLevelTimestamp: this.getTimestamp(EXCloudHelper.getDispTime(e)),
                finalReceiveTimestamp: this.getTimestamp(EXCloudHelper.getDispTime(e)),
                state: this.$refs.monitorTable.getStateLabel('tx', EXCloudHelper.getDispTime(e)),
              })
            }
          }
        })
      }
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
      const ret = []
      APP.TX_MON.WITH.forEach((key) => {
        if (key == 'locationName') {
          ret.push(this.$i18n.tnl('label.finalReceiveLocation'))
        } else {
          ret.push(this.$i18n.tnl('label.' + key))
        }
      })
      ret.push(this.$i18n.tnl('label.finalReceiveTimestamp'))
      ret.push(this.$i18n.tnl('label.powerLevelTimestamp'))
      ret.push(this.$i18n.tnl('label.state'))
      ret.push('\n')
      return ret
    }
  }
}
</script>

<style scoped lang="scss">
</style>