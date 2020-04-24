
/**
 * Microsoft Authentication Libraryに関するヘルパーモジュール
 * 非Teams環境でAD認証を行う
 * @module helper/base/MsalHelper
 */

import * as Msal from 'msal'
import { APP } from '../../constant/config'
import { Date } from 'core-js'
import * as Util from '../../util/Util'

const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read']
}

// instantiate MSAL
let myMSALObj

export const init = () => {
  console.log('msal initi', APP.AUTH.APP_ID)
  myMSALObj = new Msal.UserAgentApplication({
    auth: {
      clientId: APP.AUTH.APP_ID,
      authority: 'https://login.microsoftonline.com/common',
      validateAuthority: true
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  })

  // register callback for redirect usecases
  myMSALObj.handleRedirectCallback((error, response) => {
    if (error) {
      console.log(error)
    } else {
      if (response.tokenType === 'id_token') {
        Util.debug(response)
      }
      else {
        Util.debug('token type is:' + response.tokenType)
      }
    }
  })
}


// signin and acquire a token silently with POPUP flow. Fall back in case of failure with silent acquisition to popup
export const signIn = (callback) => {
  console.log('msal siginIn')
  myMSALObj.loginPopup(loginRequest).then((loginResponse) => {
    //Login Success
    console.debug(loginResponse)
    const account = myMSALObj.getAccount()
    if (account) {// avoid duplicate code execution on page load in case of iframe and popup window.
      console.debug(account)
      callback(account.idToken, account.userName)
    }
    else {
      console.error('get account failed')
    }
  }).catch((error) => {
    console.log(error)
  })
}


// signout
export const signOut = () => {
  myMSALObj.logout()
}

export const getCachedToken = () => {
  // Browser check variables
  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')
  const msie11 = ua.indexOf('Trident/')
  // const msedge = ua.indexOf('Edge/')
  const isIE = msie > 0 || msie11 > 0
  // const isEdge = msedge > 0

  //If you support IE, our recommendation is that you sign-in using Redirect APIs
  //If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
  if (isIE) {
    myMSALObj.loginRedirect(loginRequest)
  }
  const account = myMSALObj.getAccount()
  if (account && (!isIE || !myMSALObj.isCallback(window.location.hash))) {// avoid duplicate code execution on page load in case of iframe and popup window.
    console.debug(account)
    if (account.idToken.exp * 1000 < new Date().getTime()) {
      console.warn('id token exipired')
      return null
    }
    return account.idToken
  }
}
