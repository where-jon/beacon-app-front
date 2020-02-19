<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="pAppServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { ZONE, PATTERN } from '../../../sub/constant/Constants'
import * as StringUtil from '../../../sub/util/StringUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  props: {
    pName: {
      type: String,
      default: '',
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
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'zone',
      id: 'zoneId',
    }
  },
  computed: {
    ...mapState('app_service', [
      'zone',
    ]),
    backPath() {
      return this.pPath
    },
    items() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('zone', this.pName), href: this.backPath}, 'bulkRegister')
    },
  },
  methods: {
    onRestruct(entity, dummyKey){
      const zoneType = ZONE.getOptions().filter(option => APP.ZONE.TYPES.includes(option.value)).find(option => option.text == entity.zoneTypeName)
      if(!zoneType) {
        BulkHelper.addInvalid(entity, 'zoneType', entity.zoneTypeName)
      } else {
        entity.zoneTypeName = null
        entity.zoneType = zoneType.value
      }
      if(Util.hasValue(entity.areaName)) {
        entity.area = {areaId: dummyKey--, areaName: entity.areaName}
      }
      if(Util.hasValue(entity.ID)){
        BulkHelper.setStringKey(entity, 'zoneCd', entity.ID, PATTERN.REGEXP.MASTER_CD)
      }
      ExtValueHelper.copyToChild(entity, APP.ZONE)
      return dummyKey
    },
    async onSaved(){
    },
  }
}
</script>

<style scoped lang="scss">

</style>