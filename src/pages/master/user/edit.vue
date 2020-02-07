<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="save">
        <chrome-input />
        <b-form-group v-show="showName">
          <label v-t="'label.name'" />
          <input v-model="form.name" :readonly="!isEditable" type="text" maxlength="20" class="form-control">
        </b-form-group>
        <b-form-group>
          <label v-t="'label.loginId'" />
          <input v-model="form.loginId" :title="$i18n.tnl('message.validationList', {validate: $i18n.tnl('message.loginValidationList')})" :readonly="!isEditable" type="text" minlength="3" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control" required>
        </b-form-group>
        <b-form-group v-show="showEmail">
          <label v-t="'label.email'" />
          <b-form-input v-model="form.email" :readonly="!isEditable" type="email" maxlength="255" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.role'" />
          <v-select v-model="vueSelected.role" :options="roleOptions" :disabled="!isEditable" :clearable="false" class="mb-3 vue-options-lg">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group v-show="showRegion">
          <label v-t="'label.region'" />
          <v-select v-model="vueSelected.regions" :options="regionOptions" :disabled="!isEditable" multiple :close-on-select="false" class="vue-options-multi">
            <template slot="no-options">
              {{ vueSelectNoMatchingOptions }}
            </template>
          </v-select>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" maxlength="1000" />
        </b-form-group>
        <b-form-group>
          <label v-if="hasId" v-t="'label.passwordUpdate'" />
          <label v-else v-t="'label.password'" />
          <b-form-input v-model="pass" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.passwordConfirm'" />
          <b-form-input v-model="passConfirm" :readonly="!isEditable" type="password" maxlength="16" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" />
        </b-form-group>

        <b-button v-t="'label.back'" type="button" variant="outline-danger" class="mr-2 my-1" @click="backToList" />
        <b-button v-if="isEditable" :variant="theme" type="submit" class="mr-2 my-1" @click="beforeSubmit($event, false)">
          {{ $i18n.tnl(`label.${isUpdate? 'update': 'register'}`) }}
        </b-button>
        <b-button v-if="isRegistable && !isUpdate" v-t="'label.registerAgain'" :variant="theme" type="submit" class="my-1" @click="beforeSubmit($event, true)" />
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { APP } from '../../../sub/constant/config'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import * as StateHelper from '../../../sub/helper/dataproc/StateHelper'
import * as MasterHelper from '../../../sub/helper/domain/MasterHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import * as VueSelectHelper from '../../../sub/helper/ui/VueSelectHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'
import chromeInput from '../../../components/parts/chromeinput.vue'

