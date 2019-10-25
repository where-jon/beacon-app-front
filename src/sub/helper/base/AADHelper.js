import { MSTEAMS_APP } from '../../constant/config'
import AuthenticationContext from '../../adal'

const config = {
  clientId: MSTEAMS_APP.APP_ID,
  redirectUri: MSTEAMS_APP.REDIRECT_URL,
  // redirectUri: 'http://localhost:3000/azlogin',
  cacheLocation: "localStorage",
  navigateToLoginRequestUrl: false,
  resourceId: 'https://graph.microsoft.com',
  loadFrameTimeout: 20000,
  // popUp: true
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

  config.callback = (errorDesc, token, error, tokenType) => {
    console.error(errorDesc, token, error, tokenType)
    cbAccessToken(token)
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
        authContext.acquireTokenRedirect(config.resourceId, null, null)
      }
    }
    else {
      cbAccessToken && cbAccessToken(token)
    }
  })
}
