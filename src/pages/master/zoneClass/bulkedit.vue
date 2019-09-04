<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ZONE, PATTERN } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
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
    onRestruct(entity, dummyKey){
      entity.zoneType = ZONE.NON_COORDINATE
      if(Util.hasValue(entity.areaName)) {
        entity.area = {areaId: dummyKey--, areaName: entity.areaName}
      }
      if(Util.hasValue(entity.ID)){
        BulkHelper.setStringKey(entity, 'zoneCd', entity.ID, PATTERN.REGEXP.MASTER_CD)
      }
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>