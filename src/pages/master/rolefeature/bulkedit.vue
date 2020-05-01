<template>
  <div class="container-fluid">
    <breadcrumb :items="breadCrumbs" />
    <bulkedit :id="id" ref="bulkEdit" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BULK } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import * as BulkHelper from '../../../sub/helper/dataproc/BulkHelper'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import bulkedit from '../../../components/page/bulkedit.vue'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  mixins: [commonmixin],  
  data() {
    return {
      name: 'roleFeature',
      id: 'roleId',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      breadCrumbs: ViewHelper.createBreadCrumbItems(
        'master',
        {text: 'role', href: '/master/role'},
        {text: 'update', href: '/master/role/edit'},
        'feature',
        'bulkRegister'
      ),
      roleFeature:{
        roleId: this.$store.state.app_service.role.roleId
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'role',
      'features'
    ]),
  },
  async mounted() {
    await StateHelper.load('feature')
  },
  methods: {
    async onSaving() {
      await this.$refs.bulkEdit.bulkSaveByCsvFile()
    },
    getConf() {
      return {
        allAuthorizationLabel: this.$i18n.tnl('label.allAuthorization'), 
        allRejectionLabel: this.$i18n.tnl('label.allRejection')
      }
    },
    async onSaved(){
      const login = LocalStorageHelper.getLogin()
      if(Util.getValue(login, 'role.roleId') == this.roleFeature.roleId){
        await AuthHelper.switchAppService()
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>