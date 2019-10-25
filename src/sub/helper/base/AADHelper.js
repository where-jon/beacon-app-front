import { MSTEAMS_APP } from '../../constant/config'
import AuthenticationContext from '../../adal'

const config = {
  clientId: MSTEAMS_APP.APP_ID,
  redirectUri: MSTEAMS_APP.REDIRECT_URL,
  // redirectUri: 'http://localhost:3000/azlogin',
  cacheLocation: "localStorage",
  navigateToLoginRequestUrl: false,
  resourceId: 'https://graph.microsoft.com',
  // popUp: true
}

const authContext = new AuthenticationContext(config)

export const getToken = (cbIdToken, cbAccessToken) => {

  var user = authContext.getCachedUser()
  if (user) {
    console.error('user', user)
    const token = authContext.getCachedToken(config.clientId)
    if (token) {
      cbIdToken && cbIdToken(token)
    }
    else {
      authContext._renewIdToken((err, idToken) => {
        console.log('renewal', idToken)
        if (!err) {
          cbIdToken && cbIdToken(idToken)
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

export const getIdToken = async () => {
  return new Promise((resolve, reject) => {
    const user = authContext.getCachedUser()
    authContext.handleWindowCallback()
    authContext.acquireToken(config.clientId, (error, token) => {
      if (!error) {
        resolve(token)
      } else {
        reject(error)
      }
    })
    // authContext.acquireToken('https://graph.microsoft.com', (error, token) => {
    //   if (!error) {
    //     resolve(token)
    //   } else {
    //     reject(error)
    //   }
    // })
  })
}