
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { CATEGORY } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import * as ThemeHelper from '../../sub/helper/ui/ThemeHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'

export default {
  computed: {
    ...mapState('app_service', [
      'areas',
      'exbs',
      'txs',
    ]),
    ...mapState([
      'loginId'
    ]),
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
    areaOptions() {
      return StateHelper.getOptionsFromState('area', false, true)
    },
    selectedArea: {
      get() { return this.$store.state.main.selectedArea},
      set(val) { this.replaceMain({'selectedArea': val})},
    },
    selectedGroup: {
      get() { return this.$store.state.main.selectedGroup},
      set(val) { this.replaceMain({'selectedGroup': val})},
    },
    selectedCategory: {
      get() { return this.$store.state.main.selectedCategory},
      set(val) { this.replaceMain({'selectedCategory': val})},
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
