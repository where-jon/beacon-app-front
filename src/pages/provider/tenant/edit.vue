<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
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
            <input type="text" tabIndex="-1" class="chromeAutoInput">
            <input type="password" tabIndex="-1" class="chromeAutoInput">
          </div>
          <div class="col mb-2">
            <label v-t="'label.password'" class="mr-3" />
            <input v-model="form.sysAdminPass" :required="requireInput(form.sysAdminLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
            <input type="text" tabIndex="-1" class="chromeAutoInput">
            <input type="password" tabIndex="-1" class="chromeAutoInput">
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
            <input type="text" tabIndex="-1" class="chromeAutoInput">
            <input type="password" tabIndex="-1" class="chromeAutoInput">
          </div>
          <div class="col mb-2">
            <label v-t="'label.password'" class="mr-3" />
            <input v-model="form.adminPass" :required="requireInput(form.adminLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
            <input type="text" tabIndex="-1" class="chromeAutoInput">
            <input type="password" tabIndex="-1" class="chromeAutoInput">
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
            <input type="text" tabIndex="-1" class="chromeAutoInput">
            <input type="password" tabIndex="-1" class="chromeAutoInput">
          </div>
          <div class="col mb-2">
            <label v-t="'label.password'" class="mr-3" />
            <input v-model="form.userPass" :required="requireInput(form.userLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
            <input type="text" tabIndex="-1" class="chromeAutoInput">
            <input type="password" tabIndex="-1" class="chromeAutoInput">
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
        <div v-if="!hasId && show" class="form-row">
          <b-form-row class="mb-5">
            <label v-t="'label.deviceOffset'" class="mr-3" />
            <input v-model="form.deviceOffset" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control" required>
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
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
          {{ label }}
        </b-button>
        <b-button v-if="isEditable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="register(true)" />
      </b-form>
    </div>

    <!-- modal -->
    <b-modal id="modalFeatureInfo" :ok-title="$i18n.tnl('label.setting')" :ok-variant="theme" :title="$i18n.tnl('label.featureSetting')" size="sm" ok-only @ok="storeFeatureInfo" @hide="resetModal">
      <feature-list :list="editFeatureList" :fields="fields" />
    </b-modal>
    <b-modal id="modalSettingInfo" :ok-title="$i18n.tnl('label.setting')" :ok-variant="theme" :title="$i18n.tnl('label.system')" ok-only @ok="storeSettingInfo" @hide="resetModal">
      <tenant-setting :params="settingParams" :multi-list="editCategorySettingList" :show-key-name="true" />
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import settingmixinVue from '../../../components/mixin/settingmixin.vue'
import featuremixinVue from '../../../components/mixin/featuremixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import featureList from '../../../components/page/featureList.vue'
import tenantSetting from '../../../components/page/tenantSetting.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { EXCLOUD_BASE_URL } from '../../../sub/constant/config'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'

