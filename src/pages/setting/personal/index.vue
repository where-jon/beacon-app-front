
<template>
  <div>
    <breadcrumb :items="items" />
    <div class="container">
      <b-alert variant="success" :show="isSuccess">{{ 
        $i18n.t('message.updateCompleted', {
          target: $i18n.t('label.login-user-profile')})
        }}</b-alert>
      <b-alert variant="danger" dismissible :show="hasError">{{ 
        $i18n.t('message.updateFailed', {
          target: $i18n.t('label.login-user-profile'),
          code: 0
        })
        }}</b-alert>
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.login-user-profile" />
          <b-form>
            <b-form-group>
              <label v-t="'label.loginId'" />
              <b-form-input type="text" v-model="loginUser.loginId" maxlength="16" readonly :state="errorMessages.loginId.length > 0 ? false : null"/>
              <p class="error" v-for="(val, key) in errorMessages.loginId" :key="key" v-if="errorMessages.loginId.length > 0" v-t="val"></p>
            </b-form-group>
            <b-form-group v-show="showName">
              <label v-t="'label.name'" />
              <b-form-input type="text" v-model="loginUser.name" :readonly="!isChange" :state="errorMessages.name.length > 0 ? false : null" />
              <p class="error" v-for="(val, key) in errorMessages.name" :key="key" v-if="errorMessages.name.length > 0" v-t="val"></p>
            </b-form-group>
            <b-form-group v-show="showEmail">
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
            <!-- プロフィール・パスワードを変更するボタン -->
            <b-form-group>
              <label v-t="'label.charSet'" />
              <b-form-select v-model="selectedCharSet" :options="charSets" class="mb-3" @change="charSetSelected"/>
            </b-form-group>
            <b-form-group>
              <b-button type="button" :variant="theme" class="btn-block" 
              v-t="'label.changeProfilePassword'" @click="isChange = true" v-show="!isChange" />
            </b-form-group>

            <b-card bg-variant="light" v-show="isChange">
              <b-form-group breakpoint="lg" :label="$i18n.t('label.changePassword')" label-size="md">

                <!-- 現在のパスワード -->
                <b-form-group :label="$i18n.t('label.passwordCurrent')" label-class="text-sm-right" label-for="password-current">
                  <b-form-input type="password" id="password-current"
                   v-model="loginUser.password" maxlength="16"
                   :state="errorMessages.password.length > 0 ? false : null" />
                  <p class="error" v-for="(val, key) in errorMessages.password" :key="key" v-if="errorMessages.password.length > 0" v-t="val"></p>
                </b-form-group>

                <!-- 変更パスワード -->
                <b-form-group :label="$i18n.t('label.passwordUpdate')" label-class="text-sm-right" label-for="password-update">
                  <b-form-input type="password" id="password-update" v-model="loginUser.passwordUpdate" v-on:input="handleUpdateConfirmPass" maxlength="16"></b-form-input>
                </b-form-group>

                <!-- 確認パスワード -->
                <b-form-group :label="$i18n.t('label.passwordConfirm')" label-class="text-sm-right" label-for="password-confirm">
                  <b-form-input type="password" id="password-confirm" v-model="loginUser.passwordConfirm" v-on:input="handleUpdateConfirmPass" maxlength="16"></b-form-input>
                </b-form-group>

              </b-form-group>
              <b-alert variant="danger" :show="passErrorMessage !== null">{{ passErrorMessage }}</b-alert>
            </b-card>
          </b-form>
        </b-col>
      </b-row>
      <b-row :style="{ marginTop: '30px' }" v-show="isChange">
        <b-col md="2" offset-md="3">
          <b-button type="button" v-t="'label.cancel'" :block="true" variant="outline-danger" @click="handleCancelButton" />
        </b-col>
        <b-col md="2" offset-md="2">
          <b-button type="button" v-t="'label.modify'" :block="true" :variant="theme" @click="onSubmit" :disabled="passErrorMessage !== null"/>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../../components/breadcrumb.vue'
