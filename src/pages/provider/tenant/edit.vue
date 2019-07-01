<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <b-form-group>
          <b-form-row v-if="hasId">
            <label v-t="'label.tenantId'" class="control-label" />
          </b-form-row>
          <b-form-row v-if="hasId">
            <b-col sm="2">
              <b-form-input v-model="form.tenantId" type="text" readonly="readonly" />
            </b-col>
          </b-form-row>
          <b-form-row>
            <label v-t="'label.tenantCd'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <input v-model="form.tenantCd" :readonly="!isEditable" type="text" pattern="^[a-z][a-z0-9\-@]*$" maxlength="31" class="form-control" required>
            </b-col>
          </b-form-row>
          <b-form-row>
            <label v-t="'label.tenantName'" class="control-label" />
          </b-form-row>
          <b-form-row>
            <b-col sm="5">
              <input v-model="form.tenantName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
            </b-col>
          </b-form-row>
        </b-form-group>

        <b-form-group v-if="!hasId">
          <b-form-row>
            <label v-t="'label.initUser'" class="control-label" />
          </b-form-row>
        </b-form-group>
        <b-form-group v-if="!hasId">
          <b-form-row>
            <label v-t="'label.initSysAdminColumn'" class="control-label" />
          </b-form-row>
        </b-form-group>
        <div v-if="!hasId && show" class="form-row">
          <div class="col mb-2 mr-3">
            <label v-t="'label.id'" class="mr-3" />
            <input v-model="form.sysAdminLoginId" :readonly="!isEditable" type="text" minlength="3" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control" required>
            <chrome-input />
          </div>
          <div class="col mb-2">
            <label v-t="'label.password'" class="mr-3" />
            <input v-model="form.sysAdminPass" :required="requireInput(form.sysAdminLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
            <chrome-input />
          </div>
        </div>
        <b-form-group v-if="!hasId">
          <b-form-row>
            <label v-t="'label.initAdminColumn'" class="control-label" />
          </b-form-row>
        </b-form-group>
        <div v-if="!hasId && show" class="form-row">
          <div class="col mb-2 mr-3">
            <label v-t="'label.id'" class="mr-3" />
            <input v-model="form.adminLoginId" :readonly="!isEditable" type="text" :minlength="form.adminLoginId? 3: 0" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control">
            <chrome-input />
          </div>
          <div class="col mb-2">
            <label v-t="'label.password'" class="mr-3" />
            <input v-model="form.adminPass" :required="requireInput(form.adminLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
            <chrome-input />
          </div>
        </div>
        <b-form-group v-if="!hasId">
          <b-form-row>
            <label v-t="'label.initUserColumn'" class="control-label" />
          </b-form-row>
        </b-form-group>
        <div v-if="!hasId && show" class="form-row">
          <div class="col mb-2 mr-3">
            <label v-t="'label.id'" class="mr-3" />
            <input v-model="form.userLoginId" :readonly="!isEditable" type="text" :minlength="form.userLoginId? 3: 0" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control">
            <chrome-input />
          </div>
          <div class="col mb-2">
            <label v-t="'label.password'" class="mr-3" />
            <input v-model="form.userPass" :required="requireInput(form.userLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
            <chrome-input />
          </div>
        </div>

        <b-form-group v-if="!hasId" class="mt-3">
          <b-form-row>
            <label v-t="'label.initRegion'" class="control-label" />
          </b-form-row>
        </b-form-group>
        <div v-if="!hasId && show" class="form-row">
          <b-form-row class="mb-3">
            <label v-t="'label.regionName'" class="mr-3" />
            <input v-model="form.regionName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
          </b-form-row>
        </div>
        <div v-if="!hasId && show" class="form-row">
          <b-form-row class="mb-3">
            <label v-t="'label.meshId'" class="mr-3" />
            <input v-model="form.meshId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
          </b-form-row>
        </div>

        <b-form-row class="mb-2">
          <b-button v-t="'label.featureSetting'" :variant="theme" type="button" class="mr-2 my-1" @click="showFeatureEdit" />
        </b-form-row>
        <b-form-row class="mb-2">
          <b-button v-t="'label.system'" :variant="theme" type="button" class="mr-2 my-1" @click="showSettingEdit" />
        </b-form-row>

        <b-form-row class="mb-2">
          <label v-if="hasId" v-t="'label.createDt'" class="mr-2" />
          <label v-if="hasId" v-t="createDt" />
        </b-form-row>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="doBeforeSubmit(false)">
          {{ label }}
        </b-button>
        <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="doBeforeSubmit(true)" />
      </b-form>
    </div>

    <!-- modal -->
    <b-modal id="modalFeatureInfo" :ok-title="$i18n.tnl('label.setting')" :ok-variant="theme" :title="$i18n.tnl('label.featureSetting')" size="sm" ok-only @ok="storeFeatureInfo" @hide="resetModal">
      <feature-list :list="editFeatureList" :fields="fields" />
    </b-modal>
    <b-modal id="modalSettingInfo" :ok-title="$i18n.tnl('label.setting')" :ok-variant="theme" :title="$i18n.tnl('label.system')" size="lg" ok-only @ok="storeSettingInfo" @hide="resetModal">
      <b-alert :show="validationMessages" variant="danger" dismissible>
        <div v-for="(validationMessage, index) in validationMessages" :key="index">
          {{ validationMessage }}
        </div>
      </b-alert>
      <system-setting ref="systemSetting" :p-setting-list="editSettingList" :regist-func="(setting) => onRegistSubmit(setting)" />
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { EXCLOUD } from '../../../sub/constant/config'
import * as DateUtil from '../../../sub/util/DateUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as FeatureHelper from '../../../sub/helper/FeatureHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as LocalStorageHelper from '../../../sub/helper/LocalStorageHelper'
import * as SettingHelper from '../../../sub/helper/SettingHelper'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import featureList from '../../../components/page/featureList.vue'
import alert from '../../../components/parts/alert.vue'
import chromeInput from '../../../components/parts/chromeinput.vue'
import systemSetting from '../../setting/system/index.vue'

