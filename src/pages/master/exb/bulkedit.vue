<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import * as Util from '../../../sub/util/Util'
import { BULK } from '../../../sub/constant/Constants'
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
      items: ViewHelper.createBreadCrumbItems('master', {text: 'exb', href: '/master/exb'}, 'bulkRegister'),
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
      if(Util.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX') && !entity.deviceId && !entity.deviceIdXName){
        entity.deviceId = parseInt(entity.deviceIdX, 16)
      }
      return dummyKey
    },
    setParamZone(location, headerName, val, dummyKey){
      if(!Util.hasValue(val)){
        return dummyKey
      }
      location.locationZoneList = [{
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
    setParamSensor(entity, headerName, val, dummyKey){
      const sensorNameList = val.split(';').map(val => val.trim())
      const exbSensorList = []
      sensorNameList.forEach(sensorName => {
        const sensor = this.sensorOptionsExb.find(option => option.text == sensorName)
        if(sensor && sensor.value != null){
          exbSensorList.push({exbSensorPK: {sensorId: sensor.value}, sensorName: sensorName})
        }
        else if(!sensor){
          exbSensorList.push({exbSensorPK: {sensorId: dummyKey--}, sensorName: sensorName})
        }
      })
      if(exbSensorList.length != 0){
        entity.exbSensorList = exbSensorList
      }
      return dummyKey
    },
    setParamLocation(entity, headerName, val, dummyKey){
      if (!entity.location) {
        entity.location = {locationId: dummyKey--}
      }
      if (headerName == 'zoneName') {
        return this.setParamZone(entity.location, headerName, val, dummyKey)
      }
      if(headerName == 'posId'){
        BulkHelper.setNumberKey(entity.location, headerName, val)
        return dummyKey
      }
      if(Util.equalsAny(headerName, ['x', 'y'])){
        BulkHelper.setNumberKey(entity.location, headerName, val, {isNullable: true, errorName: 'loc'+ headerName.toUpperCase() + 'Name'})
        return dummyKey
      }
      entity.location[headerName] = val
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const LOCATION = ['areaName','locationName','visible','txViewType','posId','x','y', 'zoneName']
      const BOOL_TYPE_LIST = ['enabled']

      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        if(headerName == 'deviceId'){
          BulkHelper.setNumberKey(entity, headerName, val, {isNullable: !Util.includesIgnoreCase(APP.EXB.WITH, 'deviceId')})
          return dummyKey
        }
        if(headerName == 'deviceIdX'){
          BulkHelper.setHexKey(entity, headerName, val, {isNullable: !Util.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX')})
          return dummyKey
        }
        if(Util.equalsAny(headerName, BOOL_TYPE_LIST)){
          BulkHelper.setBooleanKey(entity, headerName, val)
          return dummyKey
        }

        if (headerName == 'sensor') {
          return this.setParamSensor(entity, headerName, val, dummyKey)
        }
        if (Util.equalsAny(headerName, LOCATION)) {
          return this.setParamLocation(entity, headerName, val, dummyKey)
        }
        entity[headerName] = val
        return dummyKey
      },
      (entity, dummyKey) => this.resetId(entity, dummyKey)
      )},
  }
}
</script>

<style scoped lang="scss">

</style>