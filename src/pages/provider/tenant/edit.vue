<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert :show="showInfo" variant="info" dismissible>
        {{ message }}
      </b-alert>
      <b-alert :show="showAlert" variant="danger" dismissible @dismissed="showAlert=false">
        <template v-if="Array.isArray(message)">
          <span v-for="line in message" :key="line">
            {{ line }} <br>
          </span>
        </template>
        <span v-else>
          {{ message }}
        </span>
      </b-alert>

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
              <input v-model="form.tenantCd" :readonly="!isEditable" type="text" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" maxlength="31" class="form-control" required>
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
      </b-form>

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
      <b-form v-if="!hasId && show" inline @submit.prevent="onSubmit">
        <b-form-row class="mb-2 mr-3">
          <label v-t="'label.id'" class="mr-3" />
          <input v-model="form.sysAdminLoginId" :readonly="!isEditable" type="text" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control" required>
        </b-form-row>
        <b-form-row class="mb-2">
          <label v-t="'label.password'" class="mr-3" />
          <input v-model="form.sysAdminPass" :required="requireInput(form.sysAdminLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
        </b-form-row>
      </b-form>
      <b-form-group v-if="!hasId">
        <b-form-row>
          <label v-t="'label.initAdminColumn'" class="control-label" />
        </b-form-row>
      </b-form-group>
      <b-form v-if="!hasId && show" inline @submit.prevent="onSubmit">
        <b-form-row class="mb-2 mr-3">
          <label v-t="'label.id'" class="mr-3" />
          <input v-model="form.adminLoginId" :readonly="!isEditable" type="text" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control">
        </b-form-row>
        <b-form-row class="mb-2">
          <label v-t="'label.password'" class="mr-3" />
          <input v-model="form.adminPass" :required="requireInput(form.adminLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
        </b-form-row>
      </b-form>
      <b-form-group v-if="!hasId">
        <b-form-row>
          <label v-t="'label.initUserColumn'" class="control-label" />
        </b-form-row>
      </b-form-group>
      <b-form v-if="!hasId && show" inline @submit.prevent="onSubmit">
        <b-form-row class="mb-2 mr-3">
          <label v-t="'label.id'" class="mr-3" />
          <input v-model="form.userLoginId" :readonly="!isEditable" type="text" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control">
        </b-form-row>
        <b-form-row class="mb-2">
          <label v-t="'label.password'" class="mr-3" />
          <input v-model="form.userPass" :required="requireInput(form.userLoginId)" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" class="form-control">
        </b-form-row>
      </b-form>

      <b-form-group v-if="!hasId" class="mt-3">
        <b-form-row>
          <label v-t="'label.initRegion'" class="control-label" />
        </b-form-row>
      </b-form-group>
      <b-form v-if="!hasId && show" inline @submit.prevent="onSubmit">
        <b-form-row class="mb-3">
          <label v-t="'label.regionName'" class="mr-3" />
          <input v-model="form.regionName" :readonly="!isEditable" type="text" maxlength="20" class="form-control" required>
        </b-form-row>
      </b-form>
      <b-form v-if="!hasId && show" inline @submit.prevent="onSubmit">
        <b-form-row class="mb-3">
          <label v-t="'label.meshId'" class="mr-3" />
          <input v-model="form.meshId" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control">
        </b-form-row>
      </b-form>
      <b-form v-if="!hasId && show" inline @submit.prevent="onSubmit">
        <b-form-row class="mb-5">
          <label v-t="'label.deviceOffset'" class="mr-3" />
          <input v-model="form.deviceOffset" :readonly="!isEditable" type="number" min="0" max="65535" class="form-control" required>
        </b-form-row>
      </b-form>

      <b-form-row class="mb-2">
        <b-button v-t="'label.featureSetting'" :variant="theme" type="button" class="mr-2 my-1" @click="showFeatureEdit" />
      </b-form-row>

      <b-form-row class="mb-2">
        <label v-t="'label.createDt'" v-if="hasId" class="mr-2" />
        <label v-t="createDt" v-if="hasId" />
      </b-form-row>

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="register(false)">
          {{ label }}
        </b-button>
        <b-button v-t="'label.registerAgain'" v-if="isEditable && !isUpdate" :variant="theme" type="submit" class="my-1" @click="register(true)" />
      </b-form>
    </div>

    <!-- modal -->
    <b-modal id="modalInfo" :ok-title="$i18n.tnl('label.setting')" :ok-variant="theme" :title="$i18n.tnl('label.featureSetting')" ok-only @ok="storeInfo" @hide="resetModal">
      <feature-list :list="editFeatureList" :fields="fields" />
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import featureList from '../../../components/page/featureList.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { AUTH_TENANT_CD } from '../../../sub/constant/Constants'
import { EXCLOUD_BASE_URL } from '../../../sub/constant/config'
import { addLabelByKey } from '../../../sub/helper/ViewHelper'

