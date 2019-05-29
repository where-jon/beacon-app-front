<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import { BULK, PATTERN } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'area',
      id: 'areaId',
      backPath: '/master/area',
      appServicePath: '/core/area',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'area', href: '/master/area'}, 'bulkRegister'),
      masterCd: null,
    }
  },
  computed: {
    ...mapState('app_service', [
      'area', 'areas'
    ]),
  },
  async created() {
    await StateHelper.load('area')
    this.masterCd = StateHelper.createMasterCd('area', this.areas, null)
  },
  methods: {
    resetData(entity, dummyKey){
      if(!Util.hasValue(entity.areaCd)){
        entity.areaCd = this.masterCd
        this.masterCd = StateHelper.createMasterCd('area', [{areaCd: this.masterCd}], null)
      }
      return dummyKey
    },
    async save(bulkSaveFunc) {
      const NUMBER_TYPE_LIST = ['areaId']
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          BulkHelper.setPrimaryKey(entity, this.id, val, dummyKey--)
          return dummyKey
        }
        if(Util.equalsAny(headerName, NUMBER_TYPE_LIST)){
          BulkHelper.setNumberKey(entity, headerName, val)
          return dummyKey
        }
        if(headerName == 'areaCd'){
          BulkHelper.setStringKey(entity, headerName, val, PATTERN.REGEXP.MASTER_CD)
          return dummyKey
        }
        entity[headerName] = val
        return dummyKey
      }, (entity, dummyKey) => this.resetData(entity, dummyKey))
    },
  }
}
</script>

<style scoped lang="scss">

</style>