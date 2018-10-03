<template>
    <form class="form-signin" method="post" @submit.prevent="onSubmit">
        <div class="error-message">{{ message }}</div>
        <input type="text" v-model="userId" class="form-control" maxlength="20" placeholder="ID" />
        <input type="password" v-model="password" class="form-control" maxlength="20" placeholder="PASSWORD" />
        <button class="btn-lg btn-block" :class="btnClasses" type="submit"><i class="fa fa-sign-in" v-t="'label.login'"></i></button>
    </form>
</template>

<script>
import axios from 'axios'
import * as AuthHelper from '../sub/helper/AuthHelper'
import { APP,DISP } from '../sub/constant/config'
import * as Util from '../sub/util/Util'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  data() {
    return {
      userId: "",
      password: "",
      message: "",
      btnClasses: {
        'btn-primary': DISP.THEME === 'primary' || DISP.THEME === 'default',
        'btn-secondary': DISP.THEME === 'secondary',
        'btn-success': DISP.THEME === 'success',
        'btn-info': DISP.THEME === 'info',
        'btn-warning': DISP.THEME === 'warning',
        'btn-danger': DISP.THEME === 'danger',
        'btn-dark': DISP.THEME === 'dark',
      }
    }
  },
  methods: {
    onSubmit() {
      AuthHelper.setApp(this.$router, this.$store)
      AuthHelper.auth(this.userId, this.password, ()=>{
        this.$router.push(APP.TOP_PAGE)
        this.message = ""
        const theme = window.localStorage.getItem(this.userId + '-theme')
        this.replaceSetting({theme})
      },
      () => {
        console.error("failed")
        this.message = this.$i18n.t("message.loginFailed")
      })
    },
    ...mapMutations('app_service', [
      'replaceAS', 
    ]),
    ...mapMutations('setting', [
      'replaceSetting', 
    ]),
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

</style>