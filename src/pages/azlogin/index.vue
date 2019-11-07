<template>
  <b-container fluid>
    <div v-if="notRegistered">
      <b-form-group>
        <b-row>
          <b-col cols="6" offset-md="1">
            {{ $t('message.MSTEAMS.USER_GUIDE1') }}<br />{{ $t('message.MSTEAMS.USER_GUIDE2') }}
          </b-col>
        </b-row>
      </b-form-group>
      <b-form-group>
        <b-row>
          <b-col cols="2"><label class="control-label float-right">{{ $t('label.tenantName') }}</label></b-col>
          <b-col cols="4"><input type="text" class="form-control" maxlength="64" v-model="tenantName" /></b-col>
        </b-row>
      </b-form-group>
      <b-form-group>
        <b-row>
          <b-col cols="2" offset-md="3">
            <button class="btn btn-primary btn-large" :disabled="!isInputTenantName" @click="adminConsent">{{ $t('label.adminConsent') }}</button>
          </b-col>
        </b-row>
      </b-form-group>
    </div>
    <div v-if="disabled">{{ $t('message.MSTEAMS.INVALID_TENANT') }}<br />{{ $t('message.MSTEAMS.INVALID_TENANT_CONTACT') }}</div>
    <div v-if="!finishInit"><br />{{ $t('message.MSTEAMS.WAIT_A_MOMENT') }}</div>
    <div v-if="notShown">
      <p></p>
      <div v-html="$t('message.MSTEAMS.IF_NOT_SHOWN')"></div><br/>
      <button @click="signIn" class="button-windowslive">
        <div class="button-icon"></div>
        <div class="button-text">
          <span>Sign In with Microsoft</span>
        </div>
      </button>
    </div>
  </b-container>
</template>

<script>
import * as AADHelper from '../../sub/helper/base/AADHelper'
import * as MsalHelper from '../../sub/helper/base/MsalHelper'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import * as BrowserUtil from '../../sub/util/BrowserUtil'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import { APP, MSTEAMS_APP } from '../../sub/constant/config'
import { TENANT } from '../../sub/constant/Constants'

export default {
  data() {
    return {
      tenantName: '',
      notRegistered: false,
      disabled: false,
      invalidToken: false,
      finishInit: false,
      hasToken: false
    }
  },
  computed: {
    isInputTenantName() {
      return this.tenantName && this.tenantName.length > 0
    },
    notShown() {
      return this.finishInit && !this.notRegistered && !this.disabled && !this.invalidToken
    }
  },
  mounted() {
    console.log('@@@@@@@@@@@@@@@@@ azLogin')
    this.tenantName = this.tenantName || LocalStorageHelper.popLocalStorage('tenantName')
    APP.MENU.LOGIN_PAGE = APP.MENU.AZLOGIN_PAGE
    let token
    if (BrowserUtil.inIframe())  { // Teams内での表示
      token = AADHelper.getCachedToken()
    }
    else {
      MsalHelper.init()
      token = MsalHelper.getCachedToken() && localStorage.getItem('msal.idtoken')
    }
    if (token) {
      this.afterGetToken(token)        
    }
    else {
      AADHelper.init()
      this.finishInit = true
    }
  },
  methods: {
    signIn() {
      console.log('azLogin SignIn. inIframe=', BrowserUtil.inIframe(), 'isMobile=', BrowserUtil.isMobile())
      alert('azLogin SignIn. inIframe=' + BrowserUtil.inIframe() + ' isMobile=' + BrowserUtil.isMobile())
      if (BrowserUtil.isMobile() && AADHelper.isTeamsApp()) { // Teamsアプリモバイル版の場合
        this.mobileLogin()
      }
      if (BrowserUtil.inIframe()) { // Teams内での表z示
        AADHelper.signIn(
          (result) => {
            console.log(result)
            this.afterGetToken(result.idToken)
          },
          (reason) => {
            console.error(reason)
            this.invalidToken = true
          }
        )
      }
      else { // Webページでの表示
        MsalHelper.signIn((token, user) => {
          this.afterGetToken(localStorage.getItem('msal.idtoken'))
        })
      }
    },
    mobileLogin() {
      AADHelper.getContextForMobile((context) => {
        alert(context.tid)
        AuthHelper.auth('MOBILE:' + JSON.stringify(context), 'password',
          ()=>{
            this.$router.push(APP.MENU.TOP_PAGE)
          },
          (e)=>{
            console.error(e)
          }
        )
      })
    },
    async afterGetToken(idToken) {
      this.hasToken = true
      AuthHelper.setApp(this.$router, this.$store)
      let tenantStatus = await AuthHelper.getADTenantStatus(idToken)
      if (tenantStatus == TENANT.STATUS.NOT_REGISTERED && location.search.includes('admin_consent=True')) {
          tenantStatus = await AuthHelper.getADTenantStatus(idToken, 1, this.tenantName)
      }
      switch (tenantStatus) {
        case TENANT.STATUS.REGISTERED:
          await AuthHelper.auth(idToken, 'password',
            ()=>{
              this.$router.push(APP.MENU.TOP_PAGE)
            },
            (e)=>{
              console.error(e)
            }
          )
          break
        case TENANT.STATUS.NOT_REGISTERED:
          this.finishInit = true
          this.notRegistered = true
          break
        case TENANT.STATUS.DISABLED:
          this.finishInit = true
          this.disabled = true
          break
        default:
          this.finishInit = true
          this.invalidToken = true
      }
    },
    adminConsent() {
      LocalStorageHelper.setLocalStorage('tenantName', this.tenantName)
      const left = (screen.width - 600) / 2
      const top = ( screen.height - 535) / 2
      const adminConsentUrl = MSTEAMS_APP.ADMINCONSENT_URL_BASE + '?client_id=' + MSTEAMS_APP.APP_ID + '&redirect_uri=' + MSTEAMS_APP.REDIRECT_URL
      var popupWindow = window.open(adminConsentUrl, 'Admin consent', "width=600, height=535, top= " + top + ", left=" + left)
      if (!popupWindow) {
          console.error('window open error')
          alert('Opening popupWindow failed.')
          return
      }
      if (popupWindow.focus) {
          popupWindow.focus()
      }
    }
  }
}

