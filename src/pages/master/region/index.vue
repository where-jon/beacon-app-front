<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="regions" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as LocalStorageHelper from '../../../sub/helper/LocalStorageHelper'
import * as RegionHelper from '../../../sub/helper/RegionHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
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
        custumCsvColumns: ['regionName', 'meshId', 'description'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'regionName', sortable: true },
          {key: 'meshId', sortable: true},
          {key: 'description', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'regionName',
        initTotalRows: this.$store.state.app_service.regions.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'region'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'regions',
    ]),
  },
  methods: {
    async onSaved(param){
      StateHelper.setForceFetch('user', true)
      const result = await RegionHelper.autoSwitchRegion(this.regions)
      if(result){
        LocalStorageHelper.setLocalStorage('listMessage', param.message)
        location.reload()
      }
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('region')
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
  }
}
</script>

<style scoped lang="scss">

</style>
