import axios from 'axios'
import { EXCLOUD, APP_SERVICE } from '../constant/config'
import * as AuthHelper from './AuthHelper'
import * as Util from '../util/Util'

let i18n

export const setApp = (pi18n) => {
  i18n = pi18n
}

const apServiceClient = axios.create({
    xsrfHeaderName: 'X-CSRF-Token',
    withCredentials: true
})

const exCloudClient = axios.create({ // when you access to excloud, withCredentials must be false
    xsrfHeaderName: 'X-CSRF-Token',
    withCredentials: EXCLOUD.withCredentials
})

const apFrontClient = axios.create({
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: true
})

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
  const keys = e.key.split(",")
  const vals = e.val.split(",")
  let newKeys = ""
  let newVals = ""

  for(let idx = 0; idx < keys.length; idx++){
    const key = Util.snake2camel(keys[idx].trim())
    if(key == "tenantId"){
      continue
    }
    if(newKeys.length != 0){
      newKeys = newKeys.concat(", ")
    }
    newKeys = newKeys.concat(i18n.tnl(`label.${key}`))
    if(newVals.length != 0){
      newVals = newVals.concat(", ")
    }
    newVals = newVals.concat(Util.snake2camel(vals[idx].trim()))
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
          e.type = message.includes("duplicate key")? "duplicate": message.includes("violates foreign key")? "foreignKey": ""
          if(e.type == "duplicate"){
            convertDuplicateErrorInfo(e)
          }
        }  
      }
      else if (e.response.data instanceof Array) { // bulk save failed
        e.bulkError = e.response.data
      }
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
