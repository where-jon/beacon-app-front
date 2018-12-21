
<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="success" dismissible :show="isSuccess">
        {{ 
          $i18n.tnl('message.updateCompleted', {
            target: $i18n.tnl('label.login-user-profile')})
        }}
      </b-alert>
      <b-alert variant="danger" dismissible :show="hasError">
        {{ 
          $i18n.terror('message.updateFailed', {
            target: $i18n.tnl('label.login-user-profile')
          })
        }}
      </b-alert>
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.login-user-profile" />
          <b-form>
            <b-form-group>
              <label v-t="'label.loginId'" />
              <b-form-input v-model="loginUser.loginId" type="text" maxlength="16" readonly :state="errorMessages.loginId.length > 0 ? false : null" />
              <p v-for="(val, key) in errorMessages.loginId" :key="key" v-t="val" class="error" />
            </b-form-group>
            <b-form-group v-show="showName">
              <label v-t="'label.name'" />
              <b-form-input v-model="loginUser.name" type="text" :readonly="!isChange" :state="errorMessages.name.length > 0 ? false : null" />
              <p v-for="(val, key) in errorMessages.name" :key="key" v-t="val" class="error" />
            </b-form-group>
            <b-form-group v-show="showEmail">
              <label v-t="'label.email'" />
              <b-form-input v-model="loginUser.email" type="email" :readonly="!isChange" :state="errorMessages.email.length > 0 ? false : null" />
              <p v-for="(val, key) in errorMessages.email" :key="key" v-t="val" class="error" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.role'" />
              <b-form-input type="text" :value="loginUser.role" :readonly="true" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.theme'" />
              <b-form-select v-model="selectedTheme" :options="themes" class="mb-3" @change="themeSelected" />
            </b-form-group>
            <!-- プロフィール・パスワードを変更するボタン -->
            <b-form-group>
              <label v-t="'label.charSet'" />
              <b-form-select v-model="selectedCharSet" :options="charSets" class="mb-3" @change="charSetSelected" />
            </b-form-group>
            <b-form-group>
              <b-button v-show="!isChange" v-t="'label.changeProfilePassword'" type="button" 
                        :variant="theme" class="btn-block" @click="isChange = true"
              />
            </b-form-group>

            <b-card v-show="isChange" bg-variant="light">
              <b-form-group breakpoint="lg" :label="$i18n.tnl('label.changePassword')" label-size="md">
                <!-- 現在のパスワード -->
                <b-form-group :label="$i18n.tnl('label.passwordCurrent')" label-class="text-sm-right" label-for="password-current">
                  <b-form-input id="password-current" v-model="loginUser.password"
                                type="password" maxlength="16"
                                :state="errorMessages.password.length > 0 ? false : null"
                  />
                  <p v-for="(val, key) in errorMessages.password" :key="key" v-t="val" class="error" />
                </b-form-group>

                <!-- 変更パスワード -->
                <b-form-group :label="$i18n.tnl('label.passwordUpdate')" label-class="text-sm-right" label-for="password-update">
                  <b-form-input id="password-update" v-model="loginUser.passwordUpdate" type="password" maxlength="16" />
                </b-form-group>

                <!-- 確認パスワード -->
                <b-form-group :label="$i18n.tnl('label.passwordConfirm')" label-class="text-sm-right" label-for="password-confirm">
                  <b-form-input id="password-confirm" v-model="loginUser.passwordConfirm" type="password" maxlength="16" />
                </b-form-group>
              </b-form-group>
              <b-alert variant="danger" dismissible :show="passErrorMessage !== null">
                {{ passErrorMessage }}
              </b-alert>
            </b-card>
          </b-form>
        </b-col>
      </b-row>
      <b-row v-show="isChange" :style="{ marginTop: '30px' }">
        <b-form-group class="col text-center">
          <b-button v-t="'label.cancel'" type="button" class="mr-4 mb-2 input-btn" variant="outline-danger" @click="handleCancelButton" />
          <b-button v-t="'label.modify'" type="button" class="ml-4 mb-2 input-btn" :variant="theme" @click="onSubmit" />
        </b-form-group>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import pagetitle from '../../../components/layout/pagetitle.vue'
