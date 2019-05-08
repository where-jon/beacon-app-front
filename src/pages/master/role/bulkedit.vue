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

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'role',
      id: 'roleId',
      backPath: '/master/role',
      appServicePath: '/meta/role',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'role', href: '/master/role'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'role',
    ]),
  },
  methods: {
    async save(bulkSaveFunc) {
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
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