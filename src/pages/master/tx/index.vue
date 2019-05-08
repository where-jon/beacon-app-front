<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txs" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
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
        confirmName: APP.TX_BTX_MINOR == 'minor'? 'minor': 'btxId',
        indexPath: '/master/tx',
        editPath: '/master/tx/edit',
        bulkEditPath: '/master/tx/bulkedit',
        appServicePath: '/core/tx',
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: ViewHelper.addLabelByKey(this.$i18n, [
          APP.TX_BTX_MINOR == 'minor'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_BTX_MINOR != 'minor'? {key: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_DISPLAY_NAME? {key: 'displayName', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_MAJOR? {key: 'major', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_BTX_MINOR == 'both'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_CATEGORY? {key: 'categoryName', label: 'category', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_GROUP? {key: 'groupName', label: 'group', sortable: true, tdClass: 'action-rowdata' }: null,
          APP.TX_WITH_DESCRIPTION? {key: 'description', sortable: true, thStyle: {width: '200px !important'}, tdClass: 'action-rowdata' }: null,
          {key: 'sensor', label:'type', sortable: true,},
          APP.TX_WITH_DISPFLG? {key: 'disp', label:'disp', sortable: false,}: null,
          {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
        ]),
        sortBy: APP.TX_BTX_MINOR != 'minor'? 'btxId': 'minor',
        initTotalRows: this.$store.state.app_service.txs.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'tx'),
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
    getCustumCsvColumns(){
      return [
        APP.TX_BTX_MINOR == 'minor'? 'minor': null,
        APP.TX_BTX_MINOR != 'minor'? 'btxId': null,
        APP.TX_WITH_DISPLAY_NAME? 'displayName': null,
        APP.TX_WITH_MAJOR? 'major': null,
        APP.TX_BTX_MINOR == 'both'? 'minor': null,
        APP.TX_WITH_CATEGORY? 'categoryName': null,
        APP.TX_WITH_GROUP? 'groupName': null,
        APP.TX_WITH_DESCRIPTION? 'description': null,
        'sensor',
        'disp',
        APP.TX_WITH_LOCATION? 'areaName': null,
        APP.TX_WITH_LOCATION? 'x': null,
        APP.TX_WITH_LOCATION? 'y': null,
      ].filter((val, idx, ary) => val && ary.indexOf(val) == idx)
    },
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