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

  // return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImFQY3R3X29kdlJPb0VOZzNWb09sSWgydGlFcyIsImtpZCI6ImFQY3R3X29kdlJPb0VOZzNWb09sSWgydGlFcyJ9.eyJhdWQiOiI4MDYwOWYxNC1kM2UyLTRiMGQtOGFiZC1lOTk3MDcwOTExZDciLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85ZWRiZTgwYy0yNzFjLTQ3ZTYtOGZlYS1mMjcxZDY0YTJkZTIvIiwiaWF0IjoxNTcxOTA2OTEwLCJuYmYiOjE1NzE5MDY5MTAsImV4cCI6MTU3MTkxMDgxMCwiYWlvIjoiNDJWZ1lGZ3lSV2dYWjBLeUlVdUUvNExKOGhaVFA4VGQxZTU4K2lGTGU2N2N4V21OMDh3QSIsImFtciI6WyJwd2QiXSwiZmFtaWx5X25hbWUiOiLopb_lsbEiLCJnaXZlbl9uYW1lIjoi5piM5byYIiwiaXBhZGRyIjoiMzkuMTEwLjIwNi44OSIsIm5hbWUiOiJtX25pc2hpeWFtYSIsIm5vbmNlIjoiNjQxODE5NWUtMzcwOS00YjBkLThiNTMtMzdlZDA1ZjY0NDMxIiwib2lkIjoiODJkOWVhMGEtNWY2ZC00ZDI5LThkNDItMjM0ZWMxYmJiMzlhIiwic3ViIjoiNTFtSW1TMHo1b3g3bTJhZUtibVJWemxwZEhOWEszZndxNlpRRnRad0VhYyIsInRpZCI6IjllZGJlODBjLTI3MWMtNDdlNi04ZmVhLWYyNzFkNjRhMmRlMiIsInVuaXF1ZV9uYW1lIjoibV9uaXNoaXlhbWFAd2hlcmUxMjMuanAiLCJ1cG4iOiJtX25pc2hpeWFtYUB3aGVyZTEyMy5qcCIsInV0aSI6IndSWnp4Q2hzTFVlaDAtSzk1THdXQUEiLCJ2ZXIiOiIxLjAifQ.lFqq8eeki6O2xh0CmLSjMLgBpUfT1lMdBOuNtZxFyGUjTaTOQqlOm9c4-Xu5B_r8sNbNOKYNevqKy0zrt6xIdB-jvFbpyHDqgqdbG6YjCfcLYMdHn1nzjIEzmBG_raCpQZ9MNsdbU2ks3p4I6cGUFpNpPob-l_NqYgDilwrAOdvc4UOwyWwC5d8325bLi3TbzvdfbZ24WraZYQZs2fjQfX2GmkobjvDygK2qEoP4xCpRLxMzHFLaFzQxlKvhoKcHfhDxQh_3UiHbbdvr0-jwNHzM7IKsc1MVRXXuVTVSh0uetL1X3kCrps2mAjUi1GhXogshfMSH6RM8BzDJLR3ehg'
  // const token = authContext.getCachedToken(config.clientId);
  // console.log('@@@@@@@@@@@@@@ cached token')
  // console.log(token )
  // if (token) {
  //   console.log(token)
  //   return token
  // }
  // authContext._renewIdToken(function (err, idToken) {
  //     if (!err) {
  //       console.log(idToken)
  //       return idToken
  //     }
  //     console.log("Renewal failed: " + err);
  // });
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