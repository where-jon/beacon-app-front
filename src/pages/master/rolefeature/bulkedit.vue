<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
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
      items: ViewHelper.createBreadCrumbItems(
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
      await this.$refs.bulkEdit.bulkSave2()
    },
    getConf() {
      return {allRejectionLabel: this.$i18n.tnl('label.allRejection')}
    },
    onRestruct(entity, dummyKey){
      let keys = null
      if(Util.hasValue(entity.updateKey) && entity.updateKey.split){
        keys = entity.updateKey.split(BULK.SPLITTER)
      }
      else{
        const targetFeature = this.features.find(feature => this.$i18n.tnl('label.'+ feature.featureName) == entity.featureName)
        keys = [this.role.roleId, Util.getValue(targetFeature, 'featureId', dummyKey--)]
      }
      BulkHelper.setNumberKey(entity, 'roleId', Util.getValue(keys, '0', dummyKey--))
      BulkHelper.setNumberKey(entity, 'featureId', Util.getValue(keys, '1', dummyKey--))
      entity.roleFeaturePK = {
        roleId: entity.roleId,
        featureId: entity.featureId,
      }
      if(Util.hasValue(entity.modeText)) {
        entity.mode = BulkHelper.getModeValue(entity.modeText)
      }
      entity.rootRoleId = this.role.roleId
      return dummyKey
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