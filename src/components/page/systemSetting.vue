
<template>
  <div class="container-fluid">
    <breadcrumb v-if="!callee" :items="breadcrumbItems" />
    <auto-alert browser-size />
    <alert v-if="!callee" :message="message" />
    <div class="container">
      <m-list ref="mList" :params="params" :list="settingList" :per-page="settingList.length" :use-pagenation="false" :alert-force-hide="true" max-filter-length="40" />
      <b-form id="updateForm" @submit.prevent="onUpdateSubmit" class="mb-3">
        <b-button v-if="!callee && isEditable && !isShowNewForm" v-t="'label.update'" :variant="theme" type="submit" class="ml-2" @click="doBeforeSubmit(true)" />
        <b-button v-if="isRegistable && !isShowNewForm && useRegistForm" v-t="'label.addForm'" :variant="theme" type="button" class="float-right" @click="showNewForm(true)" />
      </b-form>
      <!-- new form -->
      <div v-if="isShowNewForm && useRegistForm"> 
        <div class="card shadow-sm mt-5 mb-3">
          <label v-t="'label.addSetting'" class="card-header" />
          <div class="card-body">
            <b-form-row class="mb-3">
              <div class="error-row">
                <label v-show="hasSameKey()" class="error">
                  {{ getDuplicationMessage() }}
                </label>
              </div>
            </b-form-row>
            <b-form-row class="mb-2">
              <b-col cols="2">
                <label v-t="'label.key'" class="mr-2" />
              </b-col>
              <b-col>
                <input v-model="newForm.key" type="text" :maxlength="200" class="form-control form-control-sm" form="registForm" :required="isShowNewForm" @keyup="$forceUpdate()" @input="newFormEvent">
              </b-col>
            </b-form-row>
            <b-form-row class="mb-2">
              <b-col cols="2">
                <label v-t="'label.valType'" class="mr-2" />
              </b-col>
              <b-col>
                <b-form-select v-model="newForm.valType" :options="valTypeOptions" form="registForm" :required="isShowNewForm" @change="changeValType($event)" />
              </b-col>
            </b-form-row>
            <b-form-row class="mb-2">
              <b-col cols="2">
                <label v-t="'label.value'" class="mr-2" />
              </b-col>
              <b-col>
                <settinginput :input-model="newForm" input-key="value" :input-type="newForm.valType" :options="booleanOptions" :req="isShowNewForm" form-id="registForm" />
              </b-col>
            </b-form-row>
            <b-form id="registForm" class="mt-3" @submit.prevent="onRegistSubmit">
              <b-form-row class="float-right mt-3">
                <b-button v-t="'label.add'" :variant="theme" type="submit" :disabled="hasSameKey()" @click="doBeforeSubmit(true)" />
                <b-button v-t="'label.cancel'" type="button" variant="outline-danger" class="ml-2" @click="showNewForm(false)" />
              </b-form-row>
            </b-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { SETTING, BOOLEAN } from '../../sub/constant/Constants'
import * as DateUtil from '../../sub/util/DateUtil'
import * as Util from '../../sub/util/Util'
import * as AppServiceHelper from '../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import * as SettingHelper from '../../sub/helper/domain/SettingHelper'
import * as StateHelper from '../../sub/helper/dataproc/StateHelper'
import * as ValidateHelper from '../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../sub/helper/ui/ViewHelper'
import breadcrumb from '../layout/breadcrumb.vue'
import commonmixin from '../mixin/commonmixin.vue'
import editmixin from '../mixin/editmixin.vue'
import mList from './list.vue'
import alert from '../parts/alert.vue'
import autoAlert from '../parts/autoAlert.vue'
import settinginput from '../parts/settinginput.vue'

