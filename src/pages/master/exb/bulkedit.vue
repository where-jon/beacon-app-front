<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit ref="bulkEdit" :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import { txViewTypes } from '../../../sub/constant/Constants'
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
          text: this.$i18n.tnl('label.exb') + this.$i18n.tnl('label.bulkRegister'),
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
      return this.$refs.bulkEdit.sensorOptions('exb')
    },
  },
  methods: {
    resetId(entity, dummyKey){
      const targetEntity = Util.getEntityFromIds(this.exbs, entity, ["exbId", "deviceNum", "deviceId", "deviceIdX"])
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
        if(entity.enabled == null){
          entity.enabled = targetEntity.enabled
        }
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
    async save(bulkSaveFunc) {
      const MAIN_COL = "exbId"
      const LOCATION = ["locationId","areaName","locationName","visible","txViewType","posId","x","y", "zoneName"]
      const ZONE = ["zoneName"]
      const SENSOR = ["sensor"]
      const NUMBER_TYPE_LIST = ["deviceId", "exbId", "areaId", "locationId", "posId", "x", "y", "z", "txViewType"]
      const BOOL_TYPE_LIST = ["visible", "enabled"]

      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, LOCATION)) {
          if (headerName == "locationId" && !val) {
            val = dummyKey--          
          }
          if (!entity.location) {
            entity.location = {locationId: dummyKey--}
          }
          if (Util.equalsAny(headerName, ZONE)) {
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
          }
          else{
            entity.location[headerName] = val
          }
        }
        else if (Util.equalsAny(headerName, SENSOR)) {
          const sensor = this.sensorOptionsExb.find((option) => option.text == val)
          if(sensor){
            if (!entity.exbSensorList) {
              entity.exbSensorList = []
            }
            entity.exbSensorList.push({exbSensorPK: {sensorId: sensor.value}})
          }
        }
        else {
          if (headerName == MAIN_COL && !val) {
            val = dummyKey--
          }
          entity[headerName] = val
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