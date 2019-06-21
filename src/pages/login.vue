<template>
  <form method="post" @submit.prevent="onSubmit">
    <div class=" form-signin error-message">
      {{ message }}
      <input v-model="userId" type="text" class="form-control" maxlength="20" placeholder="ID">
      <input v-model="password" type="password" class="form-control" maxlength="20" placeholder="PASSWORD">
      <b-button :variant="theme" class="btn-lg btn-block" type="submit">
        <font-awesome-icon icon="sign-in-alt" />&nbsp;&nbsp;{{ $i18n.tnl('label.login') }}
      </b-button>
    </div>
    <div v-if="isNews" class="container">
      <news-table :headers="headers" :datas="newsList" :class="tdClass" />
    </div>
  </form>
</template>

<script>
import * as Util from '../sub/util/Util'
import { mapState } from 'vuex'
import * as ViewHelper from '../sub/helper/ViewHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import { mapMutations } from 'vuex'
import * as AuthHelper from '../sub/helper/AuthHelper'
import { getButtonTheme } from '../sub/helper/ThemeHelper'
import { APP,DISP } from '../sub/constant/config'
import commonmixinVue from '../components/mixin/commonmixin.vue'
import newsTable from '../components/parts/newstable.vue'

export default {
  components: {
    newsTable,
  },
  mixins: [commonmixinVue],
  props: {
    isDev: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isNews:true,
      headers: ViewHelper.addLabelByKey(this.isDev? null: this.$i18n, [
        { key: 'newsDate' , label: 'newsDt'},
        { key: 'content', label: 'newsContent'},
      ]),
      userId: '',
      password: '',
      message: '',
      tenantAction: false,
      btnClasses: {
        'btn-primary': DISP.MENU.THEME === 'primary' || DISP.MENU.THEME === 'default',
        'btn-secondary': DISP.MENU.THEME === 'secondary',
        'btn-success': DISP.MENU.THEME === 'success',
        'btn-info': DISP.MENU.THEME === 'info',
        'btn-warning': DISP.MENU.THEME === 'warning',
        'btn-danger': DISP.MENU.THEME === 'danger',
        'btn-dark': DISP.MENU.THEME === 'dark',
      },
    }
  },
  computed: {
    ...mapState('app_service', [
      'newsList',
      'topNewsList',
    ]),
    theme() {
      return getButtonTheme()
    },
    newsList() {
      return this.topNewsList.map((val) => ({
        ...val,
        newsDate: Util.formatDate(val.newsDate),
        content: val.content,
      }))
    },
  },
  mounted() {
    this.fetchData()
    if (!this.isDev) {
      return
    }
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('topNews')
        this.topNewsList.length > 0 ?this.isNews = true: this.isNews = false
        if (payload && payload.done) {
          payload.done()
        }
      }
      catch(e) {
        console.error(e)
      }
      this.hideProgress()
    },
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
    ...mapMutations([
      'replace', 
    ]),
    onSubmit() {
      AuthHelper.setApp(this.$router, this.$store)
      AuthHelper.auth(this.userId, this.password, async ()=>{
        this.$router.push(APP.MENU.TOP_PAGE)
        this.message = ''
        const theme = window.localStorage.getItem(this.userId + '-theme')
        const charSet = window.localStorage.getItem(this.userId + '-charSet')
        this.replace({pass: this.password})
        this.replaceSetting({theme, charSet})
      },
      () => {
        console.error('failed')
        this.message = this.$i18n.tnl('message.loginFailed')
      })
    },
    tdClass(key) {
      return key === 'newsDate' ? 'news-date' : ''
    },
  },
}

</script>

<style scoped lang="scss">

body {
  background-color: #eee;
}

.error-message {
  color: red;
}

.form-signin {
  max-width: 400px;
  padding: 15px;
  margin: 0 auto;
  .form-control {
    position: relative;
    height: auto;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 10px;
    font-size: 16px;
    &:focus {
      z-index: 2;
    }
  }
  input[type="text"], input[type="password"] {
    margin-bottom: 10px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.login-button {
  background-color: #376495;
  color: white;
}

</style>