</script>

<style scoped>

.button-windowslive {
  border: 0;
  padding: 0;
  display: inline-block;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 3px;
  background-clip: padding-box;
  position: relative;
  width: 250px;
  height: 50px;
  margin: 0 8px 8px;
  background-color: #00a1f1; 
}

.button-icon {
  width: 50px;
  height: 50px;
  top: 0;
  background: rgba(0,0,0,.3);
  position: absolute;
  background-repeat: no-repeat;
  background-size: 50%;
  background-position: 50%;
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDY0IDY0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy40ICgxNTU4OCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+d2luZG93czwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHNrZXRjaDp0eXBlPSJNU1BhZ2UiPgogICAgICAgIDxnIGlkPSJ3aW5kb3dzIiBza2V0Y2g6dHlwZT0iTVNMYXllckdyb3VwIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLjA0NSwwLjA0NSBMMjguNzQ3LDAuMDQ1IEwyOC43NDcsMjguNzQ3IEwwLjA0NSwyOC43NDcgTDAuMDQ1LDAuMDQ1IEwwLjA0NSwwLjA0NSBaIiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNC40MywwLjA0NSBMNjMuMTMyLDAuMDQ1IEw2My4xMzIsMjguNzQ3IEwzNC40MywyOC43NDcgTDM0LjQzLDAuMDQ1IEwzNC40MywwLjA0NSBaIiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC43NDgsMzUuMjU0IEwyOC43NDgsNjMuOTU2IEwwLjA0Niw2My45NTYgTDAuMDQ2LDM1LjI1NCBMMjguNzQ4LDM1LjI1NCBMMjguNzQ4LDM1LjI1NCBaIiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0zNC40MywzNS4yNTQgTDYzLjEzMiwzNS4yNTQgTDYzLjEzMiw2My45NTYgTDM0LjQzLDYzLjk1NiBMMzQuNDMsMzUuMjU0IEwzNC40MywzNS4yNTQgWiIgaWQ9IlNoYXBlIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==")
}

.button-text {
  box-sizing: border-box;
  width: 100%;
  padding: 5px 15px 5px 68px;
  line-height: 40px;
  text-align: left;
  font-size: 14px;
  letter-spacing: .7px;
  color: #fff;
  transition: background .3s;
  -webkit-transition: background .3s;
}
</style>>