export default {
  components: {
    breadcrumb,
    featureList,
    alert,
    chromeInput,
    systemSetting,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'tenant',
      id: 'tenantId',
      backPath: '/provider/tenant',
      appServicePath: '/meta/tenant',
      items: ViewHelper.createBreadCrumbItems('provider', {text: 'tenant', href: '/provider/tenant'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.tenant.tenantId)),
      fields: ViewHelper.addLabelByKey(this.$i18n, [ 
        {key: 'parentCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'subCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'featureName', label: 'dummy'},
      ]),
      form: Util.extract(this.$store.state.app_service.tenant, ['tenantId', 'tenantCd', 'tenantName', 'sysAdminLoginId', 'sysAdminPass', 'adminLoginId', 'adminPass', 'userLoginId', 'userPass', 'regionName', 'meshId', 'createDt', 'delFlg']),
      settingParams: {
        name: 'setting',
        fields: [ 
          {key: 'value', type: 'valType', tooltip: 'description' },
        ],
      },
      validationMessages: null,
      featureList: [],
      editFeatureList: [],
      settingList: [],
      editSettingList: [],
      newForm: {},
      dummyKey: -1,
      targetTenantId: null,
      defaultCheckFeatureNames: ['positionmap', 'positionlist', 'positionstack'],
    }
  },
  computed: {
    hasId (){
      return Util.hasValue(this.form.tenantId)
    },
    ...mapState('app_service', [
      'tenant', 'features', 'settings'
    ]),
    createDt(){
      return DateUtil.formatDate(this.form.createDt)
    }
  },
  async created(){
    const currentFeatureList = this.tenant && this.tenant.tenantFeatureList? this.tenant.tenantFeatureList: []
    await StateHelper.load('feature')
    this.featureList = FeatureHelper.createFeatureTable(this.features, currentFeatureList, this.hasId, this.defaultCheckFeatureNames)
    this.settingList = this.tenant && this.tenant.settingList? this.tenant.settingList: []
    if(!this.hasId){
      this.form.sysAdminLoginId = 'sysadmin'
      this.form.adminLoginId = 'admin'
      this.form.userLoginId = 'user'
    }
  },
  methods: {
    adjustModalRect(){
      this.$nextTick(() => {
        const modalContents = document.getElementsByClassName('modal-content')
        if(!Util.hasValue(modalContents)){
          return
        }
        for(let idx = 0; idx < modalContents.length; idx++){
          if(!Util.getValue(modalContents[idx], 'attributes.aria-labelledby.value', '').match(/^modalSettingInfo.*$/)){
            continue
          }
          const marginLeft = 32
          const width = window.innerWidth - marginLeft * 2
          modalContents[idx].style.width = '' + width + 'px'
          const left = marginLeft - Util.getValue(modalContents[idx], 'parentElement.offsetLeft', 0)
          modalContents[idx].style.left = '' + left + 'px'
        }
      })
    },
    requireInput(param){
      return Util.hasValue(param)
    },
    showFeatureEdit() {
      this.editFeatureList = this.featureList.filter((val) => val.featureType == 0).map((val) => {return {...val}})
      this.$root.$emit('bv::show::modal', 'modalFeatureInfo', null)
    },
    showSettingEdit() {
      this.validationMessages = null
      this.editSettingList = _.cloneDeep(this.settingList)
      this.$forceUpdate()
      this.$nextTick(async () => {
        await this.$refs.systemSetting.fetchData()
        this.$root.$emit('bv::show::modal', 'modalSettingInfo', null)
        this.$nextTick(() => {
          window.addEventListener('resize', this.adjustModalRect)
          this.adjustModalRect()
        })
      })
    },
    storeFeatureInfo() {
      this.featureList = this.editFeatureList.map((val) => {return {...val}})
    },
    storeSettingInfo(event) {
      const parseList = this.$refs.systemSetting.parse()
      const validation = SettingHelper.validation(parseList)
      if(validation.length != 0){
        this.validationMessages = validation.map(val => this.$i18n.tnl('message.bulkInvalidFailed', {col: val.key, value: val.value}))
        event.target.scrollTop = 0
        event.preventDefault()
        return
      }
      this.validationMessages = null
      this.settingList = _.cloneDeep(parseList)
    },
    onRegistSubmit(registSetting) {
      this.$refs.systemSetting.add(registSetting)
    },
    resetModal() {
      this.$refs.systemSetting.showNewForm(false)
      window.removeEventListener('resize', this.adjustModalRect)
    },
    async applyConfig() {
      await StateHelper.load('setting', true)
      const login = LocalStorageHelper.getLogin()
      const userInfo = await AuthHelper.getUserInfo(login.tenantAdmin)
      AuthHelper.resetConfig(login.tenantAdmin, userInfo.setting)
    },
    async onSaved(){
      this.featureList.forEach((feature) => {
        feature.checked = false
        feature.disabled = false
      })
      const login = LocalStorageHelper.getLogin()
      const tenant = await HttpHelper.getAppService('/meta/tenant/currentTenant')
      login.currentTenant = tenant
      this.$store.commit('replace', login)
      LocalStorageHelper.setLocalStorage('login', JSON.stringify(login))
      if(this.targetTenantId == login.currentTenant.tenantId){
        await this.applyConfig()
      }
      this.targetTenantId = null
      this.settingList = []
    },
    async onSaving() {
      let dummyKey = -1
      const settingEntities = this.$refs.systemSetting.createSaveEntities(this.settingList)
      this.targetTenantId = Util.hasValue(this.form.tenantId)? this.form.tenantId: dummyKey--
      const defaultConfig = LocalStorageHelper.getLocalStorage('defaultConfig')
      const entity = {
        tenantId: this.targetTenantId,
        tenantCd: this.form.tenantCd,
        tenantName: this.form.tenantName,
        delFlg: !Util.hasValue(this.form.tenantId)? 0: this.form.delFlg,
        userList: !Util.hasValue(this.form.tenantId)? [
          Util.hasValue(this.form.sysAdminLoginId)? {userId: dummyKey--, loginId: this.form.sysAdminLoginId, pass: this.form.sysAdminPass, role: { roleId: dummyKey--, roleName: 'SYS_ADMIN' }}: null,
          Util.hasValue(this.form.adminLoginId)? {userId: dummyKey--, loginId: this.form.adminLoginId, pass: this.form.adminPass, role: { roleId: dummyKey--, roleName: 'ADMIN' }}: null,
          Util.hasValue(this.form.userLoginId)? {userId: dummyKey--, loginId: this.form.userLoginId, pass: this.form.userPass, role: { roleId: dummyKey--, roleName: 'USER' }}: null,
        ].filter((val) => val): null,
        region: !Util.hasValue(this.form.tenantId)? {regionId: dummyKey--, regionName: this.form.regionName, meshId: Util.hasValue(this.form.meshId)? this.form.meshId: null}: null,
        defaultExcloudBaseUrl: defaultConfig.EXCLOUD.BASE_URL,
        excloudBaseUrl: EXCLOUD.BASE_URL,
        tenantFeatureList: this.featureList.map((val) => {
          return !val.disabled && val.checked? {
            tenantFeaturePK:{tenantId: dummyKey--, featureId: val.featureId},
          }: null
        }).filter((val) => val),
      }
      if(settingEntities.length != 0){
        entity.settingList = settingEntities.map(val => ({...val, settingId: val.settingId <= 0? dummyKey--: val.settingId}))
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
  }
}
</script>

<style scoped lang="scss">
  label.control-label {
    padding-top: 7px;
  }
</style>