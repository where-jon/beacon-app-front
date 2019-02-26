<template>
  <div>
    <breadcrumb :items="items" :reload="true" />
    <m-list :params="params" :list="sensorList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import breadcrumb from '../../components/layout/breadcrumb.vue'
import mList from '../../components/page/list.vue'
import listmixinVue from '../../components/mixin/listmixin.vue'
import showmapmixin from '../../components/mixin/showmapmixin.vue'
import * as StateHelper from '../../sub/helper/StateHelper'
import * as SensorHelper from '../../sub/helper/SensorHelper'
import * as EXCloudHelper from '../../sub/helper/EXCloudHelper'
import { SENSOR } from '../../sub/constant/Constants'
import * as Util from '../../sub/util/Util'
import moment from 'moment'

export default {
  components: {
    mList,
    breadcrumb,
  },
  mixins: [
    listmixinVue,
    showmapmixin,
  ],
  data() {
    return {
      params: {
        name: 'position-list',
        id: 'positionListId',
        extraFilter: ['sensor', 'area', 'zone', 'zoneCategory'],
        sensorChange: newVal => this.sensorChange(newVal),
        showOnlyHas: ['zone', 'zoneCategory'],
        disableTableButtons: true,
        hideNormalSearchBox: true,
        fields: [],
        initTotalRows: 0,
      },
      items: [
        {
          text: this.$i18n.t('label.main'),
          active: true
        },
        {
          text: this.$i18n.t('label.sensorList'),
          active: true
        }
      ],
      selectedSensor: SENSOR.TEMPERATURE,
      sensorList: [],
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
    await StateHelper.load('category')
    await StateHelper.load('sensor')
    await StateHelper.load('area')
    await StateHelper.load('tx')
    await StateHelper.load('exb')
  },
  mounted() {
    this.sensorChange(this.selectedSensor)
  },
  methods: {
    async sensorChange(sensorId){
      this.params.fields.length = 0
      SensorHelper.getFields(sensorId, this.$i18n).forEach((val) => this.params.fields.push(val))
      this.selectedSensor = sensorId
      await this.fetchData()
    },
    createDeviceInfo(device){
      const d = new Date(device.updatetime)
      return {
        sensorDt: moment(d.getTime()).format('YYYY/MM/DD HH:mm:ss'),
        txName: Util.getValue(device, 'txName', ''),
        deviceId: Util.getValue(device, 'deviceId', ''),
        deviceNum: Util.getValue(device, 'deviceNum', ''),
        deviceIdX: Util.getValue(device, 'deviceIdX', ''),
        locationName: Util.getValue(device, 'locationName', ''),
        posId: Util.getValue(device, 'posId', ''),
        areaName: Util.getValue(device, 'areaName', ''),
        major: Util.getValue(device, 'major', ''),
        minor: Util.getValue(device, 'minor', ''),
        temperature: Util.getValue(device, 'temperature', ''),
        humidity: Util.getValue(device, 'humidity', ''),
        count: Util.getValue(device, 'count', ''),
        high: Util.getValue(device, 'high', ''),
        low: Util.getValue(device, 'low', ''),
        beat: Util.getValue(device, 'beat', ''),
        step: Util.getValue(device, 'step', ''),
        down: Util.getValue(device, 'down', ''),
        state: SensorHelper.getMagnetStateKey(this.$i18n, Util.getValue(device, 'magnet', '')),
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
        const positionHistory = await this.storePositionHistory()
        this.getPositionedExb(
          (exb) => exb.sensorId == this.selectedSensor,
          (exb) => {return {id: this.selectedSensor, ...exCluodSensors.find((sensor) => sensor.deviceid == exb.deviceId && (sensor.timestamp || sensor.updatetime))}},
          null, true
        )
        this.getPositionedTx(
          (tx) => tx.sensorId == this.selectedSensor,
          (tx) => {
            const ret = {
              id: this.selectedSensor,
              ...exCluodSensors.find((sensor) => sensor.btx_id == tx.btxId && (sensor.timestamp || sensor.updatetime)),
            }
            if(this.selectedSensor == SENSOR.MEDITAG){
              const pos = positionHistory.find((position) => position.btx_id == tx.btxId)
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

        this.sensorList = this.positionedExb.concat(this.positionedTx).map((device) => {
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
