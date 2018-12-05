<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">

      <b-alert variant="info" dismissible :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">
        <div v-html="message" />
      </b-alert>

      <b-form @submit.prevent="onSubmit" v-if="show">
        <b-form-group v-if="hasId">
          <label v-t="'label.userId'" />
          <b-form-input type="text" v-model="form.userId" readonly="readonly" />
        </b-form-group>
        <b-form-group v-show="showName">
          <label v-t="'label.name'" />
          <input type="text" v-model="form.name" maxlength="20" class="form-control" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.loginId'" />
          <input type="text" v-model="form.loginId" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" class="form-control" :title="$i18n.tnl('message.validationList', {validate: $i18n.tnl('message.loginValidationList')})" required :readonly="!isEditable || aboveSuperUser" />
        </b-form-group>
        <b-form-group v-show="showEmail">
          <label v-t="'label.email'" />
          <b-form-input type="email" v-model="form.email" maxlength="255" :readonly="!isEditable" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.role'" />
          <b-form-select v-model="role" :options="roleOptions" required :disabled="!isEditable || aboveSuperUser" ></b-form-select>
        </b-form-group>
        <b-form-group>
          <label v-t="'label.description'" />
          <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" maxlength="1000" :readonly="!isEditable" ></b-form-textarea>
        </b-form-group>
        <b-form-group>
          <label v-if="hasId" v-t="'label.passwordUpdate'" />
          <label v-else v-t="'label.password'" />
          <b-form-input type="password" v-model="pass" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" :readonly="!isEditable || aboveSuperUser" />
        </b-form-group>
        <b-form-group>
          <label v-t="'label.passwordConfirm'" />
          <b-form-input type="password" v-model="passConfirm" pattern="^[a-zA-Z0-9_\-\/!#\$%&@]*$" :readonly="!isEditable || aboveSuperUser" />
        </b-form-group>

        <b-button type="button" variant="outline-danger" @click="backToList" class="mr-2 my-1" v-t="'label.back'"/>
        <b-button v-if="isEditable" type="submit" :variant="theme" @click="beforeSubmit($event, false)" class="mr-2 my-1">{{ label }}</b-button>
        <b-button v-if="isEditable && !isUpdate" type="submit" :variant="theme" @click="beforeSubmit($event, true)" class="my-1" v-t="'label.registerAgain'"/>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import * as StateHelper from '../../../sub/helper/StateHelper'
import _ from 'lodash'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import { APP } from '../../../sub/constant/config.js'
import { ROLE } from '../../../sub/constant/Constants'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      form: ViewHelper.extract(this.$store.state.app_service.user, ["userId", "loginId", "name", "email", "roleId", "description"]),
      roleOptions: [],
      role: null,
      aboveSuperUser: false,
      pass: null,
      passConfirm: null,
      passMinLength: 3,
      passMaxLength: 16,
      selfUpdate: this.$store.state.loginId == this.$store.state.app_service.user.loginId,
      items: [
        {
          text: this.$i18n.tnl('label.master'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.user'),
          href: '/master/user',
        },
        {
          text: this.$i18n.tnl('label.user') + this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.user.userId)),
          active: true
        }
      ],
    }
  },
  async created(){
    await StateHelper.load('role')
    this.roleOptions = this.roles.map((val) => ({text: val.roleName, value: val.roleId}))
    if(!this.isSuperEditable){
      const superAdmin = this.roles.find((val) => val.roleName == ROLE.SUPER_ADMIN)
      this.roleOptions = this.roleOptions.filter((val) => superAdmin? val.value != superAdmin.roleId || this.form.roleId == superAdmin.roleId: true)
    }
    this.role = this.form.roleId
    const userRole = this.roles.find((role) => role.roleId == this.user.roleId)
    if(userRole){
      this.aboveSuperUser = StateHelper.isAboveSuperUser(userRole.roleName)
    }
  },
  computed: {
    hasId(){
      return Util.hasValue(this.form.userId)
    },
    theme () {
      const theme = getButtonTheme()
      return 'outline-' + theme
    },
    showEmail() {
      return APP.USER_WITH_EMAIL
    },
    showName() {
      return APP.USER_WITH_NAME
    },
    ...mapState('app_service', [
      'user', 'roles'
    ]),
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
    afterCrud(){
      this.role = null
      this.pass = null
      this.passConfirm = null

      if(this.selfUpdate && Util.hasValue(this.form.pass)){
        AuthHelper.authByAppService(
          this.form.loginId,
          this.form.pass
        )
      }
    },
    beforeSubmit(event, again){
      this.showInfo = false
      this.showAlert = false
      if(this.isErrorPasswordRequired()){
        this.message = this.$i18n.tnl('message.required', {target: this.$i18n.tnl('label.password')})
        this.showAlert = true
      }
      else if(this.isErrorPasswordLength()){
        this.message = this.$i18n.tnl('message.lengthRange', {
          target: this.$i18n.tnl('label.password'),
          min: this.passMinLength,
          max: this.passMaxLength,
        })
        this.showAlert = true
      }
      else if(this.isErrorPasswordValue()){
        this.message = this.$i18n.tnl(this.hasId? 'message.notMatchPassword': 'message.notMatchPasswordRegist')
        this.showAlert = true
      }
      if(this.showAlert){
        window.scrollTo(0, 0)
        event.preventDefault()
        return false
      }
      this.form.userId = Util.hasValue(this.form.userId) ? String(this.form.userId) : null
      this.form.roleId = String(this.role)
      this.form.pass = this.pass
      this.register(again)
    }
  },
}
</script>

<style scoped lang="scss">

</style>