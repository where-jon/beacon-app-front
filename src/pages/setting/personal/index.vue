
<template>
  <div class="container-fluid">
    <breadcrumb :items="items" />
    <div class="container">
      <alert :message="getMessage()" />
      <b-row>
        <b-col md="10" offset-md="1">
          <pagetitle title="label.login-user-profile" />
          <b-form>
            <!-- MS Teams版ではログインID欄非表示 -->
            <b-form-group v-if="!isMsTeams">
              <label v-t="'label.loginId'" />
              <b-form-input v-model="loginUser.loginId" :state="errorMessages.loginId.length > 0 ? false : null" type="text" maxlength="16" readonly />
              <p v-for="(val, key) in errorMessages.loginId" :key="key" v-t="val" class="error" />
            </b-form-group>

            <b-form-group v-show="showName">
              <label v-t="'label.name'" />
              <input v-model="loginUser.name" :readonly="isChange" :state="errorMessages.name.length > 0 ? false : null" type="text" class="form-control" maxlength="20">
              <p v-for="(val, key) in errorMessages.name" :key="key" v-t="val" class="error" />
            </b-form-group>
            <b-form-group v-show="showEmail">
              <label v-t="'label.email'" />
              <input v-model="loginUser.email" :readonly="isChange" :state="errorMessages.email.length > 0 ? false : null" type="email" class="form-control">
              <p v-for="(val, key) in errorMessages.email" :key="key" v-t="val" class="error" />
            </b-form-group>
            <!--
            <b-form-group>
              <label v-t="'label.minor'" />
              <input v-model="loginUser.minor" :readonly="!isChange" type="number" min="1" max="9999" class="form-control">
              <p v-for="(val, key) in errorMessages.minor" :key="key" v-t="val" class="error" />
            </b-form-group>
            -->
            <b-form-group>
              <label v-t="'label.role'" />
              <b-form-input :value="loginUser.role" :readonly="true" type="text" />
            </b-form-group>
            <b-form-group v-if="!disabledTheme">
              <label v-t="'label.theme'" />
              <b-form-select v-model="selectedTheme" :options="themes" class="mb-3" @change="themeSelected" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.charSet'" />
              <b-form-select v-model="selectedCharSet" :options="charSets" class="mb-3" @change="charSetSelected" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.locale'" />
              <b-form-select v-model="selectedLocale" :options="locales" class="mb-3" @change="localeSelected" />
            </b-form-group>
            <!-- プロフィール・パスワードを変更するボタン -->
            <b-form-group v-if="isUpdatable">
              <!-- MS Teams版ではパスワード変更不可-->
              <div v-if="!isMsTeams">
                <b-button v-show="!isChange" v-t="'label.changeProfilePassword'" :variant="theme" 
                          type="button" class="btn-block" @click="isChange = true"
                />
                <b-card v-show="isChange" bg-variant="light">
                  <b-form-group :label="$i18n.tnl('label.changePassword')" breakpoint="lg" label-size="md">
                    <b-form-group :label="$i18n.tnl('label.passwordCurrent')" label-class="text-sm-right" label-for="password-current">
                      <b-form-input id="password-current" v-model="loginUser.password"
                                    :state="errorMessages.password.length > 0 ? false : null" type="password"
                                    maxlength="16"
                      />
                      <p v-for="(val, key) in errorMessages.password" :key="key" class="error">
                        {{ val }}
                      </p>
                    </b-form-group>

                    <b-form-group :label="$i18n.tnl('label.passwordUpdate')" label-class="text-sm-right" label-for="password-update">
                      <b-form-input id="password-update" v-model="loginUser.passwordUpdate" type="password" maxlength="16" />
                    </b-form-group>

                    <b-form-group :label="$i18n.tnl('label.passwordConfirm')" label-class="text-sm-right" label-for="password-confirm">
                      <b-form-input id="password-confirm" v-model="loginUser.passwordConfirm" type="password" maxlength="16" />
                    </b-form-group>
                  </b-form-group>
                  <b-alert :show="passErrorMessage !== null" variant="danger" dismissible>
                    {{ passErrorMessage }}
                  </b-alert>
                </b-card>
              </div>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
      <!-- MS Teams版では常にキャンセル・変更ボタンを非表示 -->
      <b-row v-if="!isMsTeams" :style="{ marginTop: '30px' }">
        <b-form-group class="col text-center">
          <b-button v-t="'label.cancel'" type="button" class="mr-4 mb-2 input-btn" variant="outline-danger" @click="handleCancelButton" />
          <b-button v-t="'label.modify'" :variant="theme" type="button" class="ml-4 mb-2 input-btn" @click="onSubmit" />
        </b-form-group>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { APP, MSTEAMS_APP } from '../../../sub/constant/config'
