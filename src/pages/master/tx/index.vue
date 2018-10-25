<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txs" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import breadcrumb from '../../../components/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'
import { APP } from '../../../sub/constant/config.js'

let that

export default {
  mixins: [listmixinVue],
  components: {
    mList, 
    breadcrumb,
  },
  data() {
    return {
      params: {
        name: 'tx',
        id: 'txId',
        editPath: '/master/tx/edit',
        bulkEditPath: '/master/tx/bulkedit',
        appServicePath: '/core/tx',
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor'? {key: "minor", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_TXID? {key: "txId", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_BTX_MINOR != 'minor'? {key: "btxId", sortable: true, tdClass: "action-rowdata" }: null,
          {key: "txName", sortable: true, tdClass: "action-rowdata" },
          APP.TX_WITH_DISPLAY_NAME? {key: "displayName", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_MAJOR? {key: "major", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_TXID || APP.TX_BTX_MINOR != 'btxId'? {key: "minor", sortable: true, tdClass: "action-rowdata" }: null,
          APP.TX_WITH_CATEGORY? {key: "category.categoryName", label: 'category', sortable: true, tdClass: "action-rowdata" }: null,,
          APP.TX_WITH_DESCRIPTION? {key: "description", sortable: true, tdClass: "action-rowdata" }: null,
          {key: "sensor", label:'type', sortable: true,},
          {key: "actions", thStyle: {width: '130px !important'}, tdClass: "action-rowdata" }
        ]),
        initTotalRows: this.$store.state.app_service.txs.length
      },
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.tx'),
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
  mounted() {
    that = this
  },
  methods: {
    async fetchData(payload) {
      try {
        this.replace({showProgress: true})
        await StateHelper.load('tx')
        if (payload && payload.done) {
          payload.done()
        }
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