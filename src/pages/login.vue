<template>
  <form class="form-signin" method="post" @submit.prevent="onSubmit">
    <div class="error-message">
      {{ message }}
    </div>
    <input v-model="userId" type="text" class="form-control" maxlength="20" placeholder="ID">
    <input v-model="password" type="password" class="form-control" maxlength="20" placeholder="PASSWORD">
    <b-button :variant="theme" class="btn-lg btn-block" type="submit">
      <i class="fas fa-sign-in-alt" />&nbsp;&nbsp;{{ $i18n.tnl('label.login') }}
    </b-button>
    <div v-if="isNews">
      <m-list :params="params" :list="newsList" />
    </div>
  </form>
</template>

<script>
import mList from '../components/page/list.vue'
import * as Util from '../sub/util/Util'
import { mapState } from 'vuex'
import breadcrumb from '../components/layout/breadcrumb.vue'
import * as ViewHelper from '../sub/helper/ViewHelper'
import * as StateHelper from '../sub/helper/StateHelper'
import { mapMutations } from 'vuex'
import * as AuthHelper from '../sub/helper/AuthHelper'
import { getButtonTheme } from '../sub/helper/ThemeHelper'
import { APP,DISP } from '../sub/constant/config'
import commonmixinVue from '../components/mixin/commonmixin.vue'

export default {
  components: {
    mList,
    breadcrumb
  },
  mixins: [commonmixinVue],
  data() {
    return {
      isNews:true,
      newsList: [],
      appServicePath: '/signin',
      userId: '',
      password: '',
      message: '',
      tenantAction: false,
      btnClasses: {
        'btn-primary': DISP.THEME === 'primary' || DISP.THEME === 'default',
        'btn-secondary': DISP.THEME === 'secondary',
        'btn-success': DISP.THEME === 'success',
        'btn-info': DISP.THEME === 'info',
        'btn-warning': DISP.THEME === 'warning',
        'btn-danger': DISP.THEME === 'danger',
        'btn-dark': DISP.THEME === 'dark',
      },
      params: {
        name: 'news',
        fields: ViewHelper.addLabelByKey(this.$i18n, [
          {key: 'newsDate', sortable: true },
          {key: 'content', sortable: true }
        ]),
      },
      initTotalRows: this.$store.state.app_service.news.length,
      items: ViewHelper.createBreadCrumbItems('test', 'osirase'),
    }
  },
  computed: {
    ...mapState('app_service', [
      'news',
      'forceFetchNews',
    ]),
    theme() {
      return getButtonTheme()
    },
  },
  methods: {
    async fetchData(payload) {
      try {
        this.showProgress()
        await StateHelper.load('news')
        //await StateHelper.load('news', this.forceFetchNews)
        //StateHelper.setForceFetch('news', false)
        console.log('this.isRegistable::' + this.isRegistable)
        this.newsList = this.news.map((val) => ({
          ...val,
          //newsId: val.newsId,
          newsDate: Util.formatDate(val.newsDate),
          content: val.content,
        })) // omit images to avoid being filtering target
        this.newsList.length > 0 ?this.isNews = true: this.isNews = false
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
      AuthHelper.auth(this.userId, this.password, ()=>{
        this.$router.push(APP.TOP_PAGE)
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
