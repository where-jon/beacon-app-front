<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <m-list :params="params" :list="sensorList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { SENSOR } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as NumberUtil from '../../sub/util/NumberUtil'
import * as Util from '../../sub/util/Util'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import reloadmixin from '../../components/mixin/reloadmixin.vue'
import mList from '../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList,
  },
  mixins: [reloadmixin],
  data() {
    return {
      params: {
        name: 'position-list',
        id: 'positionListId',
        extraFilter: ['sensor', 'area', 'zone', 'zoneCategory'],
        initTotalRows: 0,
        sensorChange: newVal => this.sensorChange(newVal),
        showOnlyHas: ['zone', 'zoneCategory'],
        disableTableButtons: true,
        hideNormalSearchBox: true,
        fields: [],
      },
      items: ViewHelper.createBreadCrumbItems('main', 'sensorList'),
      sensorList: [],
      selectedSensor: SENSOR.TEMPERATURE,
    }
  },
  computed: {
    ...mapState('app_service', [
      'sensors',
      'txs',
      'areas',
      'exbs',
    ]),
  },
  async created() {
    await Promise.all(['category', 'sensor', 'area', 'tx', 'exb'].map(StateHelper.load))
  },
  mounted() {
    this.sensorChange(this.selectedSensor)
  },
  methods: {
    async sensorChange(sensorId){
      this.params.fields.length = 0
      SensorHelper.getFields(sensorId).forEach((val) => this.params.fields.push(val))
      this.selectedSensor = sensorId
      await this.fetchData()
    },
    createDeviceInfo(device){
      const d = new Date(device.updatetime)
      return {
        sensorDt: DateUtil.formatDate(d.getTime()),
        potName: Util.getValue(device, 'potName', ''),
        deviceId: Util.getValue(device, 'deviceId', ''),
        deviceIdX: Util.getValue(device, 'deviceIdX', ''),
        locationName: Util.getValue(device, 'locationName', ''),
        posId: Util.getValue(device, 'posId', ''),
        areaName: Util.getValue(device, 'areaName', ''),
        major: Util.getValue(device, 'major', ''),
        minor: Util.getValue(device, 'minor', ''),
        temperature: NumberUtil.formatTemperature(Util.getValue(device, 'temperature', '')),
        humidity: NumberUtil.formatHumidity(Util.getValue(device, 'humidity', '')),
        count: Util.getValue(device, 'count', ''),
        high: Util.getValue(device, 'high', ''),
        low: Util.getValue(device, 'low', ''),
        beat: Util.getValue(device, 'beat', ''),
        step: Util.getValue(device, 'step', ''),
        down: Util.getValue(device, 'down', ''),
        pressVol: Util.getValue(device, 'pressVol', ''),
        state: SensorHelper.getMagnetStateKey(Util.getValue(device, 'magnet', '')),
        areaId: Util.getValue(device, 'areaId', ''),
        zoneId: Util.getValue(device, 'zoneId', ''),
        zoneCategoryId: Util.getValue(device, 'zoneCategoryId', ''),
      }
    },
    async fetchData(payload) {
      try {
        this.sensorList = []
        this.params.initTotalRows = 0
        this.showProgress()

        const exCluodSensors = await EXCloudHelper.fetchSensor(this.selectedSensor)
        const positionHistory = await PositionHelper.storePositionHistory()
        const positionedExb = PositionHelper.getPositionedExbWithSensor(this.selectedArea,
          (exb) => exb.sensorId == this.selectedSensor,
          (exb) => {return {id: this.selectedSensor, ...exCluodSensors.find((sensor) => sensor.deviceid == exb.deviceId && (sensor.timestamp || sensor.updatetime))}},
          null, true
        )
        let positionedTx = PositionHelper.getPositionedTx(this.selectedArea,
          (tx) => tx.sensorId == this.selectedSensor,
          (tx) => {
            const ret = {
              id: this.selectedSensor,
              ...exCluodSensors.find((sensor) => (sensor.btxid == tx.btxId || sensor.btx_id == tx.btxId) && (sensor.timestamp || sensor.updatetime)),
            }
            if(this.selectedSensor == SENSOR.MEDITAG){
              const pos = positionHistory.find((position) => position.txId == tx.txId || position.btx_id == tx.btxId)
              if(!ret.areaId){
                ret.areaId = pos && pos.exb? pos.exb.areaId: null
              }
              if(!ret.zoneId){
                ret.zoneId = pos && pos.exb? pos.exb.zoneId: null
              }
              if(!ret.zoneCategoryId){
                ret.zoneCategoryId = pos && pos.exb? pos.exb.zoneCategoryId: null
              }
            }
            return ret
          },
          null, true, this.selectedSensor == SENSOR.MEDITAG
        )

        this.sensorList = positionedExb.concat(positionedTx).map((device) => {
          return this.createDeviceInfo(device)
        }).filter((device) => device)
        this.params.initTotalRows = this.sensorList.length

        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
  }
}
</script>

<style scoped lang="scss">

</style>
