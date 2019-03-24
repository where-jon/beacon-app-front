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
        indexPath: '/master/exb',
        editPath: '/master/exb/edit',
        bulkEditPath: '/master/exb/bulkedit',
        appServicePath: '/core/exb',
        mainColumn: APP.EXB_WITH_EXBID? {name: this.$i18n.tnl('label.exbId'), id: 'exbId'}:
          APP.EXB_WITH_DEVICE_NUM? {name: this.$i18n.tnl('label.deviceNum'), id: 'deviceNum'}:
            APP.EXB_WITH_DEVICE_ID? {name: this.$i18n.tnl('label.deviceId'), id: 'deviceId'}:
              APP.EXB_WITH_DEVICE_IDX? {name: this.$i18n.tnl('label.deviceIdX'), id: 'deviceIdX'}:
                null,
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: this.getFields(),
        sortBy: APP.EXB_WITH_EXBID? 'exbId': APP.EXB_WITH_DEVICE_NUM? 'deviceNum': APP.EXB_WITH_DEVICE_ID? 'deviceId': APP.EXB_WITH_DEVICE_IDX? 'deviceIdX': '',
        initTotalRows: this.$store.state.app_service.exbs.length
      },
      items: ViewHelper.createBreadCrumbItems('master', 'exb'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'exbs',
      'exbImages',
      'forceFetchExb',
    ]),
  },
  mounted() {
  },
  methods: {
    getCustumCsvColumns(){
      return [
        APP.EXB_WITH_EXBID? 'exbId': null,
        APP.EXB_WITH_DEVICE_NUM? 'deviceNum': null,
        APP.EXB_WITH_DEVICE_ID? 'deviceId': null,
        APP.EXB_WITH_DEVICE_IDX? 'deviceIdX': null,
        'locationName',
        'posId',
        'areaName',
        'x',
        'y',
        'enabled',
        'sensor',
        APP.EXB_WITH_ZONE && MenuHelper.isMenuEntry('/master/zoneClass') ? 'zoneName': null
      ].filter((val) => val)
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        APP.EXB_WITH_EXBID? {key: 'exbId', sortable: true }: null,
        APP.EXB_WITH_DEVICE_NUM? {key: 'deviceNum', sortable: true }: null,
        APP.EXB_WITH_DEVICE_ID? {key: 'deviceId', sortable: true }: null,
        APP.EXB_WITH_DEVICE_IDX? {key: 'deviceIdX', sortable: true }: null,
        {key: 'locationName', label:'locationName', sortable: true,},
        APP.EXB_WITH_POSID? {key: 'posId', label:'posId', sortable: true,}: null,
        {key: 'areaName', label:'area', sortable: true,},
        {key: 'x', label:'locationX', sortable: true,},
        {key: 'y', label:'locationY', sortable: true,},
        // {key: 'sensorIdName', label:'type', sortable: true,},　一旦単数で
        {key: 'sensor', label:'type', sortable: true,},
        APP.EXB_WITH_ZONE && MenuHelper.isMenuEntry('/master/zoneClass') ?
          {key: 'zoneName', label: 'zoneName', sortable: true,} : null,
        {key: 'actions', thStyle: {width: '130px !important'} }
      ])
    },
    customCsvData(val){
      // val.sensor = val.sensorIdNames.join(';')  単数に戻す
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('exb', this.forceFetchExb)
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