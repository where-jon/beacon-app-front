<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="tenants" />
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
        name: 'tenant',
        id: 'tenantId',
        editPath: 'tenant/edit',
        appServicePath: '/meta/tenant',
        delFilter: true,
        tenantAction: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: 'tenantId', sortable: true },
          {key: 'tenantCd', sortable: true },
          {key: 'tenantName', sortable: true },
          {key: 'createDt', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.tenants.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.tenant'),
          active: true
        }
      ]
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
        this.replace({showProgress: true})
        await StateHelper.load('tenant')
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
