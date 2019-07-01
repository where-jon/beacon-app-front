<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" :state="reloadState" @reload="fetchData" />
    <div v-show="!reloadState.isLoad" class="container">
      <monitor-table ref="monitorTable" type="position" :vue-table-mode="isDev" :all-count="allCount" :headers="headers" :datas="positions" :tr-class="getClass" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../sub/constant/config'
import * as ArrayUtil from '../../sub/util/ArrayUtil'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as CsvUtil from '../../sub/util/CsvUtil'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import * as DetectStateHelper from '../../sub/helper/DetectStateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
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
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: ViewHelper.createBreadCrumbItems('monitor', 'position'),
      positions: [],
      headers: this.getHeaders(),
      reloadState: { isLoad: false },
      csvHeaders: this.getCsvHeaders(),
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs', 'exbs'
    ]),
    allCount() {
      return this.positions.length
    },
  },
  mounted() {
    this.fetchData()
    if (!this.isDev) {
      return
    }
    this.items = ViewHelper.createBreadCrumbItems('develop', 'position')
  },
  methods: {
    convertColumnName(name){
      if(name == 'btxId'){
        return 'btx_id'
      }
      if(name == 'locationName'){
        return 'finalReceiveLocation'
      }
      return name
    },
    getHeaders(){
      if(this.isDev){
        return ViewHelper.addLabelByKey(null, [
          { key: 'btx_id' }, { key: 'device_id' }, { key: 'pos_id' }, { key: 'phase' }, { key: 'power_level' }, { key: 'updatetime' }, { key: 'nearest1' }, { key: 'nearest2' }, { key: 'nearest3' },
        ])
      }
      return ViewHelper.addLabelByKey(this.$i18n, APP.TX_MON.WITH.map(val => ({
        key: this.convertColumnName(val)
      })).concat([
        { key: 'finalReceiveTimestamp' }, { key: 'state' }
      ]).filter(val => val))
    },
    getCsvHeaders(){
      if(this.isDev){
        return {
          'btx_id': 'btx_id',
          'device_id': 'device_id',
          'pos_id': 'pos_id',
          'phase': 'phase',
          'power_level': 'power_level',
          'updatetime': 'updatetime',
          'nearest1': 'nearest1',
          'nearest2': 'nearest2',
          'nearest3': 'nearest3',
        }
      }

      const ret = {}
      APP.TX_MON.WITH.forEach(val => {
        ret[this.convertColumnName(val)] = val == 'btxId'? 'btx_id': val
      })
      ret['finalReceiveTimestamp'] = 'timestamp'
      ret['state'] = 'state'
      return ret
    },
    getClass(position){
      return {undetect: DetectStateHelper.isUndetectFromDetail('tx', position.updatetime)}
    },
    async fetchSensorHistory(){
      const exCloudSensors = {}
      if(!ArrayUtil.includesIgnoreCase(APP.TX_MON.WITH_SENSOR)){
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
      if (this.isDev) {
        return positions.map((position) =>{
          return {
            ...position,
            nearest1: position.nearest && position.nearest.length > 0? position.nearest[0]: null,
            nearest2: position.nearest && position.nearest.length > 1? position.nearest[1]: null,
            nearest3: position.nearest && position.nearest.length > 2? position.nearest[2]: null,
          }
        })
      }
      await StateHelper.load('exb')
      await StateHelper.load('tx')
      return positions.map((e) => {
        const tx = this.txs.find((tx) => tx.btxId == e.btx_id)
        const exb = this.exbs.find((exb) => exb.location.posId == e.pos_id)
        return {
          ...e,
          name: tx != null ? tx.potName : '—',
          finalReceiveLocation: exb? exb.location.locationName  : '',
          finalReceiveTimestamp: this.getTimestamp(e.updatetime),
          powerLevel: this.$refs.monitorTable.getPositionPowerLevelLabel(e.power_level),
          state: this.$refs.monitorTable.getStateLabel('tx', e.updatetime),
          sensorIds: Util.getValue(tx, 'txSensorList', []).map(txSensor => txSensor.sensor.sensorId),
        }
      })
    },
    async margeSensorRecords(positions){
      if(this.isDev){
        return positions
      }
      const sensorHistories = await this.fetchSensorHistory()

      const ret = positions.map(position => {
        if(!Util.hasValue(position.sensorIds)){
          return position
        }
        const sensorDataList = []
        position.sensorIds.forEach(sensorId => {
          const mergeData = sensorHistories[`${sensorId}`]? sensorHistories[`${sensorId}`].find(sensorHistory => sensorHistory.btxid == position.btx_id): null
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
            const tx = this.txs.find(tx => tx.btxId == sensorHistory.btxid)
            sRet.push({
              ...sensorHistory,
              btx_id: sensorHistory.btxid,
              name: Util.getValue(tx, 'potName', ''),
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
      BrowserUtil.fileDL('position.csv', CsvUtil.converToCsv(dldata), getCharSet(this.$store.state.loginId))
    },
  }
}
</script>

<style scoped lang="scss">
</style>