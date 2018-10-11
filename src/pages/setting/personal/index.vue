
<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <!--
      <b-alert variant="info" :show="showInfo">{{ message }}</b-alert>
      <b-alert variant="danger" dismissible :show="showAlert"  @dismissed="showAlert=false">{{ message }}</b-alert>
      -->
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.login-user-profile" />
          <b-form>
            <b-form-group>
              <label v-t="'label.loginId'" />
              <b-form-input type="text" v-model="loginUser.loginId" maxlength="16" :readonly="!isChange" :state="errorMessages.loginId.length > 0 ? false : null"/>
              <p class="error" v-for="(val, key) in errorMessages.loginId" :key="key" v-if="errorMessages.loginId.length > 0" v-t="val"></p>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.personName'" />
              <b-form-input type="text" v-model="loginUser.name" :readonly="!isChange" :state="errorMessages.name.length > 0 ? false : null" />
              <p class="error" v-for="(val, key) in errorMessages.name" :key="key" v-if="errorMessages.name.length > 0" v-t="val"></p>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.email'" />
              <b-form-input type="email" v-model="loginUser.email" :readonly="!isChange"  :state="errorMessages.email.length > 0 ? false : null" />
              <p class="error" v-for="(val, key) in errorMessages.email" :key="key" v-if="errorMessages.email.length > 0" v-t="val"></p>
            </b-form-group>
            <b-form-group>
              <label v-t="'label.role'" />
              <b-form-input type="text" :value="loginUser.role" :readonly="true" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.theme'" />
              <b-form-select v-model="selectedTheme" :options="themes" class="mb-3" @change="themeSelected"/>
            </b-form-group>
            <b-form-group>
              <b-button type="button" :variant="theme" class="btn-block" 
              v-t="'label.changeProfilePassword'" @click="onClickUpdateButton" v-show="!isChange" />
            </b-form-group>

            <b-card bg-variant="light" v-show="isChange">
              <b-form-group breakpoint="lg" :label="$i18n.t('label.changePassword')" label-size="md" label-class="test">
                <b-form-group :label="$i18n.t('label.passwordCurrent')" label-class="text-sm-right" label-for="password-current">
                  <b-form-input type="password" id="password-current" v-model="passwordCurrent" maxlength="16"></b-form-input>
                </b-form-group>
                <b-form-group :label="$i18n.t('label.passwordUpdate')" label-class="text-sm-right" label-for="password-update">
                  <b-form-input type="password" id="password-update" v-model="passwordUpdate" v-on:input="handleInput" maxlength="16"></b-form-input>
                </b-form-group>
                <b-form-group :label="$i18n.t('label.passwordConfirm')" label-class="text-sm-right" label-for="password-confirm">
                  <b-form-input type="password" id="password-confirm" v-model="passwordConfirm" v-on:input="handleInput" maxlength="16"></b-form-input>
                </b-form-group>
              </b-form-group>
              <b-alert variant="danger" :show="errorMessage !== null">{{ errorMessage }}</b-alert>
            </b-card>
          </b-form>
        </b-col>
      </b-row>
      <b-row :style="{ marginTop: '30px' }" v-show="isChange">
        <b-col md="2" offset-md="3">
          <b-button type="button" v-t="'label.cancel'" :block="true" variant="outline-danger" @click="isChange = false" />
        </b-col>
        <b-col md="2" offset-md="2">
          <b-button type="button" v-t="'label.modify'" :block="true" :variant="theme" @click="onSubmit" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../../components/breadcrumb.vue'
import pagetitle from '../../../components/pagetitle.vue'
import { DISP, THEME, PASSWORD_LENGTH } from '../../../sub/constant/config'
import { getTheme, getButtonTheme } from '../../../sub/helper/ThemeHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as ValidateUtil from '../../../sub/util/ValidateUtil'

