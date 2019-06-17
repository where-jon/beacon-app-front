<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import { BULK } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as RegionHelper from '../../../sub/helper/RegionHelper'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'region',
      id: 'regionId',
      backPath: '/master/region',
      appServicePath: '/core/region',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'region', href: '/master/region'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'region',
      'regions',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      const NUMBER_TYPE_LIST = ['regionId', 'meshId']
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        if(Util.equalsAny(headerName, NUMBER_TYPE_LIST)){
          BulkHelper.setNumberKey(entity, headerName, val)
          return dummyKey
        }
        entity[headerName] = val
        return dummyKey
      })
    },
    async afterCrud(bulkSaveFunc, param){
      StateHelper.setForceFetch('user', true)
      const result = await RegionHelper.autoSwitchRegion(this.regions)
      if(result){
        window.localStorage.setItem('bulkMessage', param.message)
        location.reload()
      }
      else{
        await AuthHelper.switchAppService()
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>