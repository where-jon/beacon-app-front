<template>
  <div class="container">

    <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
    <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>

    <b-form @submit="onSubmit" v-if="show">
      <b-form-group v-if="form.userId !== undefined">
        <label v-t="'label.userId'" />
        <b-form-input type="text" v-model="form.userId" readonly="readonly" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.name'" />
        <b-form-input type="text" v-model="form.name" maxlength="20" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.loginId'" />
        <b-form-input type="text" v-model="form.loginId" maxlength="16" pattern="^[a-zA-Z][a-zA-Z0-9_\-@\.]*$" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.email'" />
        <b-form-input type="email" v-model="form.email" maxlength="255" required :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.role'" />
        <b-form-select v-model="selectOption" :options="roleOptions" required ></b-form-select>
      </b-form-group>
      <b-form-group>
        <label v-t="'label.description'" />
        <b-form-textarea v-model="form.description" :rows="3" :max-rows="6" :readonly="!isEditable" ></b-form-textarea>
      </b-form-group>
      <b-form-group>
        <label v-t="'label.password'" />
        <b-form-input type="password" v-model="form.pass" pattern="^[a-zA-Z0-9_\-\/!#\$%&]*$" :readonly="!isEditable" />
      </b-form-group>
      <b-form-group>
        <label v-t="'label.passwordConfirm'" />
        <b-form-input type="password" v-model="passConfirm" pattern="^[a-zA-Z0-9_\-\/!#\$%&]*$" :readonly="!isEditable" />
      </b-form-group>

      <b-button v-if="isEditable" type="submit" variant="outline-primary" @click="beforeSubmit($event, false)" >{{ label }}</b-button>
      <b-button v-if="isEditable && !isUpdate" type="submit" variant="outline-primary" @click="beforeSubmit($event, true)" class="ml-2" v-t="'label.registerAgain'"/>
      <b-button type="button" variant="outline-danger" @click="backToList" class="ml-2" v-t="'label.back'"/>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import editmixinVue from '../../../components/editmixin.vue';
import * as Util from '../../../sub/util/Util'

export default {
  mixins: [editmixinVue],
  data() {
    return {
      name: 'user',
      id: 'userId',
      backPath: '/master/user',
      appServicePath: '/meta/user',
      form: ViewHelper.extract(this.$store.state.app_service.user, ["userId", "loginId", "pass", "name", "email", "roleId", "description"]),
      roleOptions: [],
      selectOption: null,
      passConfirm: "",
      passMinLength: 3,
      passMaxLength: 16,
    }
  },
  async created(){
    this.roleOptions = await AppServiceHelper.fetchList("/meta/role/", 'roleId')
    this.roleOptions = this.roleOptions.map((val) => ({text: val.roleName, value: val.roleId}))
    this.selectOption = this.form.roleId
  },
  computed: {
    ...mapState('app_service', [
      'user',
    ]),
  },
  methods: {
    isErrorPasswordRequired(){
      if(Util.hasValue(this.form.userId)){
        return false
      }
      if(Util.hasValue(this.form.pass)){
        return false
      }
      return true
    },
    isErrorPasswordLength(){
      if(!Util.hasValue(this.form.pass)){
        return false
      }
      if(this.passMinLength <= this.form.pass.length && this.form.pass.length <= this.passMaxLength){
        return false
      }
      return true
    },
    isErrorPasswordValue(){
      if(Util.hasValue(this.form.userId)){
        if(!Util.hasValue(this.form.pass) && !Util.hasValue(this.passConfirm)){
          return false
        }
      }
      if(this.form.pass === this.passConfirm){
        return false
      }
      return true
    },
    beforeSubmit(event, again){
      this.showAlert = false
      if(this.isErrorPasswordRequired()){
        this.message = this.$i18n.t('message.required', {target: this.$i18n.t('label.password')})
        this.showAlert = true
      }
      else if(this.isErrorPasswordLength()){
        this.message = this.$i18n.t('message.lengthRange', {
          target: this.$i18n.t('label.password'),
          min: this.passMinLength,
          max: this.passMaxLength,
        })
        this.showAlert = true
      }
      else if(this.isErrorPasswordValue()){
        this.message = this.$i18n.t('message.validate', {target: this.$i18n.t('label.password')})
        this.showAlert = true
      }
      if(this.showAlert){
        window.scrollTo(0, 0)
        event.preventDefault();
        return false;
      }
      this.form.userId = Util.hasValue(this.form.userId) ? String(this.form.userId) : undefined
      this.form.roleId = String(this.selectOption)
      this.register(again)
    }
  },
}
</script>

<style scoped lang="scss">

</style>