export default {
  components: {
    breadcrumb,
    alert,
    featureList,
    tenantSetting,
  },
  mixins: [editmixinVue, settingmixinVue, featuremixinVue],
  data() {
    return {
      name: 'tenant',
      id: 'tenantId',
      backPath: '/provider/tenant',
      appServicePath: '/meta/tenant',
      form: ViewHelper.extract(this.$store.state.app_service.tenant, ['tenantId', 'tenantCd', 'tenantName', 'sysAdminLoginId', 'sysAdminPass', 'adminLoginId', 'adminPass', 'userLoginId', 'userPass', 'regionName', 'meshId', 'deviceOffset', 'createDt', 'delFlg']),
      items: [
        {
          text: this.$i18n.tnl('label.provider'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.tenant'),
          href: '/provider/tenant',
        },
        {
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.tenant.tenantId)),
          active: true
        }
      ],
      fields: addLabelByKey(this.$i18n, [ 
        {key: 'parentCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'subCheck', label: 'dummy', thStyle: {width:'4px !important'} },
        {key: 'featureName' },
      ]),
      settingParams: {
        name: 'setting',
        fields: [ 
          {key: 'value', type: 'valType', tooltip: 'description' },
        ],
      },
      featureList: [],
      editFeatureList: [],
      categorySettingList: {},
      editCategorySettingList: {},
      newForm: {},
      dummyKey: -1
    }
  },
  computed: {
    hasId (){
      return Util.hasValue(this.form.tenantId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    ...mapState('app_service', [
      'tenant', 'features',
    ]),
    createDt(){
      return Util.formatDate(this.form.createDt)
    }
  },
  async created(){
    await StateHelper.load('feature')
    this.featureList = this.features.map((feature) => {
      const featureIds = this.getFeatureIds(feature.featureId)
      const tenantFeature = this.tenant && this.tenant.tenantFeatureList? this.tenant.tenantFeatureList.find((val) => val.tenantFeaturePK.featureId == feature.featureId): null
      const parentFeature = featureIds.subId != 0 && this.tenant && this.tenant.tenantFeatureList? this.tenant.tenantFeatureList.find((val) => {
        const ids = this.getFeatureIds(val.tenantFeaturePK.featureId)
        return ids.parentId == featureIds.parentId && ids.subId == 0
      }): null
      return {
        ...feature,
        parentShow: featureIds.subId == 0,
        parentId: featureIds.parentId,
        subShow: featureIds.subId != 0,
        subId: featureIds.subId,
        checked: tenantFeature? true: false,
        disabled: parentFeature? true: false,
      }
    })
      .sort((a, b) => {
        if(a.featureType != b.featureType){
          return a.featureType < b.featureType? -1: 1
        }
        if(a.parentId != b.parentId){
          return a.parentId < b.parentId? -1: 1
        }
        if(a.subId != b.subId){
          return a.subId < b.subId? -1: 1
        }
        return 0
      })
    this.categorySettingList = {}
    if(this.tenant && this.tenant.settingList){
      _.forEach(this.tenant.settingList, (value, key) => {
        if(this.categorySettingList[value.category] == null){
          this.categorySettingList[value.category] = []
        }
        this.categorySettingList[value.category].push({
          ...value,
          id: value.settingId,
        })
      })
    }
    if(!this.hasId){
      this.form.sysAdminLoginId = 'sysadmin'
      this.form.adminLoginId = 'admin'
      this.form.userLoginId = 'user'
    }
  },
  methods: {
    requireInput(param){
      return Util.hasValue(param)
    },
    showFeatureEdit() {
      this.editFeatureList = this.featureList.filter((val) => val.featureType == 0).map((val) => {return {...val}})
      this.$root.$emit('bv::show::modal', 'modalFeatureInfo', null)
    },
    showSettingEdit() {
      this.editCategorySettingList = _.cloneDeep(this.categorySettingList)
      this.$root.$emit('bv::show::modal', 'modalSettingInfo', null)
    },
    storeFeatureInfo() {
      this.featureList = this.editFeatureList.map((val) => {return {...val}})
    },
    storeSettingInfo() {
      this.categorySettingList = _.cloneDeep(this.editCategorySettingList)
    },
    resetModal() {
    },
    afterCrud(){
      this.featureList.forEach((feature) => {
        feature.checked = false
        feature.disabled = false
      })
      this.categorySettingList = {}
    },
    async save() {
      let dummyKey = -1
      const tenantId = Util.hasValue(this.form.tenantId)? this.form.tenantId: dummyKey--
      const defaultConfig = JSON.parse(window.localStorage.getItem('defaultConfig'))
      const settingEntity = []
      for(let key in this.categorySettingList){
        this.categorySettingList[key].map((val) => {
          settingEntity.push({
            settingId: val.settingId,
            value: this.format(val.value, val.valType),
            key: val.key,
            valType: val.valType,
          })
        })
      }
      let entity = {
        tenantId: tenantId,
        tenantCd: this.form.tenantCd,
        tenantName: this.form.tenantName,
        delFlg: !Util.hasValue(this.form.tenantId)? 0: this.form.delFlg,
        userList: !Util.hasValue(this.form.tenantId)? [
          Util.hasValue(this.form.sysAdminLoginId)? {userId: dummyKey--, loginId: this.form.sysAdminLoginId, pass: this.form.sysAdminPass, role: { roleId: dummyKey--, roleName: 'SYS_ADMIN' }}: null,
          Util.hasValue(this.form.adminLoginId)? {userId: dummyKey--, loginId: this.form.adminLoginId, pass: this.form.adminPass, role: { roleId: dummyKey--, roleName: 'ADMIN' }}: null,
          Util.hasValue(this.form.userLoginId)? {userId: dummyKey--, loginId: this.form.userLoginId, pass: this.form.userPass, role: { roleId: dummyKey--, roleName: 'USER' }}: null,
        ].filter((val) => val): null,
        region: !Util.hasValue(this.form.tenantId)? {regionId: dummyKey--, regionName: this.form.regionName, meshId: Util.hasValue(this.form.meshId)? this.form.meshId: null, deviceOffset: this.form.deviceOffset}: null,
        defaultExcloudBaseUrl: defaultConfig.EXCLOUD_BASE_URL,
        excloudBaseUrl: EXCLOUD_BASE_URL,
        tenantFeatureList: this.featureList.map((val) => {
          return val.checked? {
            tenantFeaturePK:{tenantId: dummyKey--, featureId: val.featureId},
          }: null
        }).filter((val) => val),
        settingList: settingEntity.length != 0? settingEntity: null,
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
  .chromeAutoInput{
    position: fixed;
    width: 0px;
    height: 0px;
    top: -999px;
  }
</style>