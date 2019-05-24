<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BULK } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import * as Util from '../../../sub/util/Util'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'user', href: '/master/user'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'user',
    ]),
  },
  methods: {
    addUserRegionList(entity, regionNames, dummyKey){
      if(!Util.hasValue(regionNames)){
        entity.userRegionList = []
        return dummyKey
      }
      entity.userRegionList = regionNames.split(BULK.SPLITTER).map(regionName => ({
        userRegionPK: {userId: dummyKey--, regionId: dummyKey--},
        regionName: regionName,
      }))
      return dummyKey
    },
    async save(bulkSaveFunc) {
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        if (headerName == 'roleName') {
          entity.role = {roleId: dummyKey--, roleName: val}
        }
        if (headerName == 'regionNames') {
          return this.addUserRegionList(entity, val, dummyKey)
        }
        entity[headerName] = val
        return dummyKey
      })
    },
  }
}
</script>

<style scoped lang="scss">

</style>