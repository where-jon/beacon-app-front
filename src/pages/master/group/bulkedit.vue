<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as Util from '../../../sub/util/Util'
import * as ExtValueHelper from '../../../sub/helper/domain/ExtValueHelper'
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
      name: 'group',
      id: 'groupId',
      backPath: '/master/group',
      appServicePath: '/basic/group',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'group', href: '/master/group'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'group'
    ]),
  },
  async created() {
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSaveByCsvFile()
    },
    async onSaved(){
    },
  }
}
</script>

<style scoped lang="scss">

</style>