<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="templates" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
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
        name: 'template',
        id: 'notifyTemplateId',
        indexPath: '/master/mailTemplate',
        editPath: '/master/mailTemplate/edit',
        appServicePath: '/core/rcvexcloud',
        // custumCsvColumns: ['notifyTemplateId', 'zoneName', 'areaName', 'categoryName'],
        fields: addLabelByKey(this.$i18n, [
          {key: 'notifyTemplateKey', sortable: true },
          {key: 'notifyMedium', sortable: true },
          {key: 'notifyTo', sortable: true },
          {key: 'subject', sortable: true},
          {key: 'mailFrom', sortable: true},
          {key: 'notifyTemplateId', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'notifyTemplateId',
        initTotalRows: this.$store.state.app_service.templates.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.notifyTemplate'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'templates',
      'forceFetchZone',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('template', this.forceFetchTemplate)
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
