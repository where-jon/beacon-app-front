
<script>
export default {
  methods: {
    getTenantFeatureList() {
      return JSON.parse(window.localStorage.getItem('login')).currentTenant.tenantFeatureList
    },
    isShowFeature(feature) {
      return feature.featureType == 0 && this.getTenantFeatureList().find((tenantFeature) => tenantFeature.feature.featureId == feature.featureId)
    },
    isSystemFeature(feature) {
      return feature.featureType == 1
    },
    isShowRelationFeature(feature) {
      if(this.isShowFeature(feature)){
        return true
      }
      const tenantFeatureList = this.getTenantFeatureList()
      const featureIds = this.getFeatureIds(feature.featureId)
      const relation = tenantFeatureList.find((tenantFeature) => {
        const tenantFeatureIds = this.getFeatureIds(tenantFeature.feature.featureId)
        if(tenantFeatureIds.subId == 0){
          return tenantFeatureIds.parentId == featureIds.parentId 
        }
        return false
      })
      return relation? true: false
    },
    getFilterRoleFeatureList(roleFeatureList) {
      const ret = roleFeatureList.filter((roleFeature) => {
        return this.isSystemFeature(roleFeature.feature) || this.isShowRelationFeature(roleFeature.feature)
      })
      return ret? ret: []
    },
    getFeatureIds(featureId){
      const featureIdStr = String(featureId)
      const featureIdDigit = featureIdStr.length % 2 == 0? 2: 1
      return {
        parentId: featureIdStr.length <= 6? Number(featureIdStr.slice(0, featureIdDigit)): featureId,
        subId: featureIdStr.length <= 6? Number(featureIdStr.substring(featureIdDigit)): 0,
      }
    },
    createFeatureTable(masterFeatureList, currentFeatureList){
      return masterFeatureList.map((feature) => {
        const featureIds = this.getFeatureIds(feature.featureId)
        const tenantFeature = currentFeatureList.find((val) => val.tenantFeaturePK.featureId == feature.featureId)
        const parentFeature = featureIds.subId != 0 && currentFeatureList.find((val) => {
          const ids = this.getFeatureIds(val.tenantFeaturePK.featureId)
          return ids.parentId == featureIds.parentId && ids.subId == 0
        })
        return {
          ...feature,
          parentShow: featureIds.subId == 0,
          parentId: featureIds.parentId,
          subShow: featureIds.subId != 0,
          subId: featureIds.subId,
          checked: tenantFeature? true: false,
          disabled: parentFeature? true: false,
        }
      })
        .sort((a, b) => {
          if(a.featureType != b.featureType){
            return a.featureType < b.featureType? -1: 1
          }
          if(a.parentId != b.parentId){
            return a.parentId < b.parentId? -1: 1
          }
          if(a.subId != b.subId){
            return a.subId < b.subId? -1: 1
          }
          return 0
        })
    },
  }
}
</script>
