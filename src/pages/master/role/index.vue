<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="roles" />
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
        name: 'role',
        id: 'roleId',
        indexPath: '/master/role',
        editPath: '/master/role/edit',
        bulkEditPath: '/master/role/bulkedit',
        appServicePath: '/meta/role',
        csvOut: true,
        custumCsvColumns: ['roleName'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'roleName', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'roleName',
        initTotalRows: this.$store.state.app_service.roles.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'role'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'roles',
    ]),
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('user', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('role')
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
