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
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import * as RegionHelper from '../../../sub/helper/domain/RegionHelper'
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
    onRestruct(entity, dummyKey){
      if(Util.hasValue(entity.ID)){
        BulkHelper.setStringKey(entity, 'regionCd', entity.ID, PATTERN.REGEXP.MASTER_CD)
      }
      return dummyKey
    },
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave({numberList: ['regionId', 'meshId']})
    },
    async onSaved(bulkSaveFunc, param){
      StateHelper.setForceFetch('user', true)
      const result = await RegionHelper.autoSwitchRegion(this.regions)
      if(result){
        LocalStorageHelper.setLocalStorage('bulkMessage', param.message)
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