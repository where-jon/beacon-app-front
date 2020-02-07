<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <m-list :params="params" :another-page-params="anotherPageParams" compact-mode />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP_SERVICE, EXCLOUD } from '../../../sub/constant/config'
import * as Util from '../../../sub/util/Util'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
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
        name: 'area',
        id: 'areaId',
        indexPath: '/master/area',
        editPath: '/master/area/edit',
        bulkEditPath: '/master/area/bulkedit',
        bulkUploadPath: '/master/area/bulkUpload',
        appServicePath: '/core/area',
        csvOut: true,
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'ID', label: 'id', sortable: true, tdClass: 'action-rowdata'},
          {key: 'areaName', sortable: true, tdClass: 'action-rowdata'},
          {key: 'thumbnail', tdClass: 'action-rowdata' },
          {key: 'actions', thStyle: {width: '130px !important'}, tdClass: 'action-rowdata' }
        ]),
        sortBy: 'ID',
      },
      anotherPageParams: [
        { name: 'zone', id: 'zoneList', jumpPath: '/master/zoneBlock/', sendParamNames: ['updateKey']},
        { name: 'location', id: 'locationIdList', jumpPath: '/master/location/position', sendParamNames: ['updateKey']}, 
      ],
      items: ViewHelper.createBreadCrumbItems('master', 'area'),
      thumbnailUrl: APP_SERVICE.BASE_URL + EXCLOUD.AREA_THUMBNAIL_URL,
    }
  },
  computed: {
    ...mapState('app_service', [
      'updatedAreaThumbnail',
    ]),
  },
  methods: {
    async onSaved(){
      // StateHelper.setForceFetch('tx', true)
      // StateHelper.setForceFetch('exb', true)
      // StateHelper.setForceFetch('zone', true)
      await MasterHelper.loadMaster()
    },
    thumbnail(row) {
      let addUrlParam = ''
      if (this.updatedAreaThumbnail && this.updatedAreaThumbnail === row.updateKey) {
        addUrlParam = new Date().getTime()
      }
      return row.existThumbnail ? this.thumbnailUrl.replace('{id}', row.updateKey) + addUrlParam : null
    },
  },
}
</script>

<style scoped lang="scss"></style>