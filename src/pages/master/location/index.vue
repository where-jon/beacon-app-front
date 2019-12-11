<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="locations" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { LOCATION, BULK } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as ConfigHelper from '../../../sub/helper/dataproc/ConfigHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as MenuHelper from '../../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
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
        name: 'location',
        id: 'locationId',
        indexPath: '/master/location',
        editPath: '/master/location/edit',
        bulkEditPath: '/master/location/bulkedit',
        appServicePath: '/core/location',
        csvOut: true,
        custumCsvColumns: this.getCustumCsvColumns(),
        fields: this.getFields(),
        sortBy: 'locationCd',
        initTotalRows: this.$store.state.app_service.locations.length,
      },
      items: ViewHelper.createBreadCrumbItems('master', 'locationList'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'locations', 'exbs'
    ]),
  },
  methods: {
    isShowLocationType(){
      return 0 < APP.LOCATION.TYPE.WITH.length
    },
    getFields(){
      return ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'locationCd', label: 'id', sortable: true },
        {key: 'locationName', sortable: true },
        this.isShowLocationType()? {key: 'locationTypeName', label: 'locationType', sortable: true }: null,
        {key: 'areaName', label:'area', sortable: true },
        {key: 'x', label:'locationX', sortable: true },
        {key: 'y', label:'locationY', sortable: true }
      ].concat(this.createCustomColumn())
        .concat([ {key: 'actions', thStyle: {width:'130px !important'} } ])
        .filter(val => val))
    },
    createCustomColumn(isDownload){
      const ret = []
      APP.LOCATION.WITH.forEach(val => {
        if(!ExtValueHelper.isShowList(APP.LOCATION, val)) {
          return
        }
        const column = {key: val, label: val, sortable: true}
        if('zoneClass' == val){
          if(MenuHelper.isMenuEntry('/master/zoneClass')){
            ret.push(Object.assign({}, column, {key: 'zoneClass', label: 'zoneClass'}))
          }
          return
        }
        if('zoneBlock' == val){
          if(!isDownload && MenuHelper.isMenuEntry('/master/zoneBlock')){
            ret.push(Object.assign({}, column, {key: 'zoneBlock', label: 'zoneBlock'}))
          }
          return
        }
        ret.push(column)
      })
      return ret
    },
    getCustumCsvColumns(){
      return ['ID', 'locationName', this.isShowLocationType()? 'locationTypeName': null, 'areaName', 'x', 'y', 'txViewType', 'visible']
        .concat(this.createCustomColumn(true).map(val => val.key))
        .concat(['deviceId', 'deviceIdX'].filter(val => ConfigHelper.includesDeviceType(val)))
        .filter(val => val)
    },
    customCsvData(val){
      val.ID = val.locationCd
      val.locationTypeName = Util.getValue(OptionHelper.getLocationTypeOptions().find(v => v.value == val.locationType), 'text', null)
      val.zoneClass = Util.getValue(val, 'zoneClass', []).join(';')
      if(Util.hasValue(val.txViewType)){
        val.txViewType = JSON.stringify(val.txViewType)
      }
      const deviceIdList = this.exbs.filter(exb => exb.locationId == val.locationId).map(val => val.deviceId)
      if(ConfigHelper.includesDeviceType('deviceId')){
        val.deviceId = deviceIdList.join(BULK.SPLITTER)
      }
      if(ConfigHelper.includesDeviceType('deviceIdX')){
        val.deviceIdX = deviceIdList.map(val => val.toString(16)).join(BULK.SPLITTER)
      }
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await Promise.all(['location', 'exb'].map(StateHelper.load))
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