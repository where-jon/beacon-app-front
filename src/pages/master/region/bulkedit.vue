<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as RegionHelper from '../../../sub/helper/RegionHelper'
import * as LocalStorageHelper from '../../../sub/helper/LocalStorageHelper'

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