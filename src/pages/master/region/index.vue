<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import * as RegionHelper from '../../../sub/helper/domain/RegionHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList, 
  },
  mixins: [reloadmixin],
  data() {
    return {
      params: {
        name: 'region',
        id: 'regionId',
        indexPath: '/master/region',
        editPath: '/master/region/edit',
        bulkEditPath: '/master/region/bulkedit',
        appServicePath: '/core/region',
        csvOut: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'ID', label: 'id', sortable: true },
          {key: 'regionName', sortable: true },
          {key: 'meshId', sortable: true},
          {key: 'description', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'ID',
      },
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', 'region'),
    }
  },
  methods: {
    async onSaved(param){
      const result = await RegionHelper.autoSwitchRegion(this.regions)
      if(result){
        LocalStorageHelper.setLocalStorage('listMessage', param.message)
        location.reload()
      }
    },
  }
}
</script>

<style scoped lang="scss">

</style>
