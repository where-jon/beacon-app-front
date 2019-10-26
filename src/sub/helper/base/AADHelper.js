import { MSTEAMS_APP } from '../../constant/config'
import AuthenticationContext from '../../adal'

const config = {
  clientId: MSTEAMS_APP.APP_ID,
  redirectUri: MSTEAMS_APP.REDIRECT_URL,
  // redirectUri: 'http://localhost:3000/azlogin',
  cacheLocation: 'localStorage',
  navigateToLoginRequestUrl: false,
  resourceId: 'https://graph.microsoft.com',
  loadFrameTimeout: 20000,
  popUp: true,
  displayCall: function (urlNavigate) {
    var popupWindow = window.open(urlNavigate, 'login', 'width=483, height=600')
    if (popupWindow && popupWindow.focus)
      popupWindow.focus()
    var registeredRedirectUri = this.redirectUri
    var pollTimer = window.setInterval(function () {
      if (!popupWindow || popupWindow.closed || popupWindow.closed === undefined) {
        window.clearInterval(pollTimer)
      }
      try {
        if (popupWindow.document.URL.indexOf(registeredRedirectUri) != -1) {
          window.clearInterval(pollTimer)
          window.location.hash = popupWindow.location.hash
          authContext.handleWindowCallback()
          popupWindow.close()
        }
      } catch (e) {
      }
    }, 20)
  }
}

if (window.navigator.userAgent.includes('Teams/')) {
  delete config.popUp
}

const authContext = new AuthenticationContext(config)

export const getToken = (cbIdToken, cbAccessToken) => {

  var user = authContext.getCachedUser()
  if (user) {
    console.log('user', user)
    const token = authContext.getCachedToken(config.clientId)
    if (token) {
      cbIdToken && cbIdToken(token, user)
    }
    else {
      authContext._renewIdToken((err, idToken) => {
        console.log('renewal', idToken)
        if (!err) {
          cbIdToken && cbIdToken(idToken, user)
          return
        }
        console.error('Renewal failed: ' + err)
      })  
    }
  }
  else {
    authContext.login()
  }

  authContext.handleWindowCallback()
  authContext.acquireToken(config.resourceId, (errorDesc, token, error) => {
    if (error) {
      console.error(error)
      if (config.popUp) {
        authContext.acquireTokenPopup(config.resourceId, null, null,  (errorDesc, token, error) => {
          if (error) {
            console.error(error)
            return
          }
          cbAccessToken && cbAccessToken(token)   
        })
      }
      else {
        authContext.acquireTokenRedirect(config.resourceId, null, null, (errorDesc, token, error, tokenType) => {
          if (error) {
            console.error(errorDesc, token, error, tokenType)
            return
          }
          cbAccessToken && cbAccessToken(token)
        })
      }
    }
    else {
      cbAccessToken && cbAccessToken(token)
    }
  })
}
