<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

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
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave({numberList: ['deviceId', 'posId', 'x', 'y'], hexList: ['deviceIdX'], booleanList: ['enabled']})
    },
    onRestruct(entity, dummyKey){
      if(Util.hasValue(entity.deviceId) || Util.hasValue(entity.deviceIdX)){
        if(ConfigHelper.includesDeviceType('deviceIdX') && !ConfigHelper.includesDeviceType('deviceId') && !entity.deviceIdXName){
          entity.deviceId = parseInt(entity.deviceIdX, 16)
        }
        if(!ConfigHelper.includesDeviceType('deviceId')){
          BulkHelper.removeInvalid(entity, 'deviceId')
        }
        if(!ConfigHelper.includesDeviceType('deviceIdX')){
          BulkHelper.removeInvalid(entity, 'deviceIdX')
        }
      }

      if(Util.hasValue(entity.sensor)) {
        const param = BulkHelper.createParamSensor('exb', entity.sensor, dummyKey)
        if(param.sensorList.length != 0){
          entity.exbSensorList = param.sensorList
        }
        dummyKey = param.dummyKey
      }
      if (Util.hasValueAny(entity.areaName, entity.locationName, entity.visible, entity.txViewType, entity.posId, entity.x, entity.y, entity.zoneName)) {
        const param = BulkHelper.createParamLocation(entity, dummyKey)
        entity.location = param.location
        dummyKey = param.dummyKey
      }
      return dummyKey
    },
  }
}
</script>

<style scoped lang="scss">

</style>