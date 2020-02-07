<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { PATTERN } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
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
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'area', href: '/master/area'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'area', 'areas'
    ]),
  },
  async created() {
    // await StateHelper.load('area')
  },
  methods: {
    onRestruct(entity, dummyKey){
      if(Util.hasValue(entity.ID)){
        BulkHelper.setStringKey(entity, 'areaCd', entity.ID, PATTERN.REGEXP.MASTER_CD)
      }
      return dummyKey
    },
    async onSaved(){
      // StateHelper.setForceFetch('tx', true)
      // StateHelper.setForceFetch('exb', true)
      // StateHelper.setForceFetch('zone', true)
      await MasterHelper.loadMaster()
    },
  }
}
</script>

<style scoped lang="scss">

</style>