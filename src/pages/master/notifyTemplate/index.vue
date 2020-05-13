<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <m-list :params="params" :list="templates" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import mList from '../../../components/page/list.vue'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'

export default {
  components: {
    breadcrumb,
    mList, 
  },
  mixins: [commonmixin, reloadmixin],
  data() {
    return {
      params: {
        name: 'template',
        id: 'notifyTemplateId',
        confirmName: 'notifyTemplateKey',
        indexPath: '/master/notifyTemplate',
        editPath: '/master/notifyTemplate/edit',
        appServicePath: '/core/rcvexcloud',
        // custumCsvColumns: ['notifyTemplateId', 'zoneName', 'areaName', 'categoryName'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [
          {key: 'notifyTemplateKey', sortable: true },
          {key: 'notifyMedium', sortable: true },
          {key: 'notifyTo', sortable: true },
          {key: 'subject', sortable: true},
          {key: 'mailFrom', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'notifyTemplateId',
        initTotalRows: StateHelper.getMaster().templates.length
      },
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', 'notifyTemplate'),
    }
  },
  methods: {
    async fetchData(payload) {
      this.hideProgress()
    },
  }
}
</script>

<style scoped lang="scss">

</style>