export default {
  components: {
    breadcrumb,
    alert,
    chromeInput,
  },
  mixins: [commonmixin, editmixin],
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      items: ViewHelper.createBreadCrumbItems('master', {text: 'user', href: '/master/user'}, ViewHelper.getDetailCaptionKey(this.$store.state.app_service.user.userId)),
      form: Util.extract(this.$store.state.app_service.user, ['userId', 'loginId', 'name', 'email', 'roleId', 'userRegionList', 'description']),
      vueSelected: {
        role: null,
        regions: [],
      },
      roleOptions: [],
      role: null,
      pass: null,
      passConfirm: null,
      passMinLength: 3,
      passMaxLength: 16,
      selfUpdate: this.$store.state.loginId == this.$store.state.app_service.user.loginId,
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.userId)
    },
    showEmail() {
      return ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'email')
    },
    showName() {
      return ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'name')
    },
    showRegion() {
      return ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'region')
    },
    ...mapState('app_service', [
      'user', 'roles', 'regions'
    ]),
    ...mapState([
      'showAlert'
    ]),
    regionOptions() {
      return MasterHelper.getOptionsFromState('region', false, true)
    },
  },
  watch: {
    'vueSelected.regions': {
      handler: function(newVal, oldVal){
        this.form.userRegionList = newVal.map(val => ({userRegionPK: {regionId: val.value}}))
      },
      deep: true,
    },
    'vueSelected.role': {
      handler: function(newVal, oldVal){
        this.role = Util.getValue(newVal, 'value', null)
      },
      deep: true,
    },
  },
  async created(){
    // await Promise.all(['region', 'role'].map(StateHelper.load))
    this.roleOptions = MasterHelper.getOptionsFromState('role', false, true)
    this.vueSelected.role = VueSelectHelper.getVueSelectData(this.roleOptions, Util.getValue(this.form, 'roleId', this.roleOptions.reduce((prev, cur) => cur).value))
    if(Util.hasValue(this.form.userRegionList)){
      this.vueSelected.regions = this.form.userRegionList.map(userRegion => VueSelectHelper.getVueSelectData(this.regionOptions, userRegion.userRegionPK.regionId)).sort((a, b) => a.label < b.label? -1: 1)
    }
  },
  mounted(){
    ValidateHelper.setCustomValidationMessage()
    VueSelectHelper.disabledAllSubmit()
  },
  methods: {
    isErrorPasswordRequired(){
      if(Util.hasValue(this.form.userId)){
        return false
      }
      if(Util.hasValue(this.pass)){
        return false
      }
      return true
    },
    isErrorPasswordLength(){
      if(!Util.hasValue(this.pass)){
        return false
      }
      if(this.passMinLength <= this.pass.length && this.pass.length <= this.passMaxLength){
        return false
      }
      return true
    },
    isErrorPasswordValue(){
      if(Util.hasValue(this.form.userId)){
        if(!Util.hasValue(this.pass) && !Util.hasValue(this.passConfirm)){
          return false
        }
      }
      if(this.pass === this.passConfirm){
        return false
      }
      return true
    },
    async onSaved(){
      this.role = null
      this.pass = null
      this.passConfirm = null
      if(this.selfUpdate){
        const authPass = Util.hasValue(this.form.pass)? this.form.pass: this.$store.state.pass
        await AuthHelper.authByAppService(
          this.form.loginId,
          authPass,
          () => {
            this.replace({pass: authPass})
          }
        )
      }
      // StateHelper.setForceFetch('pot', true)
      await MasterHelper.loadMaster()
    },
    onBeforeReload(){
      this.vueSelected.role = VueSelectHelper.getVueSelectData(this.roleOptions, this.roleOptions.reduce((prev, cur) => cur).value)
      this.vueSelected.regions = []
    },
    async onSaving() {
      let dummyKey = -1
      const entity = {
        userId: Util.hasValue(this.form.userId) ? this.form.userId : dummyKey--,
        name: this.form.name,
        loginId: this.form.loginId,
        email: this.form.email,
        roleId: this.role,
        description: this.form.description,
        pass: this.pass,
        userRegionList: [],
      }
      if(Util.hasValue(this.form.userRegionList)){
        entity.userRegionList = this.form.userRegionList.map(userRegion => ({
          userRegionPK: {userId: dummyKey--, regionId: userRegion.userRegionPK.regionId}
        }))
      }
      return await AppServiceHelper.bulkSave(this.appServicePath, [entity])
    },
    beforeSubmit(event, again){
      this.replace({showAlert: false})
      this.replace({showInfo: false})
      if(this.isErrorPasswordRequired()){
        this.message = this.$i18n.tnl('message.required', {target: this.$i18n.tnl('label.password')})
        this.replace({showAlert: true})
      }
      else if(this.isErrorPasswordLength()){
        this.message = this.$i18n.tnl('message.lengthRange', {
          target: this.$i18n.tnl('label.password'),
          min: this.passMinLength,
          max: this.passMaxLength,
        })
        this.replace({showAlert: true})
      }
      else if(this.isErrorPasswordValue()){
        this.message = this.$i18n.tnl(this.hasId? 'message.notMatchPassword': 'message.notMatchPasswordRegist')
        this.replace({showAlert: true})
      }
      if(this.showAlert){
        window.scrollTo(0, 0)
        event.preventDefault()
        return false
      }
      this.doBeforeSubmit(again)
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/vue.scss";
</style>