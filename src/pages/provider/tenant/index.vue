<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="tenants" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
        name: 'tenant',
        id: 'tenantId',
        indexPath: 'tenant',
        editPath: 'tenant/edit',
        appServicePath: '/meta/tenant',
        delFilter: true,
        tenantAction: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'tenantId', sortable: true },
          {key: 'tenantCd', sortable: true },
          {key: 'tenantName', sortable: true },
          {key: 'createDt', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.tenants.length
      },
      items: ViewHelper.createBreadCrumbItems('provider', 'tenant'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'tenants',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('tenant')
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
