
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { CATEGORY, POT_TYPE } from '../../sub/constant/Constants'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as StringUtil from '../../sub/util/StringUtil'
import * as Util from '../../sub/util/Util'
import * as ConfigHelper from '../../sub/helper/dataproc/ConfigHelper'
import * as LocaleHelper from '../../sub/helper/base/LocaleHelper'
import * as MenuHelper from '../../sub/helper/dataproc/MenuHelper'
import * as OptionHelper from '../../sub/helper/dataproc/OptionHelper'
import * as ThemeHelper from '../../sub/helper/ui/ThemeHelper'
import * as VueSelectHelper from '../../sub/helper/ui/VueSelectHelper'
import * as MasterHelper from '../../sub/helper/domain/MasterHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'

const exMapState = (namespace, map) => {
  return mapState(namespace, map)
  // let ret = {} // 実験：not work yet
  // map.forEach(e => {
  //   ret[e] = {
  //     get: () => {return StateHelper.getMaster(e)},
  //     set: (val) => {}
  //   }
  // })
  // return ret
}

export default {
  computed: {
    ...exMapState('app_service', [
      'exbs',
      'exbIdMap',
      'deviceIdMap',
      'txs',
      'txIdMap',
      'btxIdMap',
      'pots',
      'potIdMap',
      'areas',
      'areaIdMap',
      'zones',
      'zoneIdMap',
      'categories',
      'categoryIdMap',
      'groups',
      'groupIdMap',
      'locations',
      'locationIdMap',
      'sensors',
      'sensorIdMap',
      'roles',
      'regions',
    ]),
    ...mapState([
      'showAlert',
      'loginId'
    ]),
    iosOrAndroid() {
      return BrowserUtil.isAndroidOrIOS()
    },
    isResponsiveMode() {
      return BrowserUtil.isResponsiveMode()
    },
    isTenantAdmin() {
      const login = LocalStorageHelper.getLogin()
      return login? login.isTenantAdmin: false
    },
    isProviderUser(){
      const login = LocalStorageHelper.getLogin()
      return login.isProviderUser
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
    zoneCategoryOptions() {
      return MasterHelper.getOptionsFromState('category',
        category => MasterHelper.getDispCategoryName(category),
        true, 
        category => CATEGORY.ZONE_AVAILABLE.includes(category.categoryType) && category.categoryCd != 'ABSENT'
      )
    },
    authCategoryOptions() {
      return OptionHelper.getCategoryOptions([CATEGORY.AUTH])
    },
    vueSelectStyle(){
      return VueSelectHelper.getVueSelectStyle()
    },
    sensorOptions() {
      return OptionHelper.getAllSensorOptions()
    },
    sensorGraphOptions() {
      return OptionHelper.getGraphSensorOptions()
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
      return MasterHelper.getOptionsFromState('area', false, true)
    },
    potOptions() {
      return MasterHelper.getOptionsFromState('pot', false, true)
    },
    locationOptions() {
      return MasterHelper.getOptionsFromState('location', false, true)
    },
    exbOptions() {
      return MasterHelper.getOptionsFromState('exb', ConfigHelper.includesDeviceType('deviceId')? 'deviceId': 'deviceIdX', true)
    },
    txOptions() {
      return MasterHelper.getOptionsFromState('tx', ConfigHelper.includesBtxMinor('btxId')? 'btxId': 'minor', true)
    },
    zoneOptions() {
      return MasterHelper.getOptionsFromState('zone', false, true)
    },
    filterSelectedList() {
      return ['area', 'group', 'category', 'detail', 'freeWord']
    },
    selectedAreaId: {
      get() { return this.$store.state.main.selectedAreaId},
      set(val) { this.replaceMain({'selectedAreaId': val})},
    },
    selectedGroupId: {
      get() { return this.$store.state.main.selectedGroupId},
      set(val) { this.replaceMain({'selectedGroupId': val})},
    },
    selectedCategoryId: {
      get() { return this.$store.state.main.selectedCategoryId},
      set(val) { this.replaceMain({'selectedCategoryId': val})},
    },
    selectedTxIdList: {
      get() { return this.$store.state.main.selectedTxIdList},
      set(val) { this.replaceMain({'selectedTxIdList': val})},
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
    callParentComputed(method) {
      const func = Util.v(this.$parent.$options.computed, method)
      return func? func.call(this.$parent): undefined
    },
    callParentMethod(method, ...params) {
      const func = Util.v(this.$parent.$options.methods, method)
      return func? func.call(this.$parent, ...params): undefined
    },
    callParentMethodOrDef(method, def, ...params) {
      const ret = this.callParentMethod(method, ...params)
      return ret === undefined? def: ret
    },
    vueSelectCutOn(option, required){
      return VueSelectHelper.vueSelectCutOn(option, required)
    },
    vueSelectCutOnWithWidth(option, width, required){
      return VueSelectHelper.vueSelectCutOnWithWidth(option, width, required)
    },
    vueSelectTitle(selected){
      return VueSelectHelper.vueSelectTitle(selected)
    },
    closeVueSelect(){
      VueSelectHelper.closeVueSelect()
    },
    getIndividualOptions(categoryId, groupId) {
      return MasterHelper.getOptionsFromState('pot', false, true,
        pot => pot.potType == POT_TYPE.PERSON && (!categoryId || pot.categoryId == categoryId) && (!groupId || pot.groupId == groupId)
      )
    },
    defaultSortCompare(a, b, key) {
      return StringUtil.sortByString(a[key], b[key], LocaleHelper.getSystemLocale())
    },
    refreshTimer(key, time, func) { // TODO: ロジックが冗長、命名も不適切。要リファクタリング
      const now = (new Date()).getTime()
      return this.$store.state.main.timers.filter(timer => {
        if(key && timer.key == key) {
          clearTimeout(timer.id)
          return false
        }
        if(timer.start + timer.expired < now) {
          return false
        }
        return true
      })
    },
    pushTimer(key, time, func) {
      const timers = this.refreshTimer(key)
      timers.push({ key: key, id: setTimeout(func, time), start: (new Date()).getTime(), expired: time })
      this.replaceMain({ 'timers': timers })
    },
    popTimer(key) {
      const timers = this.refreshTimer(key)
      this.replaceMain({ 'timers': timers })
    },
  }
}
</script>
