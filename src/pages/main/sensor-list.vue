<template>
  <div class="container-fluid">
    <breadcrumb :items="items" :reload="true" />
    <m-list :params="params" :list="sensorList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { SENSOR } from '../../sub/constant/Constants'
import * as EXCloudHelper from '../../sub/helper/dataproc/EXCloudHelper'
import * as PositionHelper from '../../sub/helper/domain/PositionHelper'
import * as SensorHelper from '../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import * as NumberUtil from '../../sub/util/NumberUtil'
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
    // await Promise.all(['category', 'sensor', 'location', 'area', 'tx', 'exb'].map(StateHelper.load))
    // await Promise.all([].map(StateHelper.load))
  },
  mounted() {
    this.sensorChange(this.selectedSensor)
  },
  methods: {
    async sensorChange(sensorId){
      this.params.fields.length = 0
      SensorHelper.getFields(sensorId).forEach(val => this.params.fields.push(val))
      this.selectedSensor = sensorId
      await this.fetchData()
    },
    async fetchData(payload) {
      try {
        this.sensorList = []
        this.params.initTotalRows = 0
        this.showProgress()

        let exCluodSensors = await EXCloudHelper.fetchSensor(this.selectedSensor, false)
        // オムロン系はレスポンスが違うので変換する
        if(this.selectedSensor == SENSOR.OMR_ENV){
          exCluodSensors = exCluodSensors.sensors.map(sensor => {
            return {...sensor, sensorid: sensor.pos_id, btx_id: sensor.sensor_id, updatetime: sensor.timestamp}
          })
        }
        const positions = await PositionHelper.loadPosition(null, true, true)
        const positionedExb = SensorHelper.getPositionedExbWithSensor(this.selectedSensor, exCluodSensors)
        let positionedTx = SensorHelper.getPositionedTxWithSensor(this.selectedSensor, exCluodSensors, positions)

        this.sensorList = positionedExb.concat(positionedTx).map(sensor =>{
          return {
            ...sensor,
            temperature: NumberUtil.formatTemperature(sensor.temperature),
            humidity: NumberUtil.formatHumidity(sensor.humidity),
          }
        })
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
