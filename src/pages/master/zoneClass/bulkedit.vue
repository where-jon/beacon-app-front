<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
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
    breadCrumbs() {
      return ViewHelper.createBreadCrumbItems('master', {text: StringUtil.concatCamel('zone', this.pName), href: this.backPath}, 'bulkRegister')
    },
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave2()
    },
    async onSaved(){
    },
  }
}
</script>

<style scoped lang="scss">

</style>