<template>
  <b-container fluid>
    <div v-if="notRegistered">
      <b-form-group>
        <b-row>
          <b-col cols="6" offset-md="1">
            {{ $t('config.MSTEAMS.USER_GUIDE1') }}<br />{{ $t('config.MSTEAMS.USER_GUIDE2') }}
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
            <button class="btn btn-primary btn-large" :disabled="!isInputTenantName" @click="office365Login">{{ $t('label.office365login') }}</button>
          </b-col>
        </b-row>
      </b-form-group>
    </div>
    <div v-if="disabled">{{ $t('config.MSTEAMS.INVALID_TENANT') }}<br />{{ $t('config.MSTEAMS.INVALID_TENANT_CONTACT') }}</div>
    <div v-if="notShown">
      <div v-html="$t('config.MSTEAMS.IF_NOT_SHOWN')"></div><br/>
      <div><a href="#" @click="signIn">Sign In</a></div>
      <a href="#" onclick='location.reload();'>{{ $t('label.reload') }}</a>
    </div>
  </b-container>
</template>

<script>
import * as AADHelper from '../../sub/helper/base/AADHelper'
// import * as MsalHelper from '../../sub/helper/base/MsalHelper'
import * as AuthHelper from '../../sub/helper/base/AuthHelper'
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import { APP, MSTEAMS_APP } from '../../sub/constant/config'
import { TENANT } from '../../sub/constant/Constants'

export default {
  data() {
    return {
      adminConsentUrl: MSTEAMS_APP.ADMINCONSENT_URL_BASE + '?client_id=' + MSTEAMS_APP.APP_ID + '&redirect_uri=' + MSTEAMS_APP.REDIRECT_URL,
      tenantName: '',
      notRegistered: false,
      disabled: false,
      invalidToken: false,
      hasToken: false
    }
  },
  computed: {
    isInputTenantName() {
      return this.tenantName && this.tenantName.length > 0
    },
    notShown() {
      return !this.notRegistered && !this.disabled && !this.invalidToken
    }
  },
  mounted() {
    console.log('@@@@@@@@@@@@@@@@@ azLogin')
    AADHelper.init()
    this.tenantName = this.tenantName || LocalStorageHelper.popLocalStorage('tenantName')
    APP.MENU.LOGIN_PAGE = APP.MENU.AZLOGIN_PAGE
  },
  methods: {
    signIn() {
      console.log('azLogin SignIn')
      try {
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
      } catch (e) {
        console.error('azlogin error', e)
        this.invalidToken = true
      }
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
          AuthHelper.auth(idToken, 'password',
            ()=>{
              this.$router.push(APP.MENU.TOP_PAGE)
            },
            (e)=>{
              console.error(e)
            }
          )
          break
        case TENANT.STATUS.NOT_REGISTERED:
          this.notRegistered = true
          break
        case TENANT.STATUS.DISABLED:
          this.disabled = true
          break
        default:
          this.invalidToken = true
      }
    },
    office365Login() {
      LocalStorageHelper.setLocalStorage('tenantName', this.tenantName)
      location.href = this.adminConsentUrl
    }
  }
}

</script>