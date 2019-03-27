<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="zoneList" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import {ZONE} from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
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
        custumCsvColumns: ['zoneId', 'zoneName', 'areaName', 'categoryName'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'zoneName', sortable: true },
          {key: 'areaName', sortable: true},
          {key: 'dispCategoryName', label: 'categoryName', sortable: true},
          {key: 'zoneId', sortable: true },
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
      'forceFetchZone',
    ]),
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('zone', this.forceFetchZone)
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
