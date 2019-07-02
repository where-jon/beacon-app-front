
<script>
import { mapMutations, mapActions } from 'vuex'
import { CATEGORY } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as OptionHelper from '../../sub/helper/OptionHelper'
import * as ThemeHelper from '../../sub/helper/ThemeHelper'
import * as VueSelectHelper from '../../sub/helper/VueSelectHelper'

export default {
  computed: {
    iosOrAndroid() {
      return BrowserUtil.isAndroidOrIOS()
    },
    theme() {
      return ThemeHelper.getButtonTheme()
    },
    groupOptions() {
      return OptionHelper.getGroupOptions()
    },
    categoryOptions() {
      return OptionHelper.getCategoryOptions(CATEGORY.POT_AVAILABLE)
    },
    vueSelectStyle(){
      return VueSelectHelper.getVueSelectStyle()
    },
    sensorOptions() {
      return OptionHelper.getAllSensorOptions()
    },
    sensorOptionsExb() {
      return OptionHelper.getExbOptions()
    },
    sensorOptionsTx() {
      return OptionHelper.getTxOptions()
    },
    vueSelectNoMatchingOptions(){
      return VueSelectHelper.vueSelectNoMatchingOptions()
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
    vueSelectCutOn(option, required){
      return VueSelectHelper.vueSelectCutOn(option, required)
    },
    vueSelectTitle(selected){
      return VueSelectHelper.vueSelectTitle(selected)
    },
    closeVueSelect(){
      VueSelectHelper.closeVueSelect()
    },
  }
}
</script>
