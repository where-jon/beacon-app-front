<template>
  <div>
    <breadcrumb :items="items" />
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
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as LocalStorageHelper from '../../../sub/helper/LocalStorageHelper'
import * as FeatureHelper from '../../../sub/helper/FeatureHelper'
import editmixin from '../../../components/mixin/editmixin.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import featureList from '../../../components/page/featureList.vue'

export default {
  components: {
    breadcrumb,
    alert,
    featureList,
  },
  mixins: [editmixin, commonmixin],
  data() {
    return {
      name: 'tenant',
      id: 'tenantId',
      appServicePath: '/meta/tenantFeature',
      items: ViewHelper.createBreadCrumbItems('provider', 'tenant'),
      fields: ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'parentCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'subCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'featureName', label: 'dummy'},
      ]),
      tenant: {tenantId: true},
      featureList: [],
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
    async onSaved(){
      await AuthHelper.switchAppService()
    },
    async onSaving() {
      const currentTenant = LocalStorageHelper.getLogin().currentTenant
      const entities = this.featureList.filter(feature => !feature.disabled && feature.checked).map(feature => {
        return {
          tenantFeaturePK: {tenantId: currentTenant.tenantId, featureId: feature.featureId},
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
    width: 256px;
  }
</style>