export default {
  components: {
    breadcrumb,
    mList, 
    alert,
    autoAlert,
    settinginput,
  },
  mixins: [commonmixin, editmixin],
  props: {
    pBreadcrumbItems: {
      type: Array,
      default: () => ['setting', 'system'],
    },
    pSettingList: {
      type: Array,
      default: null,
    },
    registFunc: {
      type: Function,
      default: null,
    },
    useRegistForm: {
      type: Boolean,
      default: false,
    },
    useKeyCategoryFilter: {
      type: Boolean,
      default: false,
    },
    useSettingCategoryFilter: {
      type: Boolean,
      default: false,
    },
    useInitFilter: {
      type: Boolean,
      default: false,
    },
    pagePath: {
      type: String,
      default: '/setting/system',
    },
  },
  data () {
    return {
      params: {
        id: 'settingId',
        fields: ViewHelper.addLabelByKey(this.$i18n, [ 
          {key: 'key' },
          {key: 'keyName' },
          {key: 'valTypeDisp', label: 'valType' },
          {key: 'defaultVal' },
          {key: 'value' },
          {key: 'clear', label: 'actions', thStyle: {width:'105px !important'} }
        ]),
        initTotalRows: this.totalRows,
        formId: 'updateForm',
        allShowFilter: !this.useSettingCategoryFilter,
        disableTableButtons: true,
        addFilterFields: ['title', 'inputData'],
        allDispFields: ['title', 'defaultVal'],
        extraFilter: [this.useKeyCategoryFilter? 'keyCategory': null, this.useSettingCategoryFilter? 'settingCategory': null].filter(val => val),
        tableDescription: 'settingDescription',
      },
      name: 'setting',
      id: 'settingId',
      appServicePath: '/meta/setting',
      backPath: this.pagePath,
      featurePath: this.pagePath,
      items: ViewHelper.createBreadCrumbItems(...this.pBreadcrumbItems),
      newForm: {key: '', valType: null, value: null},
      settingList: [],
      oldSettingEntities: [],
      isShowNewForm: false,
      setting: {settingId: 1},
    }
  },
  computed: {
    ...mapState('app_service', [
      'settings',
    ]),
    totalRows(){
      return this.settingList.length
    },
    valTypeOptions() {
      return SETTING.getOptions()
    },
    breadcrumbItems() {
      return ViewHelper.createBreadCrumbItems(...this.pBreadcrumbItems)
    },
    booleanOptions() {
      return BOOLEAN.getOptions(false)
    },
    callee() {
      return this.pSettingList != null
    },
  },
  mounted(){
    this.initNewForm(true)
    ValidateHelper.setCustomValidationMessage()
  },
  methods: {
    add(setting){
      return this.settingList.push(this.addInputData(setting))
    },
    parse(){
      this.settingList.forEach(setting => this.mergeInputData(setting))
      return this.settingList.filter(setting => Util.hasValue(setting.settingId) || Util.hasValue(setting.value))
    },
    hasSameKey(){
      return this.settingList.find(val => val.key == this.newForm.key)? true: false
    },
    addInputData(setting){
      setting.inputData = {value: setting.value}
      return setting
    },
    mergeInputData(setting){
      setting.value = Util.getValue(setting, 'inputData.value')
      return setting
    },
    getDuplicationMessage(){
      return this.$i18n.tnl('message.bulkUniqueFailed', {col: this.$i18n.tnl('label.key'), value: this.newForm.key})
    },
    newFormEvent(event){
      if(this.newForm && this.newForm.key && this.newForm.key.replace){
        this.newForm.key = this.newForm.key.replace(/\s/g, '')
      }
    },
    async fetchData(updateOldSettings = true) {
      try {
        this.showProgress()
        if(!this.calee){
          await StateHelper.load('setting')
        }
        if(updateOldSettings){
          this.oldSettingEntities = this.callee? _.cloneDeep(this.pSettingList): this.settings
        }
        this.settingList = SettingHelper.createSettingList(this.callee? this.pSettingList: this.settings, this.callee)
        if(this.useSettingCategoryFilter) {
          this.settingList = this.settingList.filter(setting => setting.isParent || setting.category != null)
        }
        this.settingList.forEach(setting => this.addInputData(setting))
        this.initFilter()
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    initFilter(){
      const noData = this[this.callee? 'pSettingList': 'settingList'].find(setting => Util.hasValue(setting.settingId))? false: true
      this.$refs.mList.filter.allShow = noData
      this.$refs.mList.filter.reg = noData && this.useInitFilter? this.$i18n.tnl('label.favoriteMark'): ''
    },
    formatList(str, formatFunc){
      return str.split(',').filter(val => val.trim().length != 0).map(val => formatFunc(val.trim())).join(',')
    },
    formatNumberList(str){
      return this.formatList(str, val => Number(val))
    },
    formatStringList(str){
      return this.formatList(str, val => val)
    },
    format(setting){
      if(setting.valType == SETTING.NUMBER){
        return Number(setting.value)
      }
      if(setting.valType == SETTING.STRING_LIST){
        return this.formatStringList(setting.value)
      }
      if(setting.valType == SETTING.NUMBER_LIST){
        return this.formatNumberList(setting.value)
      }
      return setting.value
    },
    async applyConfig() {
      await StateHelper.load('setting', true)
      const login = LocalStorageHelper.getLogin()
      const userInfo = await AuthHelper.getUserInfo(login.tenantAdmin)
      AuthHelper.resetConfig(login.tenantAdmin, userInfo.setting)
    },
    async onSaved() {
      await this.applyConfig()
      await AuthHelper.storeMagicNumberList()
      this.showNewForm(false)
    },
    async onBeforeReload(){
      await this.fetchData()
    },
    onUpdateSubmit(evt){
      if(!this.callee){
        this.save(evt)
        return
      }
    },
    createSaveEntities(updateSettings){
      const entity = []
      this.parse(updateSettings).forEach((setting, index) => {
        if(setting.isParent){
          return
        }
        this.mergeInputData(setting)
        entity.push({
          ...setting,
          settingId: Util.hasValue(setting.settingId)? setting.settingId: -1 * (index + 1),
          value: Util.hasValue(setting.value)? this.format(setting): null,
          delFlg: Util.hasValue(setting.value)? 0: 1
        })
      })
      return SettingHelper.getDiffSettingList(this.oldSettingEntities, entity)
    },
    typeValidation(entities){
      const validation = SettingHelper.validation(entities)
      if(validation.length != 0){
        throw { bulkError: validation.map(val => ({ type: 'Invalid', col: val.key, value: val.value })) }
      }
    },
    async onSaving() {
      const registEntity = this.createRegistEntity()
      if(registEntity){
        this.typeValidation([registEntity])
        this.showNewForm(false)
        return await AppServiceHelper.bulkSave(this.appServicePath, [registEntity])
      }
      const entity = this.createSaveEntities(this.settingList)
      this.typeValidation(this.settingList)
      return await AppServiceHelper.bulkSave(this.appServicePath, entity)
    },
    initNewForm(allInit){
      if(allInit){
        this.$set(this, 'newForm', {})
        this.$set(this.newForm, 'valType', this.valTypeOptions[0].value)
      }
      this.$set(this.newForm, 'key', null)
      this.$set(this.newForm, 'value', null)
    },
    showNewForm(show){
      this.isShowNewForm = show
      this.initNewForm(true)
    },
    getItem(item){
      return item.inputData
    },
    clearAction(item){
      this.getItem(item).value = null
    },
    getInitValue(valType) {
      if(valType == SETTING.BOOLEAN) {
        return this.booleanOptions[0].value
      }
      if(valType == SETTING.DATE) {
        return DateUtil.formatDate(Date.now(), 'YYYY-MM-DD')
      }
      if(valType == SETTING.DATETIME) {
        return Date.now().toString()
      }
      if(valType == SETTING.TIME) {
        return DateUtil.formatDate(Date.now(), 'HH:mm:ss')
      }
      return null
    },
    changeValType(event){
      this.newForm.valType = event
      this.newForm.value = this.getInitValue(event)
      this.$forceUpdate()
    },
    createRegistEntity(addSettingId = true) {
      if(!Util.hasValue(this.newForm.key) || !Util.hasValue(this.newForm.valType) || !Util.hasValue(this.newForm.value)){
        return null
      }
      const ret = SettingHelper.createSetting(this.newForm, {value: this.format(this.newForm)})
      if(addSettingId){
        ret.settingId = -1
      }
      return ret
    },
    onRegistSubmit(evt){
      if(!this.callee){
        this.save(evt)
        return
      }
      if(this.registFunc){
        const registEntity = this.createRegistEntity(false)
        this.registFunc(registEntity)
        this.showNewForm(false)
      }
    },
  }
}
</script>

<style scoped lang="scss">
  div.error-row {
    display: block;
    height: 1em;
  }

  label.error {
    color: #dc3545;
  }
</style>