import pagetitle from '../../../components/pagetitle.vue'
import { APP, DISP, THEME, CHAR_SET, PASSWORD_LENGTH } from '../../../sub/constant/config'
import { getTheme, getButtonTheme } from '../../../sub/helper/ThemeHelper'
import { getCharSet } from '../../../sub/helper/CharSetHelper'
import * as AuthHelper from '../../../sub/helper/AuthHelper'
import * as AppServiceHelper from '../../../sub/helper/AppServiceHelper'
import * as HttpHelper from '../../../sub/helper/HttpHelper'
import * as ViewHelper from '../../../sub/helper/ViewHelper'
import * as ValidateUtil from '../../../sub/util/ValidateUtil'
import commonmixinVue from '../../../components/commonmixin.vue';

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
        passwordUpdate: null,
        passwordConfirm: null,
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
      const storeTheme = this.$store.state.setting.theme
      return 'outline-' + getButtonTheme(this.$store.state.loginId)
    },
    hasError () {
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
    const theme = getTheme(this.$store.state.loginId)
    const selected = THEME.find((item) => {
      return item.name === theme
    })
    this.selectedTheme = selected != null? selected.id : THEME[0].id
    const charSet = getCharSet(this.$store.state.loginId)
    const selectedCs = CHAR_SET.find((item) => {
      return item.name === charSet
    })
    this.selectedCharSet = selectedCs != null ? selectedCs.id : CHAR_SET[0].id
    const that = this
    this.themes = THEME.map((e) => {
      const text = that.$i18n.t('label.' + e.name)
      return { value: e.id, text: text }
    })
    this.charSets = CHAR_SET.map((e) => {
      const text = that.$i18n.t('label.' + e.name)
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
      window.localStorage.setItem(this.$store.state.loginId + '-theme', theme)
    },
    theme () {
      const theme = getTheme(this.$store.state.loginId)
      return 'outline-' + theme
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
        return
      }

      if (value.length < this.passMinLength || value.length > this.passMaxLength) {
        this.passErrorMessage = this.$i18n.t('message.lengthRange', {
          target: this.$i18n.t('label.password'),
          min: this.passMinLength,
          max: this.passMaxLength,
        })
        return
      }

      const result = ValidateUtil.validatePattern(value, /^[a-zA-Z0-9_\-\/!#\$%&]*$/, this.$i18n.t('message.invalidPassword'))
      if (result !== null) {
        this.passErrorMessage = result
        return
      }

      const update = passwordUpdate ? passwordUpdate : ''
      const confirm = passwordConfirm ? passwordConfirm : ''
      if (update !== confirm) {
        this.passErrorMessage = this.$i18n.t('message.notMatchPassword')
        return
      }
      this.passErrorMessage = null
    },
    handleCancelButton () {
      this.loginUser.password = null
      this.loginUser.passwordUpdate = null
      this.loginUser.passwordConfirm = null
      this.errorMessages.password = []
      this.passErrorMessage = null
      this.isChange = false
    },
    async onSubmit() {
      const errorMessages = this.errorMessages
      errorMessages.loginId = this.validateLoginIdPassword(
        this.loginUser.loginId,
        this.$i18n.t('label.loginId'),
        this.$i18n.t('message.invalidLoginId')
      )
      if (this.showName) {
        errorMessages.name = this.validateRequire(this.loginUser.name, this.$i18n.t('label.name'))
      }
      if (this.showEmail) {
        errorMessages.email = this.validateRequire(this.loginUser.email, this.$i18n.t('label.email'))
      }
      errorMessages.password = this.validateLoginIdPassword(
        this.loginUser.password,
        this.$i18n.t('label.password'),
        this.$i18n.t('message.invalidPassword')
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
            await this.save()
            this.isSuccess = true
          } catch(e) {
            errorMessages.general.push(this.$i18n.t('message.error'))
          }
        },
        () => { errorMessages.password.push(this.$i18n.t('message.notMatchCureentPassword')) }
      )
    },
    async save() {
      const param = ViewHelper.extract(this.loginUser, ["userId", "loginId", "name", "email", "roleId", "description"])
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
      const pattern = ValidateUtil.validatePattern(value, /^[a-zA-Z0-9_\-\/!#\$%&]*$/, invalidPatternMessage)
      return pattern ? [pattern] : []
    },
    validateRequire (val, label) {
      const target = label
      const result = ValidateUtil.validateRequire(val, this.$i18n.t('message.required', { target }))
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