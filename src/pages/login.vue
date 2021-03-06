<template>
  <form method="post" @submit.prevent="onSubmit">
    <div class=" form-signin error-message">
      {{ message }}
      <input v-model="userId" name="userId" type="text" class="form-control" placeholder="ID">
      <input v-model="password" name="password" type="password" class="form-control" maxlength="20" placeholder="PASSWORD">
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
import { mapState, mapMutations } from 'vuex'
import { APP, DISP } from '../sub/constant/config'
import * as DateUtil from '../sub/util/DateUtil'
import * as Util from '../sub/util/Util'
import * as AuthHelper from '../sub/helper/base/AuthHelper'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'
import * as StateHelper from '../sub/helper/dataproc/StateHelper'
import { getButtonTheme } from '../sub/helper/ui/ThemeHelper'
import * as ViewHelper from '../sub/helper/ui/ViewHelper'
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
      return getButtonTheme(false)
    },
    newsList() {
      return this.topNewsList.map(val => ({
        ...val,
        newsDate: DateUtil.formatDate(val.newsDate),
        content: Util.getValue(val, 'content', '').split('\n'),
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
        await StateHelper.load('topNews', false, { noApiKey: true })
        this.isNews = this.topNewsList.length > 0
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
      this.showProgress()
      AuthHelper.setApp(this.$router, this.$store)
      AuthHelper.auth(this.userId, this.password, async ()=>{
        this.$router.push(APP.MENU.TOP_PAGE)
        this.message = ''
        const theme = LocalStorageHelper.getLocalStorage(this.userId + '-theme')
        const charSet = LocalStorageHelper.getLocalStorage(this.userId + '-charSet')
        this.replaceSetting({theme, charSet})
        this.hideProgress()
      },
      () => {
        console.error('failed')
        this.message = this.$i18n.tnl('message.loginFailed')
        this.hideProgress()
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
