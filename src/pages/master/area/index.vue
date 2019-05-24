<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :list="areaList" :another-page-params="anotherPageParams" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import * as Util from '../../../sub/util/Util'
import { APP_SERVICE, EXCLOUD } from '../../../sub/constant/config'

export default {
  components: {
    mList, 
    breadcrumb,
  },
  mixins: [listmixinVue],
  data() {
    return {
      areaList: [],
      params: {
        name: 'area',
        id: 'areaId',
        indexPath: '/master/area',
        editPath: '/master/area/edit',
        bulkEditPath: '/master/area/bulkedit',
        bulkUploadPath: '/master/area/bulkUpload',
        appServicePath: '/core/area',
        csvOut: true,
        custumCsvColumns: ['areaName', 'areaCd'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'areaName', sortable: true, tdClass: 'action-rowdata'},
          {key: 'areaCd', sortable: true, tdClass: 'action-rowdata'},
          {key: 'thumbnail', tdClass: 'action-rowdata' },
          {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
        ]),
        sortBy: 'areaName',
        initTotalRows: this.$store.state.app_service.areas.length
      },
      anotherPageParams: [
        { name: 'zone', id: 'zoneList', jumpPath: '/master/zoneBlock/', sendParamNames: ['areaId']},
        { name: 'location', id: 'locationList', jumpPath: '/master/location/', sendParamNames: ['areaId']}, 
      ],
      items: ViewHelper.createBreadCrumbItems('master', 'area'),
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.AREA_THUMBNAIL_URL,
    }
  },
  computed: {
    ...mapState('app_service', [
      'areas',
    ]),
  },
  methods: {
    afterCrud(){
      StateHelper.setForceFetch('tx', true)
      StateHelper.setForceFetch('exb', true)
      StateHelper.setForceFetch('zone', true)
    },
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('area')
        this.areaList = this.areas.map((val) => ({
          ...val,
          zoneList: Util.hasValue(val.zoneList)? val.zoneList: [],
          locationList: Util.hasValue(val.locationList)? val.locationList: [],
        })) // omit images to avoid being filtering target
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    thumbnail(row) {
      return this.thumbnailUrl.replace('{id}', row.areaId)
    },
  },
}
</script>

<style scoped lang="scss"></style>