<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="templates" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
        initTotalRows: this.$store.state.app_service.templates.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'notifyTemplate'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'templates',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
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
