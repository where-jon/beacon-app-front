import axios from 'axios'
import { EXCLOUD, APP_SERVICE } from '../constant/config'
import * as AuthHelper from './AuthHelper'
import * as Util from '../util/Util'

let i18n
let context

export const setApp = (pContext) => {
  i18n = pContext.app.i18n
  context = pContext
}

const apServiceClient = axios.create({
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: true
})

const axiosNoCrd = axios.create({
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: false
})

const exCloudClient = axios.create({ // when you access to excloud, withCredentials must be false
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: EXCLOUD.withCredentials
})

const apFrontClient = axios.create({
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: true
})

export const getAppServiceNoCrd = async (path, config, ignoreError) => {
  try {
    let res = await axiosNoCrd.get(APP_SERVICE.BASE_URL + path, config)
    return res.data
  } catch (e) {
    if (!ignoreError) {
      handleError(e, path)
    }
  }
}

export const getAppService = async (path, config, ignoreError) => {
  try {
    let res = await apServiceClient.get(APP_SERVICE.BASE_URL + path, config)
    return res.data
  } catch (e) {
    if (!ignoreError) {
      handleError(e, path)
    }
  }
}

export const deleteAppService = async (path, config) => {
  try {
    let res = await apServiceClient.delete(APP_SERVICE.BASE_URL + path)
    return res.data
  } catch (e) {
    handleError(e, path)
  }
}

export const getExCloud = async (url, config) => {
  try {
    let res = await exCloudClient.get(url, config)
    return res.data
  } catch (e) {
    handleError(e, url)
  }
}

export const postAppService = async (path, config) => {
  try {
    let res = await apServiceClient.post(APP_SERVICE.BASE_URL + path, config)
    return res.data
  } catch (e) {
    handleError(e, path)
  }
}

export const putAppService = async (path, config) => {
  try {
    let res = await apServiceClient.put(APP_SERVICE.BASE_URL + path, config)
    return res.data
  } catch (e) {
    handleError(e, path)
  }
}

export const postExCloud = async (url, config) => {
  try {
    let res = await exCloudClient.post(url, config)
    return res.data
  } catch (e) {
    handleError(e, url)
  }
}

const convertDuplicateErrorInfo = (e) => {
  const keys = e.key.split(',')
  const vals = e.val.split(',')
  let newKeys = ''
  let newVals = ''

  for(let idx = 0; idx < keys.length; idx++){
    const key = Util.snake2camel(keys[idx].trim())
    if(key == 'tenantId'){
      continue
    }
    if(newKeys.length != 0){
      newKeys = newKeys.concat(', ')
    }
    newKeys = newKeys.concat(i18n.tnl(`label.${key}`))
    if(newVals.length != 0){
      newVals = newVals.concat(', ')
    }
    newVals = newVals.concat(vals[idx].trim())
  }
  e.key = newKeys
  e.val = newVals
}

const handleError = (e, url) => {
  console.error({e, url})
  if (e.response && e.response.status == 401) {
    AuthHelper.logout()
  }
  else {
    if (e.response && e.response.data) {
      let message = e.response.data.message
      if (message) {
        let key = message.match(/Key \(([^\)]*)\)=\(([^\)]*)\)/)
        if (key && key[1]) {
          e.key = key[1]
          e.val = key[2]
          e.type = message.includes('duplicate key')? 'duplicate': message.includes('violates foreign key')? 'foreignKey': ''
          if(e.type == 'duplicate'){
            convertDuplicateErrorInfo(e)
          }
        }
        else if(message.match(/not found: Id=[0-9]+$/)){
          const token = message.split('=')
          e.type = 'bulkExistFailed'
          e.col = 'id'
          e.val = token[token.length - 1]
        }
      }
      else if (e.response.data instanceof Array) { // bulk save failed
        e.bulkError = e.response.data
      }
    }

    let ignore = !url.endsWith('/') && context.route.path.indexOf('/login') != -1 // Loginエラーでポップアップが表示されるのを防ぐ
    if (e.message && e.message == 'Network Error' && !ignore) {
      e.key = 'networkError'
      context.app.store.commit('replace', {error: e})
      context.app.router.app.$root.$emit('bv::show::modal', 'modalRootError')
    }
    throw e
  }
} 

export const getFronServerFile  = async (uri) => {
  try {
    let res = await apFrontClient.get(uri)
    return res.data
  } catch (e) {
    /* NOP */
  }
}
