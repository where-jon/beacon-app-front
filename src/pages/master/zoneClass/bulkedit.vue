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
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { ZONE } from '../../../sub/constant/Constants'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
      backPath: '/master/zoneClass',
      appServicePath: '/core/zone',
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.zoneClass'),
          href: '/master/zoneClass',
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
      'zone',
      'categories',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const MAIN_COL = "zoneId"
      const LOCATION_ZONE_COL = ["zoneId", "locationId"]
      const ZONE_CATEGORY_COL = ["zoneId", "categoryId", "categoryName"]
      const ZONE_COL = ["zoneName", "areaId"]
      const NUMBER_TYPE_LIST = ["locationId", "categoryId", "areaId"]
      let locationId = null
      let categoryId = null
      await StateHelper.load('category')
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if(headerName === "zoneId"){
          entity.zoneId = Util.hasValue(val)? Number(val): --dummyKey  
          entity.zoneType = ZONE.getTypes()[1].value
        }
        else if(headerName === "locationId"){
          locationId = val
        }
        else if(headerName === "categoryId"){
          categoryId = val
        }
        else if(headerName === "categoryName"){
          entity[headerName] = val
        }
        if(headerName == "areaName") {
          entity[headerName] = val
          entity.area = {areaId: dummyKey--, areaName: val}
        }
        if(ZONE_COL.includes(headerName)) {
          entity[headerName] = val
        }
        if(LOCATION_ZONE_COL.includes(headerName) && entity.zoneId != null && locationId != null){
          entity.locationZoneList = [{
            locationZonePK: {
              zoneId: entity.zoneId < 0? --dummyKey: entity.zoneId,
              locationId: locationId
            }
          }]
        }
        if(ZONE_CATEGORY_COL.includes(headerName) && entity.zoneId != null && categoryId != null){
          entity.zoneCategoryList = [{
            zoneCategoryPK: {
              zoneId: entity.zoneId < 0? --dummyKey: entity.zoneId,
              categoryId: categoryId
            }
          }]
        }
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>