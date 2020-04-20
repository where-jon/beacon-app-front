<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { IGNORE, CATEGORY, POT_TYPE } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as SensorHelper from '../../../sub/helper/domain/SensorHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  mixins: [commonmixin],
  data() {
    return {
      name: 'tx',
      id: 'txId',
      backPath: '/master/tx',
      appServicePath: '/core/tx',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'masterTx', href: '/master/tx'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'tx', 'potImages'
      // , 'txs', 'categories', 'groups', 'pots'
    ]),
  },
  async mounted() {
  },
  methods: {
    createDefaultName(prefix){
      return prefix + '_' + (new Date().getTime() % 10000)
    },
    async onSaving() {
      await this.$refs.bulkEdit.bulkSave2()
    },
    getConf() {
      return {nullLabel: this.$i18n.tnl('label.null'), normalLabel: this.$i18n.tnl('label.normal')}
    },
  }
}
</script>

<style scoped lang="scss">

</style>