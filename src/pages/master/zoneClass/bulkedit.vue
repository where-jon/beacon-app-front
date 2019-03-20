<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
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
      items: ViewHelper.createBreadCrumbItems('master', {text: 'zoneClass', href: '/master/zoneClass'}, 'bulkRegister'),
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
      const MAIN_COL = 'zoneId'
      const LOCATION_ZONE_COL = ['zoneId', 'locationId']
      const ZONE_CATEGORY_COL = ['zoneId', 'categoryId', 'categoryName']
      const NUMBER_TYPE_LIST = ['locationId', 'categoryId', 'areaId']
      let locationId = null
      let categoryId = null
      await StateHelper.load('category')
      await bulkSaveFunc(MAIN_COL, NUMBER_TYPE_LIST, null, (entity, headerName, val, dummyKey) => {
        if(headerName === 'zoneId'){
          entity.zoneId = Util.hasValue(val)? Number(val): --dummyKey  
          entity.zoneType = ZONE.NON_COORDINATE
        }
        else if(headerName === 'locationId'){
          locationId = val
        }
        else if(headerName === 'categoryId'){
          categoryId = val
        }
        if(headerName == 'areaName') {
          entity.area = {areaId: dummyKey--, areaName: val}
        }
        if(headerName == 'categoryName') {
          entity.categoryName = StateHelper.isSystemUseCategoryName(val)? val: StateHelper.getConvertCategoryName(val)
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
        if(!entity[headerName]){
          entity[headerName] = val
        }
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>