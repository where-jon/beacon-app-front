<template>
  <b-container fluid>
    <b-form-group>
      <b-row>
        <b-col cols="6" offset-md="1">
          {{ $t('config.MSTEAMS.USER_GUIDE1') }}<br />{{ $t('config.MSTEAMS.USER_GUIDE2') }}
        </b-col>
      </b-row>
    </b-form-group>
    <b-form-group>
      <b-row>
        <b-col cols="2"><label class="control-label float-right">{{ $t('label.tenantId') }}</label></b-col>
        <b-col cols="4"><input type="number" class="form-control" v-model="tenantId" /></b-col>
      </b-row>
    </b-form-group>
    <b-form-group>
      <b-row>
        <b-col cols="2"><label class="control-label float-right">{{ $t('label.tenant') }}</label></b-col>
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
  </b-container>
</template>

<script>
import * as AADHelper from '../sub/helper/base/AADHelper'
import * as AuthHelper from '../sub/helper/base/AuthHelper'
import { APP, MSTEAMS_APP } from '../sub/constant/config'

export default {
  data() {
    return {
      adminConsentUrl: MSTEAMS_APP.ADMINCONSENT_URL_BASE + '?client_id=' + MSTEAMS_APP.APP_ID + '&redirect_uri=' + MSTEAMS_APP.REDIRECT_URL,
      tenantId: null,
      tenantName: '',
    }
  },
  computed: {
    isInputTenantName() {
      return (this.tenantName.length > 5) && this.tenantId
    }
  },
  mounted() {
    try {
      const token = AADHelper.getToken()
      AuthHelper.setApp(this.$router, this.$store)
      AuthHelper.auth(token, 'password', async ()=>{
        // this.$router.push(APP.MENU.TOP_PAGE)
      },
      () => {
        console.error('failed')
      })
    } catch (e) {
      console.log('error ↓')
      console.log(e)
    }
  },
  methods: {
    office365Login() {
      location.href = this.adminConsentUrl
    }
  }
}

</script>