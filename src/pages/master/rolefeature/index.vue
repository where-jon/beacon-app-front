<template slot="feature">
  <div class="container-fluid">
    <m-list ref="ref" :params="params" :list="roleFeatures" :alert-force-hide="true" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ROLE_FEATURE, FEATURE, BULK } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as FeatureHelper from '../../../sub/helper/FeatureHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import reloadmixin from '../../../components/mixin/reloadmixin.vue'
import mList from '../../../components/page/list.vue'

export default {
  components: {
    mList, 
  },
  mixins: [reloadmixin],
  props: {
    messageParams: {
      type: [Object],
      required: true,
    },
  },
  data() {
    return {
      params: {
        name: 'roleFeature',
        id: 'key',
        confirmName: 'featureName',
        indexPath: '/master/role',
        editPath: '/master/rolefeature/edit',
        bulkEditPath: '/master/rolefeature/bulkedit',
        appServicePath: '/meta/roleFeature',
        csvOut: true,
        custumCsvColumns: ['featureName', 'path', 'modeText', 'featureTypeName', 'version', 'enabledName'],
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'featureName', sortable: true },
          {key: 'path', sortable: true },
          {key: 'modeText', label: 'mode', sortable: true },
          {key: 'featureTypeName', label: 'featureType', sortable: true },
          {key: 'version', sortable: true },
          {key: 'enabledName', label: 'enabled', sortable: true },
          {key: 'actions', thStyle: {width:'130x !important'} }
        ]),
        hideSearchBox: !Util.hasValue(this.$store.state.app_service.role.roleId),
        sortBy: 'featureName',
        initTotalRows: this.$store.state.app_service.roleFeatures.length,
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'role', 'features', 'roleFeatures',
    ]),
  },
  methods: {
    ...mapActions([
      'showProgress',
      'hideProgress',
    ]),
    getModeText(roleFeature){
      const modeName = ROLE_FEATURE.getModeOptions().filter((val) => val.value & roleFeature.mode)
      if(!Util.hasValue(modeName)){
        return this.$i18n.tnl('label.allRejection')
      }
      return roleFeature.mode == ROLE_FEATURE.getAllAuthorizationOption().value? this.$i18n.tnl('label.allAuthorization'): modeName.map((val) => val.text).join(', ')
    },
    getEnableName(feature){
      const enabled = FEATURE.getEnabledOptions().find((val) => val.value === feature.enabled)
      return enabled? enabled.text: null
    },
    getFeatureTypeName(feature){
      const featureType = FEATURE.getTypeOptions().find((val) => val.value === feature.featureType)
      return featureType? featureType.text: null
    },
    getFeatureInfo(features, roleFeature){
      const feature = features.find((val) => val.featureId === roleFeature.roleFeaturePK.featureId)
      return feature == null? {}: {
        key: `${roleFeature.roleFeaturePK.roleId}/${roleFeature.roleFeaturePK.featureId}`,
        roleId: roleFeature.roleFeaturePK.roleId,
        featureId: roleFeature.roleFeaturePK.featureId,
        featureName: this.$i18n.tnl(`label.${feature.featureName}`),
        path: feature.path,
        mode: roleFeature.mode,
        modeText: this.getModeText(roleFeature),
        featureType: feature.featureType,
        featureTypeName: this.getFeatureTypeName(feature),
        version: feature.version,
        enabled: feature.enabled,
        enabledName: this.getEnableName(feature),
      }
    },
    onSaved(){
      if(this.$refs.ref.message){
        this.messageParams.message = this.$refs.ref.message
      }
    },
    async fetchData(payload) {
      this.showProgress()
      await StateHelper.load('feature')
      if(Util.hasValue(this.role.roleId)){
        let roleFeatures = await AppServiceHelper.fetchList(`/meta/roleFeature/${this.role.roleId}`)
        if(Util.hasValue(roleFeatures) && ArrayUtil.isArray(roleFeatures)){
          roleFeatures = FeatureHelper.getFilterRoleFeatureList(roleFeatures)
          roleFeatures = roleFeatures.map((val) => (this.getFeatureInfo(this.features, val)))
          roleFeatures = _(roleFeatures).sortBy((val) => val.featureName).compact().value()
        }
        else{
          roleFeatures = []
        }
        this.replaceAS({roleFeatures})
      }
      else{
        this.replaceAS({roleFeatures: []})
      }
      this.hideProgress()
    },
    customCsvData(val){
      val.updateKey = val.roleId + BULK.SPLITTER + val.featureId
    },
  }
}
</script>

<style scoped lang="scss">

</style>
