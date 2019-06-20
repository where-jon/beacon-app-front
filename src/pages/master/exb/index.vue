<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="exbs" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as MenuHelper from '../../../sub/helper/MenuHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import { APP } from '../../../sub/constant/config'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
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
        name: 'exb',
        id: 'exbId',
        confirmName: ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceId')? 'deviceId': ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX')? 'deviceIdX': 'locationName',
        indexPath: '/master/exb',
        editPath: '/master/exb/edit',
        bulkEditPath: '/master/exb/bulkedit',
        appServicePath: '/core/exb',
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: this.getFields(),
        sortBy: ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceId')? 'deviceId': ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX')? 'deviceIdX': 'locationName',
        initTotalRows: this.$store.state.app_service.exbs.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'exb'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'exbs',
      'exbImages',
    ]),
  },
  mounted() {
  },
  methods: {
    createCustomColumn(){
      return APP.EXB.WITH.map(val => {
        const ret = {key: val, label: val, sortable: true}
        if(['zone'].includes(val)){
          if(!MenuHelper.isMenuEntry('/master/zoneClass')){
            return null
          }
          ret.key = ret.label = 'zoneName'
        }
        return ret
      }).filter(val => val)
    },
    getCustumCsvColumns(){
      return this.createCustomColumn().map(val => val.key)
        .concat(['locationName','areaName', 'x', 'y', 'enabled', 'sensor']).filter(val => val)
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, this.createCustomColumn()
        .concat([
          {key: 'locationName', label:'locationName', sortable: true,},
          {key: 'areaName', label:'area', sortable: true,},
          {key: 'x', label:'locationX', sortable: true,},
          {key: 'y', label:'locationY', sortable: true,},
          // {key: 'sensorIdName', label:'type', sortable: true,},　一旦単数で
          {key: 'sensor', label:'type', sortable: true,},
          {key: 'actions', thStyle: {width: '130px !important'} }
        ])
      )
    },
    customCsvData(val){
      // val.sensor = val.sensorIdNames.join(';')  単数に戻す
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('exb')
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