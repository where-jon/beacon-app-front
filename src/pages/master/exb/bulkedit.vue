<template>
  <div>
    <breadcrumb :items="items" />
    <bulkedit :name="name" :id="id" :backPath="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as Util from '../../../sub/util/Util'
import { txViewTypes } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/breadcrumb.vue'
import bulkedit from '../../../components/bulkedit.vue'
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
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.exb'),
          href: '/master/exb',
        },
        {
          text: this.$i18n.t('label.exb') + this.$i18n.t('label.bulkRegister'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'exb', 'exbs',
    ]),
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
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const MAIN_COL = "exbId"
      const LOCATION = ["locationId","areaName","locationName","visible","txViewType","posId","x","y"]
      const NUMBER_TYPE_LIST = ["deviceId", "exbId", "areaId", "locationId", "posId", "x", "y", "z", "txViewType", "zoneName"]
      const BOOL_TYPE_LIST = ["visible", "enabled"]

      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, BOOL_TYPE_LIST, (entity, headerName, val, dummyKey) => {
        if (Util.equalsAny(headerName, LOCATION)) {
          if (headerName == "locationId" && !val) {
            val = dummyKey--          
          }
          if (!entity.location) {
            entity.location = {locationId: dummyKey--}
          }
          entity.location[headerName] = val
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