import { APP } from '../../../sub/constant/config'
import { THEME, CHAR_SET } from '../../../sub/constant/Constants'
import { getTheme, getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { getCharSet } from '../../../sub/helper/CharSetHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as ValidateUtil from '../../../sub/util/ValidateUtil'
import commonmixinVue from '../../../components/mixin/commonmixin.vue'

export default {
  mixin: [commonmixinVue],
  components: {
    breadcrumb,
    pagetitle,
  },
  data () {
    return {
      name: 'setting',
      id: 'settingId',
      appServicePath: '/meta/user/currentUser',
      items: [
        {
          text: this.$i18n.tnl('label.setting'),
          active: true
        },
        {
          text: this.$i18n.tnl('label.personal'),
          active: true
        },
      ],
      themes: [],
      selectedTheme: null,
      charSets: [],
      selectedCharSet: null,
      loginUser: {
        userId: null,
        loginId: null,
        name: null,
        email: null,
        role: null,
        roleId: null,
        description: null,
        password: null,
        passwordUpdate: '',
        passwordConfirm: '',
      },
      errorMessages: {
        loginId: [],
        name: [],
        email: [],
        password: [],
        general: [],
      },
      isChange: false,
      passMinLength: 3,
      passMaxLength: 16,
      passErrorMessage: null,
      isSuccess: false,
    }
  },
  computed: {
    theme () {
      return 'outline-' + getButtonTheme()
    },
    hasError() {
      return Object.keys(this.errorMessages)
        .map((key) => {
          return this.errorMessages[key].length
        })
        .reduce((prev, cur, i, a) => { return prev + cur }) > 0
    },
    showEmail() {
      return APP.USER_WITH_EMAIL
    },
    showName() {
      return APP.USER_WITH_NAME
    }
  },
  watch: {
    hasError(value){
      if (value) {
        this.isSuccess = false
      }
    }
  },
  created () {
    this.setLoginUser()
    const theme = getTheme()
    const selected = THEME.find((item) => {
      return item.name === theme
    })
    this.selectedTheme = selected != null? selected.id : THEME[0].id
    const charSet = getCharSet(this.$store.state.loginId)
    const selectedCs = CHAR_SET.find((item) => {
      return item.name === charSet
    })
    this.selectedCharSet = selectedCs != null ? selectedCs.id : CHAR_SET[0].id
    this.themes = THEME.map((e) => {
      const text = this.$i18n.tnl('label.' + e.name)
      return { value: e.id, text: text }
    })
    this.charSets = CHAR_SET.map((e) => {
      const text = this.$i18n.tnl('label.' + e.name)
      return { value: e.id, text: text }
    })
  },
  methods: {
    themeSelected (selected) {
      const t = THEME.find((e) => {
        return e.id === selected
      })
      const theme = t != null ? t.name : 'default'
      // storeにテーマをセット。navbar,sidebar,menu-itemのcomputedプロパティにて
      // storeを参照しているため、テーマの変更を検知する
      this.replaceSetting({theme})
      window.localStorage.setItem(document.domain + '-theme', theme)
    },
    charSetSelected (selected) {
      const cs = CHAR_SET.find((e) => {
        return e.id === selected
      })
      const charSet = cs != null ? cs.name : CHAR_SET[0].name
      this.replaceSetting({charSet})
      window.localStorage.setItem(this.$store.state.loginId + '-charSet', charSet)
    },
    handleUpdateConfirmPass (value) {
      const passwordUpdate = this.loginUser.passwordUpdate 
      const passwordConfirm = this.loginUser.passwordConfirm
      if (passwordUpdate === null && passwordConfirm === null) {
        return false
      }

      if (value.length < this.passMinLength || value.length > this.passMaxLength) {
        this.passErrorMessage = this.$i18n.tnl('message.lengthRange', {
          target: this.$i18n.tnl('label.password'),
          min: this.passMinLength,
          max: this.passMaxLength,
        })
        this.errorMessages.general.push(this.passErrorMessage)
        return false
      }

      const result = ValidateUtil.validatePattern(value, /^[a-zA-Z0-9_\-/!#$%&@]*$/, this.$i18n.tnl('message.invalidPassword'))
      if (result !== null) {
        this.passErrorMessage = result
        this.errorMessages.general.push(this.passErrorMessage)
        return false
      }

      const update = passwordUpdate ? passwordUpdate : ''
      const confirm = passwordConfirm ? passwordConfirm : ''
      if (update !== confirm) {
        this.passErrorMessage = this.$i18n.tnl('message.notMatchPassword')
        this.errorMessages.general.push(this.passErrorMessage)
        return false
      }
      this.passErrorMessage = null
      return true
    },
    handleCancelButton () {
      this.loginUser.password = null
      this.loginUser.passwordUpdate = ''
      this.loginUser.passwordConfirm = ''
      this.errorMessages.password = []
      this.passErrorMessage = null
      this.isChange = false
    },
    async onSubmit() {
      Object.keys(this.errorMessages).forEach((key) => this.errorMessages[key] = [])
      const errorMessages = this.errorMessages
      errorMessages.loginId = this.validateLoginIdPassword(
        this.loginUser.loginId,
        this.$i18n.tnl('label.loginId'),
        this.$i18n.tnl('message.invalidLoginId')
      )
      if (this.showName) {
        errorMessages.name = this.validateRequire(this.loginUser.name, this.$i18n.tnl('label.name'))
      }
      if (this.showEmail) {
        errorMessages.email = this.validateRequire(this.loginUser.email, this.$i18n.tnl('label.email'))
      }
      errorMessages.password = this.validateLoginIdPassword(
        this.loginUser.password,
        this.$i18n.tnl('label.password'),
        this.$i18n.tnl('message.invalidPassword')
      )

      if (this.hasError) {
        return
      }

      // 現在のパスワードで認証を実行する
      AuthHelper.authByAppService(
        this.$store.state.loginId,
        this.loginUser.password,
        async () => {
          try {
            if(!this.handleUpdateConfirmPass(this.loginUser.passwordUpdate) || !this.handleUpdateConfirmPass(this.loginUser.passwordConfirm)){
              return
            }
            await this.save()
            this.replace({pass: this.loginUser.passwordConfirm})
            this.isSuccess = true
          } catch(e) {
            errorMessages.general.push(this.$i18n.tnl('message.error'))
          }
        },
        () => { errorMessages.password.push(this.$i18n.tnl('message.notMatchCureentPassword')) }
      )
    },
    async save() {
      const param = ViewHelper.extract(this.loginUser, ['userId', 'loginId', 'name', 'email', 'roleId', 'description'])
      if (this.loginUser.passwordConfirm !== null) {
        param['pass'] = this.loginUser.passwordConfirm
      }
      const result = await AppServiceHelper.update(this.appServicePath, param)
      this.handleCancelButton()
      return result
    },
    validateLoginIdPassword (value, label, invalidPatternMessage) {
      const required = this.validateRequire(value, label)
      if (required.length > 0) {
        return required
      }
      const pattern = ValidateUtil.validatePattern(value, /^[a-zA-Z0-9_\-/!#$%&@]*$/, invalidPatternMessage)
      return pattern ? [pattern] : []
    },
    validateRequire (val, label) {
      const target = label
      const result = ValidateUtil.validateRequire(val, this.$i18n.tnl('message.required', { target }))
      return result ? [result] : []
    },
    async setLoginUser () {
      const user = await HttpHelper.getAppService('/meta/user/currentUser')
      this.loginUser.userId = user.userId
      this.loginUser.loginId = user.loginId
      this.loginUser.name = user.name
      this.loginUser.email = user.email
      this.loginUser.role = user.role.roleName
      this.loginUser.roleId = user.role.roleId
      this.loginUser.description = user.description
    },
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
    ...mapMutations([
      'replace', 
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

  .input-btn {
    text-align: center;
    width: 104px;
  }

  p.error {
    color: #dc3545;
  }
</style>