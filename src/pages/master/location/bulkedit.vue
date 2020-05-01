<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :bulk-name="bulkName" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import { ZONE, PATTERN, BULK } from '../../../sub/constant/Constants'
import * as NumberUtil from '../../../sub/util/NumberUtil'
import * as Util from '../../../sub/util/Util'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
import * as OptionHelper from '../../../sub/helper/dataproc/OptionHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  data() {
    return {
      name: 'location',
      id: 'locationId',
      backPath: '/master/location',
      appServicePath: '/core/location',
      bulkName: 'locationList',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'locationList', href: '/master/location'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'location',
      'zones'
    ]),
    zoneMap(){
      const ret = {}
      this.zones.forEach(zone => ret[zone.zoneName] = zone)
      return ret
    }
  },
  async created() {
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSaveByCsvFile()
    },
  }
}
</script>

<style scoped lang="scss">

</style>