<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
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
      name: 'role',
      id: 'roleId',
      backPath: '/master/role',
      appServicePath: '/meta/role',
      breadCrumbs: ViewHelper.createBreadCrumbItems('master', {text: 'role', href: '/master/role'}, 'bulkRegister'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'role',
    ]),
  },
  methods: {
    async onSaved(){
    },
    async onSaving() {
      await this.$refs.bulkEdit.bulkSaveByCsvFile()
    },
  }
}
</script>

<style scoped lang="scss">

</style>