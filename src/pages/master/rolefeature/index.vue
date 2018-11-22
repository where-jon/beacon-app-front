<template slot="feature">
  <div>
    <m-list :params="params" :list="roleFeatures" />
  </div>
</template>

<script>
import mList from '../../../components/page/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import * as Util from '../../../sub/util/Util'
import listmixinVue from '../../../components/mixin/listmixin.vue'
import { ROLE_FEATURE, FEATURE } from '../../../sub/constant/Constants'

export default {
  components: {
    mList, 
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'roleFeature',
        id: 'key',
        editPath: '/master/rolefeature/edit',
        bulkEditPath: '/master/rolefeature/bulkedit',
        appServicePath: '/meta/roleFeature',
        csvOut: true,
        custumCsvColumns: ["roleId", "featureId", "featureName", "path", "modeText", "featureTypeName", "version", "enabledName"],
        hideSearchBox: !Util.hasValue(this.$store.state.app_service.role.roleId),
        fields: addLabelByKey(this.$i18n, [ 
          {key: "featureId", sortable: true },
          {key: "featureName", sortable: true },
          {key: "path", sortable: true },
          {key: "modeText", label: "mode", sortable: true },
          {key: "featureTypeName", label: "featureType", sortable: true },
          {key: "version", sortable: true },
          {key: "enabledName", label: "enabled", sortable: true },
          {key: "actions", thStyle: {width:'130x !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.features.length,
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'role', 'features', 'roleFeatures',
    ]),
  },
  methods: {
    getModeText(roleFeature){
      const modeName = ROLE_FEATURE.getModeOptions().find((val) => val.value === roleFeature.mode)
      return modeName? modeName.text: null
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
        featureName: feature.featureName,
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
    async fetchData(payload) {
      this.replace({showProgress: true})
      await StateHelper.load('feature')
      if(Util.hasValue(this.role.roleId)){
        let roleFeatures = await AppServiceHelper.fetchList(`/meta/roleFeature/${this.role.roleId}`)
        if(Util.hasValue(roleFeatures) && Util.isArray(roleFeatures)){
          roleFeatures = roleFeatures.map((val) => (this.getFeatureInfo(this.features, val)))
          roleFeatures = _(roleFeatures).sortBy((val) => val.featureId).compact().value()
        }
        else{
          roleFeatures = []
        }
        this.replaceAS({roleFeatures})
      }
      else{
        this.replaceAS({roleFeatures: []})
      }
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
