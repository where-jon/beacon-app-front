<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="txs" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
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
        confirmName: APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId',
        indexPath: '/master/tx',
        editPath: '/master/tx/edit',
        bulkEditPath: '/master/tx/bulkedit',
        appServicePath: '/core/tx',
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: this.getFields(),
        sortBy: APP.TX.BTX_MINOR != 'minor'? 'btxId': 'minor',
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
    createCustomColumn(){
      return APP.TX.WITH.map(val => {
        if(['location', 'dispPir', 'dispAlways'].includes(val)){
          return null
        }
        const ret = {key: val, label: val, sortable: true, tdClass: 'action-rowdata'}
        if(['category', 'group'].includes(val)){
          ret.key = val + 'Name'
        }
        if(['description'].includes(val)){
          ret.thStyle = {width: '200px !important'}
        }
        if(['dispFlg'].includes(val)){
          ret.key = ret.label = 'disp'
          ret.sortable = false
        }
        return ret
      }).filter(val => val)
    },
    getCustumCsvColumns(){
      return [
        APP.TX.BTX_MINOR == 'minor'? 'minor': null,
        APP.TX.BTX_MINOR != 'minor'? 'btxId': null,
        APP.TX.BTX_MINOR == 'both'? 'minor': null,
        'sensor',
      ].concat(this.createCustomColumn().map(val => val.key)).concat([
        Util.includesIgnoreCase(APP.TX.WITH, 'location')? 'areaName': null,
        Util.includesIgnoreCase(APP.TX.WITH, 'location')? 'x': null,
        Util.includesIgnoreCase(APP.TX.WITH, 'location')? 'y': null,
      ]).filter((val, idx, ary) => val && ary.indexOf(val) == idx)
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [
        APP.TX.BTX_MINOR == 'minor'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
        APP.TX.BTX_MINOR != 'minor'? {key: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
        APP.TX.BTX_MINOR == 'both'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
        {key: 'sensor', label:'type', sortable: true,},
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
        ])
        .filter(val => val)
      )
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