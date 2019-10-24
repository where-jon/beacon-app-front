import { MSTEAMS_APP } from '../../constant/config'
import AuthenticationContext from '../../adal'

const config = {
  clientId: MSTEAMS_APP.APP_ID,
  // redirectUri: MSTEAMS_APP.REDIRECT_URL,
  redirectUri: 'http://localhost:3000/main/position',
  cacheLocation: "localStorage",
  navigateToLoginRequestUrl: false,
}
const authContext = new AuthenticationContext(config)

export const getToken = () => {
  // この2つを事前にやらないとトークンが取得できない糞仕様
  const user = authContext.getCachedUser()
  authContext.handleWindowCallback()

  const token = authContext.getCachedToken(config.clientId);
  if (token) {
    return token
  }
  authContext._renewIdToken(function (err, idToken) {
      if (!err) {
        return idToken
      }
      console.log("Renewal failed: " + err);
  });
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