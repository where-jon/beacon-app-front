<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="exbs" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { EXB } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
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
        name: 'exb',
        id: 'exbId',
        confirmName: ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName',
        indexPath: '/master/exb',
        editPath: '/master/exb/edit',
        bulkEditPath: '/master/exb/bulkedit',
        appServicePath: '/core/exb',
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: this.getFields(),
        sortBy: ConfigHelper.includesDeviceType('deviceId')? 'deviceId': ConfigHelper.includesDeviceType('deviceIdX')? 'deviceIdX': 'locationName',
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
  methods: {
    createIdColumn(){
      return ['deviceId', 'deviceIdX'].filter(val => ConfigHelper.includesDeviceType(val))
        .map(val => ({key: val, label: val, sortable: true}))
    },
    getCustumCsvColumns(){
      return this.createIdColumn().map(val => val.key)
        .concat(['exbType', 'threshold1', 'threshold2', 'adjust1', 'adjust2', 'sensor', 'locationCd', 'locationName']).filter(val => val)
    },
    customCsvData(val){
      val.sensor = val.sensorIdNames.map(name => this.$i18n.tnl('label.' + name)).join(';')
      val.exbType = Util.getValue(EXB.getTypes().find(type => type.value == val.exbType), 'text', null)
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, this.createIdColumn()
        .concat([
          {key: 'exbTypeName', label:'exbType', sortable: true,},
          {key: 'sensorIdName', label:'type', sortable: true,},
          {key: 'locationName', label:'locationName', sortable: true,},
          {key: 'areaName', label:'area', sortable: true,},
          {key: 'actions', thStyle: {width: '130px !important'} }
        ])
      )
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