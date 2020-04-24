/**
 * AD認証に関するヘルパーモジュール
 * Teams環境で認証を行う
 * @module helper/base/AADHelper
 */

import * as microsoftTeams from '@microsoft/teams-js'
import { APP } from '../../constant/config'
import * as Util from '../../util/Util'

export const init = () => {
  microsoftTeams.initialize()
}

export const signIn = (successCallback, failureCallback) => {
  microsoftTeams.authentication.authenticate({
    url: window.location.origin + '/azlogin/start/',
    width: 600,
    height: 535,
    successCallback,
    failureCallback
  })
}

export const isTeamsApp = () =>  window.navigator.userAgent.includes('Teams/')

export const getCachedToken = () => {
  const expire = localStorage.getItem('aad.expire')
  Util.debug({expire})
  if (!expire || expire - new Date().getTime() < 0) {
    return null
  }
  const idtoken = localStorage.getItem('aad.id_token')
  Util.debug({idtoken})
  return idtoken
}

export const getContextForMobile = (callback) => {
  microsoftTeams.getContext((context) => {
    Util.debug({context})
    callback(context)
  })
}

export const getContext = () => {
  init()
  microsoftTeams.getContext((context) => {
    Util.debug({context})
    // Generate random state string and store it, so we can verify it in the callback
    let state = _guid() // _guid() is a helper function in the sample
    localStorage.setItem('aad.state', state)
    localStorage.removeItem('aad.error')
    // Go to the Azure AD authorization endpoint
    let queryParams = {
      client_id: APP.AUTH.APP_ID,
      response_type: 'id_token token',
      response_mode: 'fragment',
      resource: 'https://graph.microsoft.com',
      redirect_uri: window.location.origin + '/azlogin/end/',
      nonce: _guid(),
      state: state,
      // The context object is populated by Teams the loginHint attribute
      // is used as hinting information
      login_hint: context.loginHint,
    }
  
    let authorizeEndpoint = 'https://login.microsoftonline.com/' + context.tid + '/oauth2/authorize?' + toQueryString(queryParams)
    window.location.assign(authorizeEndpoint)
  })  
}

const toQueryString = (queryParams) => {
  let encodedQueryParams = []
  for (let key in queryParams) {
    encodedQueryParams.push(key + '=' + encodeURIComponent(queryParams[key]))
  }
  return encodedQueryParams.join('&')
}

const _decimalToHex = (number) => {
  var hex = number.toString(16)
  while (hex.length < 2) {
    hex = '0' + hex
  }
  return hex
}

const _guid = () => {
  var cryptoObj = window.crypto || window.msCrypto // for IE 11
  if (cryptoObj && cryptoObj.getRandomValues) {
    var buffer = new Uint8Array(16)
    cryptoObj.getRandomValues(buffer)
    //buffer[6] and buffer[7] represents the time_hi_and_version field. We will set the four most significant bits (4 through 7) of buffer[6] to represent decimal number 4 (UUID version number).
    buffer[6] |= 0x40 //buffer[6] | 01000000 will set the 6 bit to 1.
    buffer[6] &= 0x4f //buffer[6] & 01001111 will set the 4, 5, and 7 bit to 0 such that bits 4-7 == 0100 = '4'.
    //buffer[8] represents the clock_seq_hi_and_reserved field. We will set the two most significant bits (6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively.
    buffer[8] |= 0x80 //buffer[8] | 10000000 will set the 7 bit to 1.
    buffer[8] &= 0xbf //buffer[8] & 10111111 will set the 6 bit to 0.
    return _decimalToHex(buffer[0]) + _decimalToHex(buffer[1]) + _decimalToHex(buffer[2]) + _decimalToHex(buffer[3]) + '-' + _decimalToHex(buffer[4]) + _decimalToHex(buffer[5]) + '-' + _decimalToHex(buffer[6]) + _decimalToHex(buffer[7]) + '-' +
        _decimalToHex(buffer[8]) + _decimalToHex(buffer[9]) + '-' + _decimalToHex(buffer[10]) + _decimalToHex(buffer[11]) + _decimalToHex(buffer[12]) + _decimalToHex(buffer[13]) + _decimalToHex(buffer[14]) + _decimalToHex(buffer[15])
  }
  else {
    var guidHolder = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    var hex = '0123456789abcdef'
    var r = 0
    var guidResponse = ''
    for (var i = 0; i < 36; i++) {
      if (guidHolder[i] !== '-' && guidHolder[i] !== '4') {
        // each x and y needs to be random
        r = Math.random() * 16 | 0
      }
      if (guidHolder[i] === 'x') {
        guidResponse += hex[r]
      } else if (guidHolder[i] === 'y') {
        // clock-seq-and-reserved first hex is filtered and remaining hex values are random
        r &= 0x3 // bit and with 0011 to set pos 2 to zero ?0??
        r |= 0x8 // set pos 3 to 1 as 1???
        guidResponse += hex[r]
      } else {
        guidResponse += guidHolder[i]
      }
    }
    return guidResponse
  }      
}

export const tokenEnd = () => {
  init()
  localStorage.removeItem('aad.error')
  let hashParams = getHashParameters()
  if (hashParams['error']) {
    // Authentication/authorization failed
    localStorage.setItem('aad.error', JSON.stringify(hashParams))
    microsoftTeams.authentication.notifyFailure(hashParams['error'])
  } else if (hashParams['access_token']) {
    // Get the stored state parameter and compare with incoming state
    let expectedState = localStorage.getItem('aad.state')
    if (expectedState !== hashParams['state']) {
      // State does not match, report error
      localStorage.setItem('aad.error', JSON.stringify(hashParams))
      microsoftTeams.authentication.notifyFailure('StateDoesNotMatch')
    } else {
      // Success -- return token information to the parent page
      localStorage.setItem('aad.expire', new Date().getTime() + hashParams['expires_in'] * 1000)
      localStorage.setItem('aad.id_token', hashParams['id_token'])
      microsoftTeams.authentication.notifySuccess({
        idToken: hashParams['id_token'],
        accessToken: hashParams['access_token'],
        tokenType: hashParams['token_type'],
        expiresIn: hashParams['expires_in']
      })
    }
  } else {
    // Unexpected condition: hash does not contain error or access_token parameter
    localStorage.setItem('aad.error', JSON.stringify(hashParams))
    microsoftTeams.authentication.notifyFailure('UnexpectedFailure')
  }  
}

const getHashParameters = () => {
  let hashParams = {}
  location.hash.substr(1).split('&').forEach((item) => {
    let s = item.split('='),
      k = s[0],
      v = s[1] && decodeURIComponent(s[1])
    hashParams[k] = v
  })
  return hashParams
}

export const decodeJwt = (token) => {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(decodeURIComponent(escape(window.atob(base64))))
}
