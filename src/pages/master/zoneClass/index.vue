<template>
  <div class="container-fluid">
    <ex-master p-master-name="zone" :p-category-name="pName" :p-type-list="pTypeList" :p-params="params" :p-list="zones" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { ZONE } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'
import exMaster from '../../../components/page/ex-master.vue'

export default {
  props: {
    pName: {
      type: String,
      default: 'class',
    },
    pPath: {
      type: String,
      default: '/master/zoneClass',
    },
    pAppServicePath: {
      type: String,
      default: '/core/zone',
    },
    pTypeList: {
      type: Array,
      default: () => APP.ZONE.TYPES,
    },
  },
  components: {
    exMaster,
  },
  mixins: [
    reloadmixin
  ],
  data() {
    return {
      params: {
        name: 'zone',
        id: 'zoneId',
        indexPath: this.pPath,
        editPath: this.pPath + '/edit',
        bulkEditPath: this.pPath + '/bulkedit',
        appServicePath: this.pAppServicePath,
        csvOut: true,
        custumCsvColumns: ['ID', 'zoneTypeName', 'zoneName', 'areaName', 'categoryName'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'zoneCd', label: 'id', sortable: true },
          {key: 'zoneType', sortable: true },
          {key: 'zoneName', sortable: true },
          {key: 'areaName', sortable: true},
          {key: 'dispCategoryName', label: 'categoryName', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'zoneCd',
        initTotalRows: this.zoneLength
      },
    }
  },
  computed: {
    zoneList() {
      Util.table(this.$store.state.app_service.zones)
      return this.$store.state.app_service.zones.filter(zone => this.pTypeList.includes(zone.zoneType))
    },
    zoneLength() {
      return this.zoneList().length
    },
    ...mapState('app_service', [
      'zones',
    ]),
  },
  methods: {
    customCsvData(val){
      val.ID = val.zoneCd
    },
    onSaved(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
      StateHelper.setForceFetch('category', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await Promise.all(['zone', 'category'].map(master => StateHelper.load(master)))
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
