
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
              <b-form-input type="text" :value="loginId" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.personName'" />
              <b-form-input type="text" :value="loginUser.name" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.role'" />
              <b-form-input type="text" :value="loginUser.role" readonly="readonly" />
            </b-form-group>
            <b-form-group>
              <label v-t="'label.theme'" />
              <b-form-select v-model="selectedTheme" :options="themes" class="mb-3" @change="themeSelected"/>
            </b-form-group>
            <b-form-group>
              <b-button type="button" :variant="theme" class="btn-block" 
              v-t="'label.changePassword'" @click="isChangePassword = true" v-show="!isChangePassword" />
            </b-form-group>

            <b-card bg-variant="light" v-show="isChangePassword">
              <b-form-group breakpoint="lg" :label="$i18n.t('label.changePassword')" label-size="md" label-class="test">
                <b-form-group :label="$i18n.t('label.passwordCurrent')" label-class="text-sm-right" label-for="password-current">
                  <b-form-input type="password" id="password-current" v-model="passwordCurrent" :class="has-error"></b-form-input>
                </b-form-group>
                <b-form-group :label="$i18n.t('label.passwordUpdate')" label-class="text-sm-right" label-for="password-update">
                  <b-form-input type="password" id="password-update" v-model="passwordUpdate" @input="onInput"></b-form-input>
                </b-form-group>
                <b-form-group :label="$i18n.t('label.passwordConfirm')" label-class="text-sm-right" label-for="password-confirm">
                  <b-form-input type="password" id="password-confirm" v-model="passwordConfirm" @input="onInput"></b-form-input>
                </b-form-group>
              </b-form-group>
            </b-card>
          </b-form>
        </b-col>
      </b-row>
      <b-row :style="{ marginTop: '30px' }" v-show="isChangePassword">
        <b-col md="2" offset-md="3">
          <b-button type="button" v-t="'label.cancel'" :block="true" variant="outline-danger" @click="isChangePassword = false" />
        </b-col>
        <b-col md="2" offset-md="2">
          <b-button type="button" v-t="'label.modify'" :block="true" :variant="theme" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../../components/breadcrumb.vue'
import pagetitle from '../../../components/pagetitle.vue'
import { DISP, THEME } from '../../../sub/constant/config'
import { getTheme, getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
    pagetitle,
  },
  data () {
    return {
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
        loginId: this.loginId,
        name: null,
        role: null
      },
      isChangePassword: false,
      passwordCurrent: this.$store.state.password,
      passwordUpdate: null,
      passwordConfirm: null,
    }
  },
  computed: {
    loginId () {
      return this.$store.state.loginId
    },
    theme () {
      const storeTheme = this.$store.state.setting.theme
      return 'outline-' + getButtonTheme(this.loginId)
    },
    isMatchUpdateConfirm () {
      if (this.passwordUpdate === null && this.passwordConfirm === null) {
        return true
      }
      const update = this.passwordUpdate ? this.passwordUpdate : ''
      const confirm = this.passwordConfirm ? this.passwordConfirm : ''
      if (update.length < 1 || confirm.length < 1) {
        return false
      }
      return update === confirm
    }
  },
  created () {
    const login = JSON.parse(window.localStorage.getItem('login'))
    this.loginUser.name = login.username
    this.loginUser.role = login.role
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
    onInput(event) {
      console.log(this.isMatchUpdateConfirm)
    },
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
  }
}
</script>

<style scoped lang="scss">
  h3.loginuser-profile {
    font-size: 1.2em;
    font-weight: bold;
    color: #999;
    margin-bottom: 20px;
  }

  legend.col-form-label.col-form-label-md.pt-0.test {
    font-size: 1.2em;
    font-weight: bold;
    color: #999;
  }
</style>