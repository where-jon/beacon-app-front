import axios from 'axios'
import { EXCLOUD, APP_SERVICE } from '../constant/config'
import * as AuthHelper from './AuthHelper'
import * as ImageHelper from './ImageHelper'
import * as Util from '../util/Util'
import * as StringUtil from '../util/StringUtil'
import md5 from 'md5'

let i18n
let context
let apiKey

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pContext
 */
export const setApp = pContext => {
  i18n = pContext.app.i18n
  context = pContext
}

/**
 * APIキーを設定する。
 * @method
 * @param {String} pApiKey 
 */
export const setApiKey = pApiKey => {
  apiKey = pApiKey
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

/**
 * axiosの設定にAPIキーを付与する。
 * @method
 * @param {Object} [config = {}] axiosの設定
 * @return {Object}
 */
const addApiKey = (config = {}) => {
  if (!context) {
    return config
  }
  if (config === false) {
    return null
  }
  if (!config.headers) {
    config.headers = {}
  }
  if (apiKey || context.app.store.state.apiKey) {
    config.headers.apiKey = md5(apiKey || context.app.store.state.apiKey)
  }
  return config
}

/**
 * GETリクエストを送信する。
 * @method
 * @async
 * @param {String} path 
 * @param {Object} config axiosの設定
 * @param {Boolean} ignoreError 
 * @return {Any}
 */
export const getAppServiceNoCrd = async (path, config, ignoreError) => {
  try {
    let res = await axiosNoCrd.get(APP_SERVICE.BASE_URL + addTimeToPath(path), addApiKey(config))
    return res.data
  } catch (e) {
    if (!ignoreError) {
      handleError(e, path)
    }
  }
}

/**
 * GETリクエストを送信する。
 * @method
 * @async
 * @param {String} path 
 * @param {Object} config axiosの設定
 * @param {Boolean} ignoreError 
 * @return {Any}
 */
export const getAppService = async (path, config, ignoreError) => {
  try {
    let res = await apServiceClient.get(APP_SERVICE.BASE_URL + addTimeToPath(path), addApiKey(config))
    return res.data
  } catch (e) {
    if (!ignoreError) {
      handleError(e, path)
    }
  }
}

/**
 * DELETEリクエストを送信する。
 * @method
 * @async
 * @param {String} path 
 * @param {Object} config axiosの設定
 * @return {Any}
 */
export const deleteAppService = async (path, config) => {
  try {
    let res = await apServiceClient.delete(APP_SERVICE.BASE_URL + path, addApiKey(config))
    return res.data
  } catch (e) {
    handleError(e, path)
  }
}

/**
 * EXCloudにGETリクエストを送信する。
 * @method
 * @async
 * @param {String} url 
 * @param {Objext} config axiosの設定
 * @return {Any}
 */
export const getExCloud = async (url, config) => {
  try {
    let res = await exCloudClient.get(url, addApiKey(config))
    return res.data
  } catch (e) {
    handleError(e, url)
  }
}

/**
 * POSTリクエストを送信する。
 * @method
 * @async
 * @param {String} path 
 * @param {Object} param 
 * @param {Object} config axiosの設定
 * @return {Any}
 */
export const postAppService = async (path, param, config) => {
  try {
    let res = await apServiceClient.post(APP_SERVICE.BASE_URL + path, param, addApiKey(config))
    return res.data
  } catch (e) {
    handleError(e, path)
  }
}

/**
 * PUTリクエストを送信する。
 * @method
 * @async
 * @param {String} path 
 * @param {Object} param 
 * @param {Object} config axiosの設定
 * @return {Any}
 */
export const putAppService = async (path, param, config) => {
  try {
    let res = await apServiceClient.put(APP_SERVICE.BASE_URL + path, param, addApiKey(config))
    return res.data
  } catch (e) {
    handleError(e, path)
  }
}

/**
 * EXCloudにPOSTリクエストを送信する。
 * @method
 * @async
 * @param {String} url 
 * @param {Object} param 
 * @param {Object} config axiosの設定
 * @return {Any}
 */
export const postExCloud = async (url, param, config) => {
  try {
    let res = await exCloudClient.post(url, param, addApiKey(config))
    return res.data
  } catch (e) {
    handleError(e, url)
  }
}

/**
 * GETリクエストのクエリパラメータを作成する。
 * @method
 * @param {Object} e 送信クエリをまとめたオブジェクト
 * @param {Boolean} withoutNull null値を含める
 * @return {String}
 */
export const toParam = (e, withoutNull) => {
  return _(e).map((val, key) => {
    if (val == null && withoutNull) {
      return null
    }
    return key + '=' + val
  }).compact().value().join('&')
}

/**
 * 重複キーによるエラーの内容を整形する。
 * @method
 * @param {Error} e 
 */
const convertDuplicateErrorInfo = e => {
  const keys = e.key.split(',')
  const vals = e.val.split(',')
  let newKeys = ''
  let newVals = ''

  for(let idx = 0; idx < keys.length; idx++){
    const key = StringUtil.snake2camel(keys[idx].trim())
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

/**
 * エラーハンドル
 * @param {Error} e 
 * @param {String} url 
 */
const handleError = (e, url) => {
  console.error({e, url})
  if (e.response && e.response.status == 401) {
    AuthHelper.logout()
  }
  else {
    if (e.response && e.response.data) {
      let message = e.response.data.message
      if (message) {
        let key = message.match(/Key \(([^)]*)\)=\(([^)]*)\)/)
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

    if (context) {
      let ignore = !url.endsWith('/') && context.route.path.indexOf('/login') != -1 // Loginエラーでポップアップが表示されるのを防ぐ
      if (e.message && (e.message == 'Network Error' || e.message.startsWith('timeout of ')) && !ignore) {
        e.key = 'networkError'
        context.app.store.commit('replace', {error: e})
        context.app.router.app.$root.$emit('bv::show::modal', 'modalRootError')
      }  
    }
    throw e
  }
} 

/**
 * サーバのファイルを取得する。
 * @method
 * @async
 * @param {String} uri 
 * @return {Any}
 */
export const getFronServerFile  = async (uri) => {
  try {
    let res = await apFrontClient.get(uri)
    return res.data
  } catch (e) {
    /* NOP */
  }
}

/**
 * サーバにファイルが存在するか確認する。
 * @method
 * @async
 * @param {String} fileName 
 * @return {Boolean}
 */
export const existServerFile = async (fileName) => {
  const indexData = await getFronServerFile('/index.txt')
  if(indexData == null){
    return true
  }
  return indexData.split(/\r?\n/g).includes(fileName)
}

/**
 * リソースのパスを取得する。
 * @method
 * @param {String} path
 * @return {String} 先頭に'.'または'/'が付与されていない場合、'/'が付与される
 */
export const getResourcePath = path => Util.hasValue(path) && ImageHelper.isImageFile(path)? path.indexOf(0) == /^[\\./]/.test(path)? path: `/${path}`: path

/**
 * URLに現在時刻情報を付与する。既に付与されている場合は何もしない。
 * @method
 * @param {String} path
 * @return {String}
 * @example
 * addTimeToPath('XXX') => 'XXX?_=1234567890'
 */
export const addTimeToPath = path => {
  if (path.includes('?_=') || path.includes('&_=')) {
    return path
  }
  return path + (path.includes('?')? '&': '?') + '_=' + new Date().getTime()
}
