
<template>
  <div class="container-fluid">
    <breadcrumb v-if="!callee" :items="items" />
    <alert v-if="!callee" :message="message" />
    <div class="container">
      <m-list ref="mList" :params="params" :list="settingList" :per-page="settingList.length" :use-pagenation="false" :alert-force-hide="true" max-filter-length="40" />
      <b-form id="updateForm" @submit.prevent="onUpdateSubmit">
        <b-button v-if="!callee && !isShowNewForm" v-t="'label.update'" :variant="theme" type="submit" class="ml-2" @click="doBeforeSubmit(true)" />
        <b-button v-if="isRegistable && !isShowNewForm" v-t="'label.addForm'" :variant="theme" type="button" class="float-right" @click="showNewForm(true)" />
      </b-form>
      <!-- new form -->
      <div v-if="isShowNewForm"> 
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
                <input v-model="newForm.key" type="text" :maxlength="200" class="form-control form-control-sm" form="registForm" :required="isShowNewForm" @keydown="$forceUpdate()" @input="newFormEvent">
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
import { SETTING, BOOLEAN } from '../../../sub/constant/Constants'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as LocalStorageHelper from '../../../sub/helper/LocalStorageHelper'
import * as SettingHelper from '../../../sub/helper/SettingHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ValidateHelper from '../../../sub/helper/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import mList from '../../../components/page/list.vue'
import alert from '../../../components/parts/alert.vue'
import settinginput from '../../../components/parts/settinginput.vue'

export default {
  components: {
    breadcrumb,
    mList, 
    alert,
    settinginput,
  },
  mixins: [commonmixin, editmixin],
  props: {
    pSettingList: {
      type: Array,
      default: null,
    },
    registFunc: {
      type: Function,
      default: null,
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
          {key: 'clear', label: 'actions', thStyle: {width:'80px !important'} }
        ]),
        initTotalRows: this.totalRows,
        formId: 'updateForm',
        allShowFilter: true,
        disableTableButtons: true,
        addFilterFields: ['title'],
        allDispFields: ['title', 'defaultVal'],
        extraFilter: ['settingCategory'],
        tableDescription: 'settingDescription',
      },
      name: 'setting',
      id: 'settingId',
      appServicePath: '/meta/setting',
      backPath: '/setting/system',
      featurePath: '/setting/system',
      items: ViewHelper.createBreadCrumbItems('setting', 'system'),
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
      return this.settingList.push(setting)
    },
    parse(){
      return this.settingList.filter(setting => Util.hasValue(setting.settingId) || Util.hasValue(setting.value))
    },
    hasSameKey(){
      return this.settingList.find(val => val.key == this.newForm.key)? true: false
    },
    getDuplicationMessage(){
      return this.$i18n.tnl('message.bulkUniqueFailed', {col: this.$i18n.tnl('label.key'), value: this.newForm.key})
    },
    newFormEvent(event){
      if(this.newForm && this.newForm.key && this.newForm.key.replace){
        this.newForm.key = this.newForm.key.replace(/\s/g, '')
      }
    },
    async fetchData() {
      try {
        this.showProgress()
        if(!this.calee){
          await StateHelper.load('setting')
        }
        this.oldSettingEntities = this.callee? this.pSettingList: this.settings
        this.settingList = SettingHelper.createSettingList(this.callee? this.pSettingList: this.settings, this.callee)
        this.initFilter()
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    initFilter(){
      const noData = this[this.callee? 'pSettingList': 'settings'].find(setting => Util.hasValue(setting.settingId))? false: true
      this.$refs.mList.filter.allShow = noData
      this.$refs.mList.filter.reg = noData? this.$i18n.tnl('label.favoriteMark'): ''
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
        return await AppServiceHelper.bulkSave(this.appServicePath, [registEntity])
      }
      const entity = this.createSaveEntities(this.settingList)
      this.typeValidation(this.settingList)
      return await AppServiceHelper.bulkSave(this.appServicePath, entity)
    },
    initNewForm(allInit){
      if(allInit){
        this.newForm = {}
        this.newForm.valType = this.valTypeOptions[0].value
      }
      this.newForm.key = null
      this.newForm.value = null
    },
    showNewForm(show){
      this.isShowNewForm = show
      this.initNewForm(true)
    },
    getItem(key){
      const target = this.settingList.find(setting => setting.key == key)
      return target? target: {}
    },
    clearAction(key){
      this.getItem(key).value = null
    },
    changeValType(event){
      this.newForm.valType = event
      this.newForm.value = event == SETTING.BOOLEAN? this.booleanOptions[0].value: null
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
