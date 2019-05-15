<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <bulkedit :id="id" :name="name" :back-path="backPath" :app-service-path="appServicePath" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import { BULK, ROLE_FEATURE } from '../../../sub/constant/Constants'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import bulkedit from '../../../components/page/bulkedit.vue'
import commonmixinVue from '../../../components/mixin/commonmixin.vue'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as BulkHelper from '../../../sub/helper/BulkHelper'

export default {
  components: {
    breadcrumb,
    bulkedit,
  },
  mixins: [commonmixinVue],  
  data() {
    return {
      name: 'roleFeature',
      id: 'roleId',
      backPath: '/master/role/edit',
      appServicePath: '/meta/roleFeature',
      roleFeature:{
        roleId: this.$store.state.app_service.role.roleId
      },
      items: ViewHelper.createBreadCrumbItems(
        'master',
        {text: 'role', href: '/master/role'},
        {text: 'update', href: '/master/role/edit'},
        'feature',
        'bulkRegister'
      ),
    }
  },
  computed: {
    ...mapState('app_service', [
      'role',
    ]),
    modeOptions(){
      return ROLE_FEATURE.getModeOptions()
    },
  },
  methods: {
    getModeValue(pModeText){
      if(!Util.hasValue(pModeText)){
        return ROLE_FEATURE.MODE.DENY
      }
      const modeOptions = ROLE_FEATURE.getModeOptions()
      const modeTexts = pModeText.split(',')
      let modeValue = 0
      modeTexts.forEach(modeText => {
        const all = ROLE_FEATURE.getAllAuthorizationOption()
        if(all.text == modeText.trim()){
          modeOptions.forEach(modeOption => modeValue = modeValue | modeOption.value)
          return modeValue
        }
        const mode = modeOptions.find(modeOption => modeOption.text == modeText.trim())
        modeValue = modeValue | (mode? mode.value: 0)
      })
      return modeValue
    },
    async save(bulkSaveFunc) {
      await bulkSaveFunc(BULK.PRIMARY_KEY, null, null, (entity, headerName, val, dummyKey) => {
        if (BulkHelper.isPrimaryKeyHeader(headerName)){
          const keys = val.split(BULK.SPLITTER)
          BulkHelper.setNumberKey(entity, 'roleId', Util.getValue(keys, '0', dummyKey--))
          BulkHelper.setNumberKey(entity, 'featureId', Util.getValue(keys, '1', dummyKey--))
          entity.updateKey = val,
          entity.roleFeaturePK = {
            roleId: entity.roleId,
            featureId: entity.featureId,
          }
          return dummyKey
        }
        if(headerName == 'modeText') {
          entity.mode = this.getModeValue(val)
          return dummyKey
        }
        entity[headerName] = val
        return dummyKey
      }, (entity, dummyKey) => entity.rootRoleId = this.role.roleId )
    },
  }
}
</script>

<style scoped lang="scss">

</style>