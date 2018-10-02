
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
          <h3 class="loginuser-profile">ログインユーザ・プロフィール</h3>
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
              <b-form-select v-model="selectedTheme" :options="theme" class="mb-3" @change="themeSelected"/>
            </b-form-group>
            <b-form-group>
              <b-button type="button" :variant="getTheme" class="btn-block" v-t="'label.changePassword'" />
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import breadcrumb from '../../../components/breadcrumb.vue'
import { DISP, THEME } from '../../../sub/constant/config'
import { getTheme, getButtonTheme } from '../../../sub/helper/ThemeHelper'

export default {
  components: {
    breadcrumb,
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
      selectedTheme: null,
      theme: [],
      loginUser: {
        loginId: this.loginId,
        name: null,
        role: null
      }
    }
  },
  computed: {
    loginId () {
      return this.$store.state.loginId
    },
    getTheme() {
      const storeTheme = this.$store.state.setting.theme
      return 'outline-' + getButtonTheme(this.loginId)
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
    this.theme = THEME.map((e) => {
        return { value: e.id, text: e.label }
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

  fieldset.change-password {
    border: 1px solid black;
  }
</style>