import { THEME, CHAR_SET, LOCALE } from '../../../sub/constant/Constants'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'
import { getLangShort } from '../../../sub/util/BrowserUtil'
import * as Util from '../../../sub/util/Util'
import * as AppServiceHelper from '../../../sub/helper/dataproc/AppServiceHelper'
import * as AuthHelper from '../../../sub/helper/base/AuthHelper'
import { getCharSet } from '../../../sub/helper/base/CharSetHelper'
import * as LocaleHelper from '../../../sub/helper/base/LocaleHelper'
import * as LocalStorageHelper from '../../../sub/helper/base/LocalStorageHelper'
import { getTheme } from '../../../sub/helper/ui/ThemeHelper'
import * as ValidateHelper from '../../../sub/helper/dataproc/ValidateHelper'
import * as ViewHelper from '../../../sub/helper/ui/ViewHelper'
import breadcrumb from '../../../components/layout/breadcrumb.vue'
import pagetitle from '../../../components/layout/pagetitle.vue'
import commonmixin from '../../../components/mixin/commonmixin.vue'
import editmixin from '../../../components/mixin/editmixin.vue'
import alert from '../../../components/parts/alert.vue'

export default {
  components: {
    breadcrumb,
    pagetitle,
    alert,
  },
  mixins: [commonmixin, editmixin],
  data () {
    return {
      name: 'setting',
      id: 'settingId',
      backPath: '/setting/personal',
      appServicePath: '/meta/user/currentUser',
      errorMessages: {
        loginId: [],
        name: [],
        email: [],
        minor: [],
        password: [],
        general: [],
      },
      passErrorMessage: null,
      passMinLength: 3,
      passMaxLength: 16,
      items: [],
      themes: [],
      selectedTheme: null,
      charSets: [],
      selectedCharSet: null,
      locales: [],
      selectedLocale: null,
      loginUser: {
        userId: null,
        loginId: null,
        name: null,
        email: null,
        minor: null,
        role: null,
        roleId: null,
        description: null,
        password: null,
        passwordUpdate: '',
        passwordConfirm: '',
      },
      isChange: false,
      isMsTeams: MSTEAMS_APP.IS_COOPERATION,
    }
  },
  computed: {
    ...mapState( [
      'showInfo',
      'showAlert',
    ]),
    hasError() {
      return Object.keys(this.errorMessages)
        .map((key) => {
          return this.errorMessages[key].length
        })
        .reduce((prev, cur, i, a) => { return prev + cur }) > 0
    },
    disabledTheme() {
      return APP.SETTING.DISABLED_THEME
    },
    showEmail() {
      return ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'email')
    },
    showName() {
      return ArrayUtil.includesIgnoreCase(APP.USER.WITH, 'name')
    },
  },
  watch: {
    hasError(value){
      this.replace({showAlert: value? true: false})
    }
  },
  created () {
    this.initialize()
  },
  methods: {
    getMessage(){
      return this.showInfo? 
        this.$i18n.tnl('message.updateCompleted', {target: this.$i18n.tnl('label.login-user-profile')}):
        this.$i18n.terror('message.updateFailed', {target: this.$i18n.tnl('label.login-user-profile')})
    },
    async initialize(){
      await this.setLoginUser()
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
      const selectedLc = LOCALE.find((val) => val.name == LocaleHelper.getLocale(this.loginUser.loginId))
      this.selectedLocale = selectedLc != null ? selectedLc.id : LOCALE[0].id
      this.locales = LOCALE.map((e) => {return { value: e.id, text: this.$i18n.tnl('label.' + e.name) }})
      this.items = ViewHelper.createBreadCrumbItems('setting', 'personal')
    },
    themeSelected (selected) {
      const t = THEME.find((e) => {
        return e.id === selected
      })
      const theme = t != null ? t.name : 'default'
      // storeにテーマをセット。navbar,sidebar,menu-itemのcomputedプロパティにて
      // storeを参照しているため、テーマの変更を検知する
      this.replaceSetting({theme})
      LocalStorageHelper.setLocalStorage(document.domain + '-theme', theme)
      // update theme
      this.theme
    },
    charSetSelected (selected) {
      const cs = CHAR_SET.find((e) => {
        return e.id === selected
      })
      const charSet = cs != null ? cs.name : CHAR_SET[0].name
      this.replaceSetting({charSet})
      LocalStorageHelper.setLocalStorage(this.$store.state.loginId + '-charSet', charSet)
    },
    localeSelected (selected) {
      const lc = LOCALE.find((e) => e.id === selected)
      const locale = lc != null && lc.id != LOCALE[0].id? lc.name : ''
      this.setLang(locale? locale: getLangShort())
      LocaleHelper.setLocale(locale)
      AuthHelper.storeMagicNumberList()
      this.initialize()
    },
    handleUpdateConfirmPass (value) {
      const passwordUpdate = this.loginUser.passwordUpdate 
      const passwordConfirm = this.loginUser.passwordConfirm
      if (!Util.hasValue(passwordUpdate) && !Util.hasValue(passwordConfirm)) {
        this.passErrorMessage = this.$i18n.tnl('message.required', {
          target: this.$i18n.tnl('label.passwordUpdate'),
        })
        this.errorMessages.general.push(this.passErrorMessage)
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

      const result = ValidateHelper.validatePattern(value, /^[a-zA-Z0-9_\-/!#$%&@]*$/, this.$i18n.tnl('message.invalidPassword'))
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
      this.replace({showInfo: false})
      Object.keys(this.errorMessages).forEach((key) => this.errorMessages[key] = [])
      const errorMessages = this.errorMessages
      errorMessages.loginId = this.validateLoginIdPassword(
        this.loginUser.loginId,
        this.$i18n.tnl('label.loginId'),
        this.$i18n.tnl('message.invalidLoginId')
      )

      if(this.isChange && !Util.hasValue(this.loginUser.password)){
        errorMessages.password = [this.$i18n.tnl('message.invalidPassword')]
        return
      }

      errorMessages.password = this.validateLoginIdPassword(
        this.loginUser.password,
        this.$i18n.tnl('label.password'),
        this.$i18n.tnl('message.invalidPassword'),
        true
      )

      if (this.hasError) {
        return
      }

      if(!Util.hasValue(this.loginUser.password)){
        await this.save()
        this.replace({showInfo: true})
      }
      else{
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
              this.replace({showInfo: true})
            } catch(e) {
              errorMessages.general.push(this.$i18n.tnl('message.error'))
            }
          },
          () => { errorMessages.password.push(this.$i18n.tnl('message.notMatchCureentPassword')) }
        )
      }
    },
    async save() {
      const param = Util.extract(this.loginUser, ['userId', 'loginId', 'name', 'email', 'minor', 'roleId', 'description'])
      if (this.loginUser.passwordConfirm !== null) {
        param['pass'] = this.loginUser.passwordConfirm
      }
      const result = await AppServiceHelper.update(this.appServicePath, param)
      this.handleCancelButton()
      return result
    },
    validateLoginIdPassword (value, label, invalidPatternMessage, isPassword) {
      if(isPassword && !Util.hasValue(value)){
        return []
      }
      const required = this.validateRequire(value, label)
      if (required.length > 0) {
        return required
      }
      const pattern = ValidateHelper.validatePattern(value, /^[a-zA-Z0-9_\-/!#$%&@]*$/, invalidPatternMessage)
      return pattern ? [pattern] : []
    },
    validateRequire (val, label) {
      const target = label
      const result = ValidateHelper.validateRequire(val, this.$i18n.tnl('message.required', { target }))
      return result ? [result] : []
    },
    async setLoginUser () {
      const user = await AppServiceHelper.getCurrentUser()
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
      'setLang',
    ]),
  },
}
</script>

<style scoped lang="scss">
@import "../../../sub/constant/label.scss";
  h3.loginuser-profile {
    font-size: 1.2em;
    font-weight: bold;
    color: #999;
    margin-bottom: 20px;
  }

  .input-btn {
    text-align: center;
    width: 110px;
  }
</style>