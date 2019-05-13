<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
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
      const targetEntity = Util.getEntityFromIds(this.exbs, entity, ['exbId', 'deviceNum', 'deviceId', 'deviceIdX'])
      if(!entity.exbId){
        entity.exbId = targetEntity && targetEntity.exbId? targetEntity.exbId: dummyKey--
      }
      if(!entity.deviceId){
        if(entity.deviceNum && !isNaN(entity.deviceNum) && 0 <= entity.deviceNum){
          entity.deviceId = Number(entity.deviceNum) + this.$store.state.currentRegion.deviceOffset
        }
        else if(entity.deviceIdX && !isNaN(`0x${entity.deviceIdX}`)){
          entity.deviceId = parseInt(entity.deviceIdX, 16)
        }
      }
      else{
        if(isNaN(entity.deviceId) || entity.deviceId < 0){
          delete entity.deviceId
        }
      }
      if(targetEntity){
        if(entity.location && targetEntity.location){
          if(entity.location.locationId < 0){
            entity.location.locationId = targetEntity.location.locationId
          }
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
      if(!Util.hasValue(val)){
        return dummyKey
      }
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
      if(!Util.hasValue(val) || isNaN(posIdVal)){
        entity.location['posIdName'] = val
      }
      entity.location[headerName] = posIdVal
      return dummyKey
    },
    setParamSensor(entity, headerName, val, dummyKey){
      const sensorNameList = val.split(';').map((val) => val.trim())
      const exbSensorList = []
      sensorNameList.forEach((sensorName) => {
        const sensor = this.sensorOptionsExb.find((option) => option.text == sensorName)
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
    setParamOther(entity, headerName, val, dummyKey, mainCol, numCol){
      let newVal = val
      if (headerName == mainCol && !val) {
        newVal = dummyKey--
      }
      if(headerName == 'enabled'){
        const enabledVal = Util.str2booleanComplate(newVal)
        if(typeof enabledVal != 'boolean'){
          entity['enabledName'] = newVal
        }
        newVal = Util.str2boolean(newVal)
      }
      const isNumCol = numCol.includes(headerName)
      if(isNumCol && (!Util.hasValue(val) || isNaN(val))){
        entity[`${headerName}Name`] = val
      }
      if(headerName == 'deviceIdX' && (!Util.hasValue(val) || isNaN(`0x${val}`))){
        entity[`${headerName}Name`] = val
      }
      entity[headerName] = isNumCol? Number(newVal): newVal
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = Util.includesIgnoreCase(APP.EXB.WITH, 'exbId')? 'exbId': Util.includesIgnoreCase(APP.EXB.WITH, 'deviceId')? 'deviceId': Util.includesIgnoreCase(APP.EXB.WITH, 'deviceNum')? 'deviceNum': 'deviceIdX'
      const LOCATION = ['locationId','areaName','locationName','visible','txViewType','posId','x','y', 'zoneName']
      const ZONE = ['zoneName']
      const NUMBER_TYPE_LIST = ['deviceId', 'deviceNum', 'exbId', 'areaId', 'posId', 'locationId', 'x', 'y', 'z', 'txViewType']
      const BOOL_TYPE_LIST = ['visible']

      await bulkSaveFunc(MAIN_COL, null, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
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
          else if(['x', 'y'].includes(headerName)){
            if(Util.hasValue(val)){
              if(isNaN(val)){
                entity.location[`loc${headerName.toUpperCase()}Name`] = val
              }
              entity.location[headerName] = Number(val)
            }
          }
          else{
            entity.location[headerName] = val
          }
        }
        else if (headerName == 'sensor') {
          dummyKey = this.setParamSensor(entity, headerName, val, dummyKey)
        }
        else {
          dummyKey = this.setParamOther(entity, headerName, val, dummyKey, MAIN_COL, NUMBER_TYPE_LIST)
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