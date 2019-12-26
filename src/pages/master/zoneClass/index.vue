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
        name: 'zone',
        id: 'zoneId',
        indexPath: '/master/zoneClass',
        editPath: '/master/zoneClass/edit',
        bulkEditPath: '/master/zoneClass/bulkedit',
        appServicePath: '/core/zone',
        csvOut: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'ID', label: 'id', sortable: true },
          {key: 'zoneName', sortable: true },
          {key: 'areaName', sortable: true},
          {key: 'categoryName', label: 'categoryName', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'ID',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'zoneClass'),
    }
  },
  methods: {
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
    },
  }
}
</script>

<style scoped lang="scss">

</style>
