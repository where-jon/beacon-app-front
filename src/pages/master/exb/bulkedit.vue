<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import { APP } from '../../../sub/constant/config.js'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'exb',
      id: 'exbId',
      backPath: '/master/exb',
      appServicePath: '/core/exb',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.exb'),
          href: '/master/exb',
        },
        {
          text: this.$i18n.tnl('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'exb', 'exbs',
    ]),
    sensorOptionsExb() {
      const options = this.$refs.bulkEdit.sensorOptions('exb')
      return options
    },
  },
  methods: {
    resetId(entity, dummyKey){
      const targetEntity = Util.getEntityFromIds(this.exbs, entity, ['exbId', 'deviceNum', 'deviceId', 'deviceIdX'])
      entity.exbId = targetEntity && targetEntity.exbId? targetEntity.exbId: dummyKey--
      if(!entity.deviceId){
        if(entity.deviceNum){
          entity.deviceId = Number(entity.deviceNum) + this.$store.state.currentRegion.deviceOffset
        }
        else if(entity.deviceIdX){
          entity.deviceId = parseInt(entity.deviceIdX, 16)
        }
      }
      if(targetEntity){
        if(entity.location && targetEntity.location){
          if(!entity.location.txViewType){
            entity.location.txViewType = targetEntity.location.txViewType
          }
          if(entity.location.visible == null){
            entity.location.visible = targetEntity.location.visible
          }
        }
      }
      return dummyKey
    },
    setParamZone(entity, headerName, val, dummyKey){
      if (!entity.location) {
        entity.location = {locationId: dummyKey--}
      }
      entity.location.locationZoneList = [{
        locationZonePK: {
          locationId: dummyKey--,
          zoneId: dummyKey--
        },
        zone: {
          zoneId: dummyKey--,
          zoneName: val,
          areaId: dummyKey--,
        }
      }]
      return dummyKey
    },
    setParamPosId(entity, headerName, val, dummyKey){
      const posIdVal = Number(val)
      if(isNaN(posIdVal)){
        entity.location['posIdName'] = val
      }
      entity.location[headerName] = posIdVal
      return dummyKey
    },
    setParamSensor(entity, headerName, val, dummyKey){
      const sensor = this.sensorOptionsExb.find((option) => option.text == val)
      if(sensor && sensor.value != null){
        entity.exbSensorList = [{exbSensorPK: {sensorId: sensor.value}, sensorName: val}]
      }
      else if(!sensor){
        entity.exbSensorList = [{exbSensorPK: {sensorId: dummyKey--}, sensorName: val}]
      }
      return dummyKey
    },
    setParamOther(entity, headerName, val, dummyKey, mainCol){
      if (headerName == mainCol && !val) {
        val = dummyKey--
      }
      if(headerName == 'enabled'){
        const enabledVal = Util.str2booleanComplate(val)
        if(typeof enabledVal != 'boolean'){
          entity['enabledName'] = val
        }
        val = Util.str2boolean(val)
      }
      entity[headerName] = val
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = APP.EXB_WITH_EXBID? 'exbId': APP.EXB_WITH_DEVICE_ID? 'deviceId': APP.EXB_WITH_DEVICE_NUM? 'deviceNum': 'deviceIdX'
      const LOCATION = ['locationId','areaName','locationName','visible','txViewType','posId','x','y', 'zoneName']
      const ZONE = ['zoneName']
      const NUMBER_TYPE_LIST = ['deviceId', 'exbId', 'areaId', 'locationId', 'x', 'y', 'z', 'txViewType']
      const BOOL_TYPE_LIST = ['visible']

      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, LOCATION)) {
          if (headerName == 'locationId' && !val) {
            val = dummyKey--          
          }
          if (!entity.location) {
            entity.location = {locationId: dummyKey--}
          }
          if (Util.equalsAny(headerName, ZONE)) {
            dummyKey = this.setParamZone(entity, headerName, val, dummyKey)
          }
          else if(headerName == 'posId'){
            dummyKey = this.setParamPosId(entity, headerName, val, dummyKey)
          }
          else{
            entity.location[headerName] = val
          }
        }
        else if (headerName == 'sensor') {
          dummyKey = this.setParamSensor(entity, headerName, val, dummyKey)
        }
        else {
          dummyKey = this.setParamOther(entity, headerName, val, dummyKey, MAIN_COL)
        }
        return dummyKey
      },
      (entity, dummyKey) => this.resetId(entity, dummyKey)
      )},
  }
}
</script>

<style scoped lang="scss">

</style>