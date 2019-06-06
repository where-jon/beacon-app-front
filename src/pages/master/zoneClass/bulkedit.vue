<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ZONE, BULK } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'

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
    ]),
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
    },
    async save(bulkSaveFunc) {
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          entity.zoneType = ZONE.NON_COORDINATE
          return dummyKey
        }
        if(headerName == 'areaName') {
          entity.area = {areaId: dummyKey--, areaName: val}
          entity.areaName = val
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