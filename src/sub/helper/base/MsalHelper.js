
import * as Msal from 'msal'

// initialize MSAL
const msalConfig = {
  auth: {
    clientId: 'fcfc143f-c8c8-454e-ab72-fdf2e49f862f',
    authority: 'https://login.microsoftonline.com/common',
    validateAuthority: true
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
}

const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read']
}

// instantiate MSAL
const myMSALObj = new Msal.UserAgentApplication(msalConfig)

// register callback for redirect usecases
myMSALObj.handleRedirectCallback((error, response) => {
  if (error) {
    console.log(error)
  } else {
    if (response.tokenType === 'id_token') {
      console.log(response)
    }
    else {
      console.log('token type is:' + response.tokenType)
    }
  }
})

// signin and acquire a token silently with POPUP flow. Fall back in case of failure with silent acquisition to popup
export const signIn = () => {
  myMSALObj.loginPopup(loginRequest).then((loginResponse) => {
    //Login Success
    console.log(loginResponse)
    console.log(myMSALObj.getAccount().userName)
  }).catch((error) => {
    console.log(error)
  })
}


// signout
export const signOut = () => {
  myMSALObj.logout()
}

export const init = () => {
  // Browser check variables
  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')
  const msie11 = ua.indexOf('Trident/')
  const msedge = ua.indexOf('Edge/')
  const isIE = msie > 0 || msie11 > 0
  const isEdge = msedge > 0

  //If you support IE, our recommendation is that you sign-in using Redirect APIs
  //If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
  if (!isIE) {
    if (myMSALObj.getAccount()) {// avoid duplicate code execution on page load in case of iframe and popup window.
      console.log(myMSALObj.getAccount())
    }
  }
  else {
    myMSALObj.loginRedirect(loginRequest)
    if (myMSALObj.getAccount() && !myMSALObj.isCallback(window.location.hash)) {// avoid duplicate code execution on page load in case of iframe and popup window.
      console.log(myMSALObj.getAccount())
    }
  }
}
