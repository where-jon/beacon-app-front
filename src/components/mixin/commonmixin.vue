
<script>
import { mapMutations, mapActions } from 'vuex'
import * as Util from '../../sub/util/Util'
import * as StateHelper from '../../sub/helper/StateHelper'
import { getButtonTheme } from '../../sub/helper/ThemeHelper'

export default {
  computed: {
    groupOptions() {
      return StateHelper.getOptionsFromState('group', false, true)
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
    getCategoryOptions(includeTypes = []) {
      return StateHelper.getOptionsFromState('category', false, true).filter((option) => {
        const category = this.$store.state.app_service.categories.find((cat) => cat.categoryId == option.value)
        return option.value == null || category && (!Util.hasValue(includeTypes) || includeTypes.includes(category.categoryType))
      })
    },
    getSensorIds(exb) {
      const exbSensorList = Util.getValue(exb, 'exbSensorList', null) // TODO: FIX
      if(Util.hasValue(exbSensorList)){
        const ret = []
        exbSensorList.forEach(exbSensor => ret.push(Util.getValue(exbSensor, 'sensor.sensorId', null)))
        return ret
      }
      return [null]
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
      return StateHelper.getOptionsFromState('category',
        category => StateHelper.getDispCategoryName(category),
        true,
        (category) => zoneCategoryIds.includes(`${category.categoryId}`))
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
