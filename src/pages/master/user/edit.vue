<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="message" />

      <b-form v-if="show" @submit.prevent="onSubmit">
        <b-form-group v-if="hasId">
          <label v-t="'label.userId'" />
          <b-form-input v-model="form.userId" type="text" readonly="readonly" />
        </b-form-group>
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
          <b-form-select v-model="role" :options="roleOptions" :disabled="!isEditable" required />
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
import * as StateHelper from '../../../sub/helper/StateHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import { APP } from '../../../sub/constant/config.js'
import editmixinVue from '../../../components/mixin/editmixin.vue'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'
import * as Util from '../../../sub/util/Util'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import alert from '../../../components/parts/alert.vue'
import { getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    alert,
  },
  mixins: [editmixinVue],
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      form: ViewHelper.extract(this.$store.state.app_service.user, ['userId', 'loginId', 'name', 'email', 'roleId', 'description']),
      roleOptions: [],
      role: null,
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
          text: this.$i18n.tnl(Util.getDetailCaptionKey(this.$store.state.app_service.user.userId)),
          active: true
        }
      ],
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
    ...mapState([
      'showAlert'
    ]),
  },
  async created(){
    await StateHelper.load('role')
    this.roleOptions = StateHelper.getOptionsFromState('role', false, true)
    this.role = this.form.roleId
  },
  mounted(){
    HtmlUtil.setCustomValidationMessage()
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
    async afterCrud(){
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