<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as StyleHelper from '../../../sub/helper/ui/StyleHelper'
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
        name: 'group',
        id: 'groupId',
        indexPath: '/master/group',
        editPath: '/master/group/edit',
        bulkEditPath: '/master/group/bulkedit',
        appServicePath: '/basic/group',
        csvOut: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'ID', label: 'id', sortable: true },
          {key: 'groupName', sortable: true },
          {key: 'ruby', sortable: true },
          {key: 'style', label: 'display' } ,
          {key: 'description' },
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'ID',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'group'),
    }
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('pot', true)
      StateHelper.setForceFetch('tx', true)
    },
    style(row) {
      return StyleHelper.getStyleDisplay1(row)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
