import axios from 'axios'
import { EXCLOUD, APP_SERVICE } from '../constant/config'
import * as AuthHelper from './AuthHelper'

const apServiceClient = axios.create({
    xsrfHeaderName: 'X-CSRF-Token',
    withCredentials: true
})

const exCloudClient = axios.create({ // when you access to excloud, withCredentials must be false
    xsrfHeaderName: 'X-CSRF-Token',
    withCredentials: EXCLOUD.withCredentials
})

export const getAppService = async (path, config) => {
  try {
    let res = await apServiceClient.get(APP_SERVICE.BASE_URL + path)
    return res.data
  } catch (e) {
    handleError(e, path)
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

export const postExCloud = async (url, config) => {
  try {
    let res = await exCloudClient.poset(url, config)
    return res.data
  } catch (e) {
    handleError(e, url)
  }
}

const handleError = (e, url) => {
  console.error({e, url})
  if (e.response && e.response.status == 401) {
    AuthHelper.logout()
  }
  else {
    let message = e.response? e.response.data? e.response.data.message: "": ""
    let key = message.match(/Key \(([^\)]*)\)=\(([^\)]*)\)/)
    if (key && key[1]) {
      e.key = key[1]
      e.val = key[2]
      e.type = message.includes("duplicate key")? "duplicate": message.includes("violates foreign key")? "foreignKey": ""
    }
    throw e
  }
} 

