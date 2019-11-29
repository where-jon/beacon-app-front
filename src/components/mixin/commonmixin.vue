
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { CATEGORY } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as LocaleHelper from '../../sub/helper/base/LocaleHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import * as ThemeHelper from '../../sub/helper/ui/ThemeHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'

export default {
  computed: {
    ...mapState('app_service', [
      'exbs',
      'txs',
      'pots',
      'areas',
      'zones',
      'categories',
      'groups',
      'locations',
      'sensors',
    ]),
    ...mapState([
      'showAlert',
      'loginId'
    ]),
    iosOrAndroid() {
      return BrowserUtil.isAndroidOrIOS()
    },
    editable(){
      return MenuHelper.isEditable(this.$route.path)
    },
    bulkReferenceable() {
      return MenuHelper.isBulkReferenceable(this.$route.path)
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
    potOptions() {
      return StateHelper.getOptionsFromState('pot', false, true)
    },
    locationOptions() {
      return StateHelper.getOptionsFromState('location', false, true)
    },
    exbOptions() {
      return StateHelper.getOptionsFromState('exb', ConfigHelper.includesDeviceType('deviceId')? 'deviceId': 'deviceIdX', true)
    },
    txOptions() {
      return StateHelper.getOptionsFromState('tx', ConfigHelper.includesBtxMinor('btxId')? 'btxId': 'minor', true)
    },
    zoneOptions() {
      return StateHelper.getOptionsFromState('zone', false, true)
    },
    filterSelectedList() {
      return ['area', 'group', 'category', 'detail', 'freeWord']
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
    selectedDetail: {
      get() { return this.$store.state.main.selectedDetail},
      set(val) { this.replaceMain({'selectedDetail': val})},
    },
    selectedFreeWord: {
      get() { return this.$store.state.main.selectedFreeWord},
      set(val) { this.replaceMain({'selectedFreeWord': val})},
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
    getIndividualOptions(categoryId, groupId) {
      return StateHelper.getOptionsFromState('pot', false, true,
        pot => pot.potType == POT_TYPE.PERSON && (!categoryId || pot.categoryId == categoryId) && (!groupId || pot.groupId == groupId)
      )
    },
    defaultSortCompare(a, b, key) {
      return StringUtil.sortByString(a[key], b[key], LocaleHelper.getSystemLocale())
    },
  }
}
</script>
