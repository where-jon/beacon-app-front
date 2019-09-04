<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { EXB } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
      'exb', 'exbs'
    ]),
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave({
        numberList: ['deviceId', 'threshold1', 'threshold2', 'adjust1', 'adjust2'],
        hexList: ['deviceIdX'],
        nullableList: ['threshold1', 'threshold2', 'adjust1', 'adjust2']
      })
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

      if(Util.hasValue(entity.exbType)) {
        const target = EXB.getTypes().find(val => val.text == entity.exbType)
        if(target){
          entity.exbType = target.value
        }
        else{
          entity.exbTypeName = entity.exbType
          entity.exbType = null
        }
      }
      if(Util.hasValue(entity.sensor)) {
        const param = BulkHelper.createParamSensor('exb', entity.sensor, dummyKey)
        if(param.sensorList.length != 0){
          entity.exbSensorList = param.sensorList
        }
        dummyKey = param.dummyKey
      }
      return dummyKey
    },
  }
}
</script>

<style scoped lang="scss">

</style>