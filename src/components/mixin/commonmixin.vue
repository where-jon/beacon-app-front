
<script>
import { mapMutations, mapActions } from 'vuex'
import * as Util from '../../sub/util/Util'
import * as StateHelper from '../../sub/helper/StateHelper'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'
import * as StateHelper from '../../sub/helper/StateHelper'

export default {
  computed: {
    groupOptions() {
      return StateHelper.getOptionsFromState('group')
    },
  },
  methods: {
    ...mapMutations('app_service', [
      'replaceAS', 
      'clear', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    ...mapActions([
      'showErrorModal'
    ]),
    ...mapMutations('main', [
      'replaceMain', 
    ]),
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
    ...mapActions([
      'showProgress',
      'hideProgress',
    ]),
    getSensorId(exb) {
      return Util.getValue(exb, 'exbSensorList.0.sensor.sensorId').val
    },
    getButtonTheme() {
      return 'outline-' + getButtonTheme()
    },
    isEnabledMenu (key) {
      for(let group of this.$store.state.menu){
        for(let page of group.pages){
          if(page.key == key){
            return true
          }
        }
      }
      return false
    },
    getZoneCategoryOptions(zoneCategories){
      const zoneCategoryIds = zoneCategories.filter((zoneCategory) => zoneCategory.categoryId >= 0).map((zoneCategory) => zoneCategory.categoryId)
      return StateHelper.getOptionsFromState('category', false, true, (category) => zoneCategoryIds.includes(`${category.categoryId}`))
    },
    getZoneOptions(zoneCategories, selectCategory){
      const zoneUniqs = {}
      zoneCategories.forEach(zoneCategory => {
        if (selectCategory == null || zoneCategory.categoryId == selectCategory.value) {
          zoneUniqs[zoneCategory.zoneId] = zoneCategory.zoneName
        }
      })
      const zoneOptionList = []
      for (let zId in zoneUniqs) {
        zoneOptionList.push({ label: zoneUniqs[zId], value: zId })
      }
      return zoneOptionList
    }
  }
}
</script>
