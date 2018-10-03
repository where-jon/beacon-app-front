<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txs" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue';
import breadcrumb from '../../../components/breadcrumb.vue'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'tx',
        id: 'txId',
        editPath: '/master/tx/edit',
        appServicePath: '/core/tx',
        fields: addLabelByKey(this.$i18n, [ 
          {key: "txId", sortable: true, tdClass: "action-rowdata" },
          {key: "btxId", sortable: true, tdClass: "action-rowdata" },
          {key: "txName", sortable: true, tdClass: "action-rowdata" },
          {key: "displayName", sortable: true, tdClass: "action-rowdata" },
          {key: "minor", sortable: true, tdClass: "action-rowdata" },
          {key: "actions", thStyle: {width: '130px !important'}, tdClass: "action-rowdata" }
        ]),
        initTotalRows: this.$store.state.app_service.txs.length
      },
      items: [
        {
          text: this.$i18n.t('label.master'),
          active: true
        },
        {
          text: this.$i18n.t('label.tx'),
          active: true
        }
      ]
    }
  },
  computed: {
    ...mapState('app_service', [
      'txs',
      'txImages',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        let txs = await AppServiceHelper.fetchList('/core/tx', 'txId')
        if (payload && payload.done) {
          payload.done()
        }
        this.replaceAS({txs})
      }
      catch(e) {
        console.error(e)
      }
      this.replace({showProgress: false})
    }
  }
}
</script>

<style scoped lang="scss">

</style>