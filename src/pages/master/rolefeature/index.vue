<template slot="feature">
  <div>
    <m-list :params="params" :list="features" />
  </div>
</template>

<script>
import mList from '../../../components/list.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'
import listmixinVue from '../../../components/listmixin.vue'
import { ROLE_FEATURE, FEATURE } from '../../../sub/constant/Constants'

export default {
  props: ['roleFeatures'],
  components: {
    mList, 
  },
  mixins: [listmixinVue],
  data() {
    return {
      params: {
        name: 'feature',
        id: 'featureId',
        editPath: '/master/rolefeature/edit',
        bulkEditPath: '/master/rolefeature/bulkedit',
        appServicePath: '/meta/feature',
        systemProp: true,
        csvOut: true,
        fields: addLabelByKey(this.$i18n, [ 
          {key: "featureId", sortable: true },
          {key: "featureName", sortable: true },
          {key: "path", sortable: true },
          {key: "modeText", label: "mode", sortable: true },
          {key: "featureTypeName", label: "featureType", sortable: true },
          {key: "version", sortable: true },
          {key: "enabledName", label: "enabled", sortable: true },
          {key: "updateAction", thStyle: {width:'65px !important'} }
        ]),
        initTotalRows: this.$store.state.app_service.features.length,
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'features', 'role',
    ]),
  },
  methods: {
    getModeText(feature, roleFeatures){
      if(roleFeatures === undefined){
        return ROLE_FEATURE.MODE_OPTIONS[0].text
      }
      const roleFeature = roleFeatures.find((val) => val.roleFeaturePK.featureId === feature.featureId)
      if(roleFeature === undefined){
        return ROLE_FEATURE.MODE_OPTIONS[0].text
      }
      const modeName = ROLE_FEATURE.MODE_OPTIONS.find((val) => val.value === roleFeature.mode)
      return modeName !== undefined? modeName.text: ROLE_FEATURE.MODE_OPTIONS[0].text
    },
    getEnableName(feature){
      const enabled = FEATURE.ENABLED_OPTIONS.find((val) => val.value === feature.enabled)
      return enabled? enabled.text: undefined
    },
    getFeatureTypeName(feature){
      const featureType = FEATURE.TYPE_OPTIONS.find((val) => val.value === feature.featureType)
      return featureType? featureType.text: undefined
    },
    async fetchData(payload) {
      this.replace({showProgress: true})
      let features = this.role.roleId === undefined? []: await AppServiceHelper.fetchList("/meta/feature/", 'featureId')
      features = features.map((val) => ({
        ...val,
        modeText: this.getModeText(val, this.roleFeatures),
        enabledName: this.getEnableName(val),
        featureTypeName: this.getFeatureTypeName(val),
      }))
      this.replaceAS({features})
      this.replace({showProgress: false})
    },
  }
}
</script>

<style scoped lang="scss">

</style>