export default {
  components: {
    breadcrumb,
    featureList,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'tenant',
      id: 'tenantId',
      backPath: '/provider/tenant',
      appServicePath: '/meta/tenant',
      form: ViewHelper.extract(this.$store.state.app_service.tenant, ['tenantId', 'tenantCd', 'tenantName', 'sysAdminLoginId', 'sysAdminPass', 'adminLoginId', 'adminPass', 'userLoginId', 'userPass', 'regionName', 'meshId', 'deviceOffset', 'createDt']),
      items: [
        {
          text: this.$i18n.tnl('label.master'),
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
        {key: 'path' },
      ]),
      featureList: [],
      editFeatureList: [],
      init: true,
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
      return {
        parentShow: featureIds.subId == 0,
        parentId: featureIds.parentId,
        subShow: featureIds.subId != 0,
        subId: featureIds.subId,
        checked: false,
        disabled: false,
        ...feature,
      }
    }).sort((a, b) => {
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
  },
  beforeUpdate() {
    if(this.init){
      this.form.sysAdminId = ''
      this.form.sysAdminPass = ''
      this.form.adminId = ''
      this.form.adminPass = ''
      this.form.userId = ''
      this.form.userPass = ''
      this.init = false
    }
  },
  methods: {
    requireInput(param){
      return Util.hasValue(param)
    },
    showFeatureEdit() {
      this.editFeatureList = this.featureList.map((val) => {return {...val}})
      this.$root.$emit('bv::show::modal', 'modalInfo', null)
    },
    storeInfo() {
      this.featureList = this.editFeatureList.map((val) => {return {...val}})
    },
    resetModal() {
    },
    getFeatureIds(featureId){
      const featureIdStr = String(featureId)
      const featureIdDigit = featureIdStr.length % 2 == 0? 2: 1
      return {
        parentId: featureIdStr.length <= 6? Number(featureIdStr.slice(0, featureIdDigit)): featureId,
        subId: featureIdStr.length <= 6? Number(featureIdStr.substring(featureIdDigit)): 0,
      }
    },
    async save() {
      let dummyKey = -1
      const tenantId = Util.hasValue(this.form.tenantId)? this.form.tenantId: dummyKey--
      let entity = {
        tenantId: tenantId,
        tenantCd: this.form.tenantCd,
        tenantCdAuth: !AUTH_TENANT_CD.includes(this.form.tenantCd),
        tenantName: this.form.tenantName,
        roleList: !Util.hasValue(this.form.tenantId)? [
          { roleId: dummyKey--, roleName: 'SYS_ADMIN' },
          { roleId: dummyKey--, roleName: 'ADMIN' },
          { roleId: dummyKey--, roleName: 'USER' },
        ]: null,
        userList: !Util.hasValue(this.form.tenantId)? [
          Util.hasValue(this.form.sysAdminLoginId)? {userId: dummyKey--, loginId: this.form.sysAdminLoginId, pass: this.form.sysAdminPass, role: { roleId: dummyKey--, roleName: 'SYS_ADMIN' }}: null,
          Util.hasValue(this.form.adminLoginId)? {userId: dummyKey--, loginId: this.form.adminLoginId, pass: this.form.adminPass, role: { roleId: dummyKey--, roleName: 'ADMIN' }}: null,
          Util.hasValue(this.form.userLoginId)? {userId: dummyKey--, loginId: this.form.userLoginId, pass: this.form.userPass, role: { roleId: dummyKey--, roleName: 'USER' }}: null,
        ].filter((val) => val): null,
        region: !Util.hasValue(this.form.tenantId)? {regionId: dummyKey--, regionName: this.form.regionName, meshId: Util.hasValue(this.form.meshId)? this.form.meshId: null, deviceOffset: this.form.deviceOffset}: null,
        excloudBaseUrl: !Util.hasValue(this.form.tenantId)? EXCLOUD_BASE_URL: null,
        tenantFeatureList: this.featureList.map((val) => {
          return val.checked? {
            tenantFeaturePK:{tenantId: dummyKey--, featureId: val.featureId},
          }: null
        }).filter((val) => val),
      }
      this.init = true
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