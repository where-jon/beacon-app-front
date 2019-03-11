<template>
  <div>
    <breadcrumb :items="items" :reload="true" :is-load="isLoad" @reload="fetchData" />
    <div v-show="!isLoad" class="container">
      <monitor-table type="position" :vue-table-mode="isDev" :all-count="allCount" :headers="headers" :datas="positions" :tr-class="getClass" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import * as ViewHelper from '../../sub/helper/ViewHelper'
import * as HtmlUtil from '../../sub/util/HtmlUtil'
import * as Util from '../../sub/util/Util'
import { APP } from '../../sub/constant/config'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import commonmixinVue from '../../components/mixin/commonmixin.vue'
import reloadmixinVue from '../../components/mixin/reloadmixin.vue'
import { getCharSet } from '../../sub/helper/CharSetHelper'
import monitorTable from '../../components/parts/monitortable.vue'
import statusmixinVue from '../../components/mixin/statusmixin.vue'

export default {
  components: {
    breadcrumb,
    monitorTable,
  },
  mixins: [reloadmixinVue, commonmixinVue, statusmixinVue],
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
      isLoad: false,
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
    getHeaders(){
      return ViewHelper.addLabelByKey(this.isDev? null: this.$i18n,
        this.isDev? [
          { key: 'btx_id' },
          { key: 'device_id' },
          { key: 'pos_id' },
          { key: 'phase' },
          { key: 'power_level' },
          { key: 'updatetime' },
          { key: 'nearest1' },
          { key: 'nearest2' },
          { key: 'nearest3' },
        ]: [
          APP.POSITION_WITH_BTXID? { key: 'btx_id' }: null,
          { key: 'major' },
          { key: 'minor' },
          { key: 'name' },
          { key: 'powerLevel' },
          { key: 'finalReceiveLocation' },
          { key: 'finalReceiveTimestamp' },
          { key: 'state' },
        ].filter(val => val))
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
      if(APP.POSITION_WITH_BTXID){
        ret['btx_id'] = 'btx_id'
      }
      ret['major'] = 'major'
      ret['minor'] = 'minor'
      ret['name'] = 'name'
      ret['powerLevel'] = 'powerLevel'
      ret['finalReceiveLocation'] = 'finalReceiveLocation'
      ret['finalReceiveTimestamp'] = 'finalReceiveTimestamp'
      ret['state'] = 'state'
      return ret
    },
    getClass(position){
      return {undetect: this.isUndetect('tx', position.updatetime)}
    },
    async fetchSensorHistory(){
      const exCloudSensors = {}
      if(!Util.hasValue(APP.POSITION_SENSOR)){
        return exCloudSensors
      }
      for(let idx = 0; idx < APP.POSITION_SENSOR.length; idx++){
        exCloudSensors[`${APP.POSITION_SENSOR[idx]}`] = await EXCloudHelper.fetchSensor(APP.POSITION_SENSOR[idx])
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
          name: tx != null ? tx.txName : '—',
          finalReceiveLocation: exb? exb.location.locationName  : '',
          finalReceiveTimestamp: this.getTimestamp(e.updatetime),
          powerLevel: this.getPositionPowerLevelLabel(e.power_level),
          state: this.getStateLabel('tx', e.updatetime),
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
        position.power_level = target.power_level
        position.finalReceiveTimestamp = this.getTimestamp(EXCloudHelper.getDispTime(target))
        return position
      })
      return ret
    },
    getTimestamp(timestamp) {
      if (timestamp) {
        try {
          return Util.formatDate(timestamp)
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
      HtmlUtil.fileDL('position.csv', Util.converToCsv(dldata), getCharSet(this.$store.state.loginId))
    },
  }
}
</script>

<style scoped lang="scss">
</style>