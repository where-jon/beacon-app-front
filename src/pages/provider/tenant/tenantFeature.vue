<template>
  <div>
    <breadcrumb :items="breadCrumbs" />
    <div class="container">
      <alert :message="message" />

      <b-form v-show="isShow()" @submit.prevent="save">
        <b-form-row class="mb-2 feature">
          <feature-list :list="featureList" :fields="fields" />
        </b-form-row>

        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(true)">
          {{ label }}
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import * as FeatureHelper from '../../../sub/helper/domain/FeatureHelper'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import featureList from '../../../components/page/featureList.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    featureList,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'tenant',
      id: 'tenantId',
      appServicePath: '/meta/tenantFeature',
      breadCrumbs: ViewHelper.createBreadCrumbItems('provider', 'tenant'),
      fields: ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'parentCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'subCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'featureName', label: 'dummy'},
      ]),
      featureList: [],
      tenant: {tenantId: true},
    }
  },
  computed: {
    ...mapState('app_service', [
      'features',
    ]),
  },
  async created(){
    const currentTenant = LocalStorageHelper.getLogin().currentTenant
    const currentFeatureList = currentTenant && currentTenant.tenantFeatureList? currentTenant.tenantFeatureList: []
    await StateHelper.load('feature')
    this.featureList = FeatureHelper.createFeatureTable(this.features, currentFeatureList)
      .filter((val) => val.featureType == 0)
      .map((val) => {return {...val}})
  },
  methods: {
    isShow(){
      return Util.hasValue(this.featureList)
    },
    convertSendParam(){
      const curTenantFeatureMap = {}
      Util.getValue(LocalStorageHelper.getLogin(), 'currentTenant.tenantFeatureList', []).forEach(tenantFeature => {
        const key = Util.getValue(tenantFeature, 'feature.featureId', -1)
        if(0 <= key){
          curTenantFeatureMap[key] = true
        }
      })
      return this.featureList.filter(feature => {
        const check = feature.checked && !feature.disabled
        if(!curTenantFeatureMap[feature.featureId] && check){
          return true
        }
        if(curTenantFeatureMap[feature.featureId] && !check){
          return true
        }
        return false
      })
    },
    async onSaved(){
      await AuthHelper.switchAppService()
    },
    async onSaving() {
      const currentTenant = LocalStorageHelper.getLogin().currentTenant
      const entities = this.convertSendParam().map(feature => {
        return {
          tenantFeaturePK: {tenantId: currentTenant.tenantId, featureId: feature.featureId},
          delFlg: (feature.checked && !feature.disabled)? 0: 1,
          param: ''
        }
      })
      return await AppServiceHelper.bulkSave(this.appServicePath, entities)
    },
  }
}
</script>

<style scoped lang="scss">
  .feature{
    width: 288px;
  }
</style>