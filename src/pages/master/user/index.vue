<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { APP } from '../../../sub/constant/config'
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
        name: 'user',
        id: 'userId',
        confirmName: 'loginId',
        indexPath: '/master/user',
        editPath: '/master/user/edit',
        bulkEditPath: '/master/user/bulkedit',
        appServicePath: '/meta/user',
        csvOut: true,
        fields: this.getFields(),
        sortBy: 'loginId',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'user'),
    }
  },
  methods: {
    createCustomColumn(){
      return APP.USER.WITH.map(val => ({key: val == 'region'? 'regionNames': val, label: val, sortable: true}))
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'loginId', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'roleName', label: 'role', sortable: true },
          {key: 'description', sortable: true },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]))
    },
  }
}
</script>

<style scoped lang="scss">

</style>
