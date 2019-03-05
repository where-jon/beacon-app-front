<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="regions" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
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
        custumCsvColumns: ['regionId', 'regionName', 'meshId', 'deviceOffset', 'description'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'regionName', sortable: true },
          {key: 'meshId', sortable: true},
          {key: 'deviceOffset', sortable: true},
          {key: 'description', sortable: true },
          {key: 'regionId', sortable: true },
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
