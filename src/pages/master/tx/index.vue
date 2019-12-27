<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" compact-mode />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { BULK } from '../../../sub/constant/Constants'
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
        name: 'tx',
        id: 'txId',
        confirmName: APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId',
        indexPath: '/master/tx',
        editPath: '/master/tx/edit',
        bulkEditPath: '/master/tx/bulkedit',
        appServicePath: '/core/tx',
        csvOut: true,
        fields: this.getFields(),
        sortBy: APP.TX.BTX_MINOR != 'minor'? 'btxId': 'minor',
      },
      items: ViewHelper.createBreadCrumbItems('master', 'masterTx'),
    }
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
    createListParams(){
      const retMap = { sensor: {} }
      this.sensorOptionsTx.forEach(option => retMap.sensor[option.value? option.value.toString(): '0'] = option.text)
      return retMap
    },
    editResponse(data) {
      data.forEach(val => {
        val.sensorNames = Util.getValue(val, 'sensorNames', '').split(BULK.SPLITTER)
      })
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [
        APP.TX.BTX_MINOR == 'minor'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
        APP.TX.BTX_MINOR != 'minor'? {key: 'btxId', sortable: true, tdClass: 'action-rowdata' }: null,
        APP.TX.BTX_MINOR == 'both'? {key: 'minor', sortable: true, tdClass: 'action-rowdata' }: null,
        {key: 'sensorNames', label:'type', sortable: true, tdClass: 'action-rowdata'},
      ].concat(this.createCustomColumn())
        .concat([
          {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
        ])
        .filter(val => val)
      )
    },
    onSaved(){
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
  }
}
</script>

<style scoped lang="scss">

</style>