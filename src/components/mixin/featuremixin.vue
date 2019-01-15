
<script>
export default {
  methods: {
    getTenantFeatureList() {
      return JSON.parse(window.localStorage.getItem('login')).currentTenant.tenantFeatureList
    },
    isShowFeature(feature) {
      return feature.featureType == 0 && this.getTenantFeatureList().find((tenantFeature) => tenantFeature.feature.featureId == feature.featureId)
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
      const ret = roleFeatureList.filter((roleFeature) => this.isShowRelationFeature(roleFeature.feature))
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
  }
}
</script>
