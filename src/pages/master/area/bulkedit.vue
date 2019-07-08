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
import * as BulkHelper from '../../../sub/helper/dataprocess/BulkHelper'
import * as StateHelper from '../../../sub/helper/dataprocess/StateHelper'
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
      masterCd: null,
    }
  },
  computed: {
    ...mapState('app_service', [
      'area', 'areas'
    ]),
  },
  async created() {
    await StateHelper.load('area')
    this.masterCd = StateHelper.createMasterCd('area', this.areas, null)
  },
  methods: {
    onRestruct(entity, dummyKey){
      if(Util.hasValue(entity.areaCd)){
        BulkHelper.setStringKey(entity, 'areaCd', entity.areaCd, PATTERN.REGEXP.MASTER_CD)
      }
      else{
        entity.areaCd = this.masterCd
        this.masterCd = StateHelper.createMasterCd('area', [{areaCd: this.masterCd}], null)
      }
      return dummyKey
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
      StateHelper.setForceFetch('zone', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>