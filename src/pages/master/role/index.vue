<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    breadcrumb,
    mList, 
  },
  mixins: [commonmixin],
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
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'roleName', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'roleName',
      },
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', 'role'),
    }
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">

</style>
