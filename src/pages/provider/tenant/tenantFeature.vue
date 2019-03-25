<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-show="isShow()" @submit.prevent="onSubmit">
        <b-form-row class="mb-2 feature">
          <feature-list :list="featureList" :fields="fields" />
        </b-form-row>

        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(true)">
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
import editmixinVue from '../../../components/mixin/editmixin.vue'
import featuremixinVue from '../../../components/mixin/featuremixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import featureList from '../../../components/page/featureList.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    alert,
    featureList,
  },
  mixins: [editmixinVue, featuremixinVue],
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
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'features',
    ]),
  },
  async created(){
    const currentTenant = Util.getLogin().currentTenant
    const currentFeatureList = currentTenant && currentTenant.tenantFeatureList? currentTenant.tenantFeatureList: []
    await StateHelper.load('feature')
    this.featureList = this.createFeatureTable(this.features, currentFeatureList)
      .filter((val) => val.featureType == 0)
      .map((val) => {return {...val}})
  },
  methods: {
    isShow(){
      return Util.hasValue(this.featureList)
    },
    async afterCrud(){
      await AuthHelper.switchAppService()
    },
    async save() {
      const currentTenant = Util.getLogin().currentTenant
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