<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="zoneList" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ZONE } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
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
        name: 'zone',
        id: 'zoneId',
        indexPath: '/master/zoneClass',
        editPath: '/master/zoneClass/edit',
        bulkEditPath: '/master/zoneClass/bulkedit',
        appServicePath: '/core/zone',
        csvOut: true,
        custumCsvColumns: ['ID', 'zoneName', 'areaName', 'categoryName'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'zoneCd', label: 'id', sortable: true },
          {key: 'zoneName', sortable: true },
          {key: 'areaName', sortable: true},
          {key: 'dispCategoryName', label: 'categoryName', sortable: true},
          {key: 'actions', thStyle: {width:'130px !important'} }
        ]),
        sortBy: 'zoneName',
        initTotalRows: this.zoneLength
      },
      items: ViewHelper.createBreadCrumbItems('master', 'zoneClass'),
    }
  },
  computed: {
    zoneList() {
      Util.table(this.$store.state.app_service.zones)
      return this.$store.state.app_service.zones.filter((zone)=> zone.zoneType ==  ZONE.NON_COORDINATE)
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
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('zone')
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
