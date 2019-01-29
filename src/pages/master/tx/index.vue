<template>
  <div>
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txs" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { APP } from '../../../sub/constant/config.js'

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
        indexPath: '/master/tx',
        editPath: '/master/tx/edit',
        bulkEditPath: '/master/tx/bulkedit',
        appServicePath: '/core/tx',
        mainColumn: !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor'? {name: this.$i18n.tnl('label.minor'), id: 'minor'}:
          !APP.TX_WITH_TXID && APP.TX_BTX_MINOR != 'minor'? {name: this.$i18n.tnl('label.btxId'), id: 'btxId'}:
            {name: this.$i18n.tnl('label.txId'), id: 'txId'},
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          !APP.TX_WITH_TXID && APP.TX_BTX_MINOR == 'minor'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_TXID? {key: 'txId', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_BTX_MINOR != 'minor'? {key: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
          {key: 'txName', sortable: true, tdClass: 'action-rowdata' },
          APP.TX_WITH_DISPLAY_NAME? {key: 'displayName', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_MAJOR? {key: 'major', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_TXID || APP.TX_BTX_MINOR != 'btxId'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_CATEGORY? {key: 'categoryName', label: 'category', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_GROUP? {key: 'groupName', label: 'group', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_DESCRIPTION? {key: 'description', sortable: true, tdClass: 'action-rowdata' }: null,
          {key: 'sensor', label:'type', sortable: true,},
          {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
        ]),
        sortBy: APP.TX_WITH_TXID? 'txId': APP.TX_BTX_MINOR != 'minor'? 'btxId': 'minor',
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
      'forceFetchTx',
    ]),
  },
  mounted() {
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('pot', true)
    },
    convBeforeEdit(tx) {
      if (tx.disp != null) {
        tx.dispPos = tx.disp & 1
        tx.dispPir = tx.disp & 2
        tx.dispAlways = tx.disp & 4
      }
      else {
        tx.dispPos = 1
        tx.dispPir = 0
        tx.dispAlways = 0
      }
      
      return tx
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('tx', this.forceFetchTx)
        StateHelper.setForceFetch('tx', false)
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    }
  }
}
</script>

<style scoped lang="scss">

</style>