export default {
  components: {
    breadcrumb,
    pagetitle,
  },
  data () {
    return {
      name: 'setting',
      id: 'settingId',
      items: [
        {
          text: this.$i18n.t('label.setting'),
          active: true
        },
        {
          text: this.$i18n.t('label.personal'),
          active: true
        },
      ],
      themes: [],
      selectedTheme: null,
      loginUser: {
        loginId: null,
        name: null,
        email: null,
        role: null 
      },
      errorMessages: {
        loginId: [],
        name: [],
        email: [],
      },
      isChange: false,
      passMinLength: 3,
      passMaxLength: 16,
      errorMessage: null,
      passwordCurrent: null,
      passwordUpdate: null,
      passwordConfirm: null,
    }
  },
  computed: {
    theme () {
      const storeTheme = this.$store.state.setting.theme
      return 'outline-' + getButtonTheme(this.loginId)
    },
  },
  created () {
    const login = JSON.parse(window.localStorage.getItem('login'))
    this.loginUser.loginId = this.$store.state.loginId
    this.loginUser.name = login.username
    this.loginUser.role = login.role
    Object.assign(this.loginUser, this.getCurrentUser())
    const theme = getTheme(this.loginId)
    const selected = THEME.find((item) => {
      return item.name === theme
    })
    this.selectedTheme = (typeof selected) !== 'undefined' ? selected.id : THEME[0].id
    const that = this
    this.themes = THEME.map((e) => {
      const text = that.$i18n.t('label.' + e.name)
      return { value: e.id, text: text }
    })
  },
  methods: {
    themeSelected (selected) {
      const t = THEME.find((e) => {
        return e.id === selected
      })
      const theme = (typeof t !== 'undefined') ? t.name : 'default'
      // storeにテーマをセット。navbar,sidebar,menu-itemのcomputedプロパティにて
      // storeを参照しているため、テーマの変更を検知する
      this.replaceSetting({theme})
      window.localStorage.setItem(this.loginId + '-theme', theme)
    },
    handleInput (value) {
      if (value.length < this.passMinLength || value.length > this.passMaxLength) {
        this.errorMessage = this.$i18n.t('message.lengthRange', {
          target: this.$i18n.t('label.password'),
          min: this.passMinLength,
          max: this.passMaxLength,
        })
        return
      }

      if (this.passwordUpdate === null && this.passwordConfirm === null) {
        return
      }

      const update = this.passwordUpdate ? this.passwordUpdate : ''
      const confirm = this.passwordConfirm ? this.passwordConfirm : ''

      if (update !== confirm) {
        this.errorMessage = this.$i18n.t('message.notMatchPassword')
        return
      }
      this.errorMessage = null
    },
    onClickUpdateButton() {
      this.isChange = true
    },
    onSubmit() {
      const errorMessages = this.errorMessages
      errorMessages.loginId = this.validateLoginId()
      errorMessages.name = this.validateRequire(this.loginUser.personName, this.$i18n.t('label.personName'))
      errorMessages.email = this.validateRequire(this.loginUser.email, this.$i18n.t('label.email'))
    },
    validateLoginId () {
      const loginId = this.loginUser.loginId
      const required = this.validateRequire(loginId, this.$i18n.t('label.loginId'))
      if (required.length > 0) {
        return required
      }
      const pattern = ValidateUtil.validatePattern(
        loginId, /^[a-zA-Z][a-zA-Z0-9_\-@\.]*$/, this.$i18n.t('message.invalidLoginId'))
      return pattern ? [pattern] : []
    },
    validateRequire (val, label) {
      const target = label
      const result = ValidateUtil.validateRequire(val, this.$i18n.t('message.required', { target }))
      return result ? [result] : []
    },
    async getCurrentUser () {
      let user = await HttpHelper.getAppService('/meta/user/currentUser')
      return {
        name: user.name,
        email: user.email,
      }
    },
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
  },
}
</script>

<style scoped lang="scss">
  h3.loginuser-profile {
    font-size: 1.2em;
    font-weight: bold;
    color: #999;
    margin-bottom: 20px;
  }

  p.error {
    color: #dc3545;
  }
</style>