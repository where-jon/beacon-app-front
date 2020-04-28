/**
 * app-serviceと通信を行うヘルパーモジュール
 * @module helper/dataproc/AppServiceHelper
 */

import _ from 'lodash'
import * as mock from '../../../assets/mock/mock'
import { DEV } from '../../constant/config'
import { UPDATE_ONLY_NN, IGNORE } from '../../constant/Constants'
import * as HttpHelper from '../base/HttpHelper'

/**
 * app-serviceから情報を取得するためにリクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {Object} option 
 * @return {Object[]}
 */
export const fetchCompactList = async (target, option) => {
  return await HttpHelper.getAppService(target + '?_=' + new Date().getTime() + '&params=' + encodeURI(JSON.stringify(option)), {})
}

/**
 * app-serviceから情報を取得するためにリクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {String} sortBy 
 * @param {Object} option 
 * @param {Object[]} pMock 
 * @return {Object[]}
 */
export const fetchList = async (target, sortBy, option, pMock) => {
  let data = pMock? pMock: DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.getAppService(target + '?_=' + new Date().getTime(), {}, null, option)
  if (!sortBy) {
    return data
  }
  return _(data).sortBy(val => val[sortBy]).compact().value()
}

/**
 * app-serviceから情報を取得するためにリクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {Number} id 
 * @return {Object|Object[]}
 */
export const fetch = async (target, id) => {
  const path = target + '/'
  let data = DEV.USE_MOCK_APS? mock[path + id]:
    await HttpHelper.getAppService(path + id + '?_=' + new Date().getTime())
  return data
}

/**
 * マップ画像を取得する。
 * @method
 * @async
 * @param {String} path 
 * @return {Buffer}
 */
export const fetchMapImage = async (path) => {
  const data = await HttpHelper.getAppService(path + '?_=' + new Date().getTime(), {responseType: 'arraybuffer'})
  return new Buffer(data, 'binary')
}

/**
 * 現在のユーザ情報を取得する。
 * @method
 * @async
 * @return {Object}
 */
export const getCurrentUser = async () => {
  const user = await HttpHelper.getAppService('/meta/user/currentUser')
  if (user.providerUserId != null) {
    user.role = {roleId: -1, roleName: 'isTenantAdmin'}
  }
  return user
}

/**
 * 保存リクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {Object} entity 
 * @param {Number} updateOnlyNN 
 * @return {Object}
 */
export const save = async (target, entity, updateOnlyNN = UPDATE_ONLY_NN.NONE) => {
  const path = target
  var params = new URLSearchParams()
  _.forEach(entity, (value, key) => {
    params.append(key, value != null? value: '')
  })

  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.postAppService(path + '?updateOnlyNN=' + updateOnlyNN + '&_=' + new Date().getTime(), params)

  return data
}

/**
 * 更新リクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {Object} entity 
 * @param {Number} updateOnlyNN 
 * @return {Object}
 */
export const update = async (target, entity, updateOnlyNN = UPDATE_ONLY_NN.NONE) => {
  const path = target
  var params = new URLSearchParams()
  _.forEach(entity, (value, key) => {
    params.append(key, value != null? value: '')
  })

  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.putAppService(path + '?updateOnlyNN=' + updateOnlyNN + '&_=' + new Date().getTime(), params)

  return data
}

/**
 * 一括登録のリクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {Object[]} entities 
 * @param {Number} updateOnlyNN 
 * @param {Number} [ignoreImage = 0]
 * @return {Object}
 */
export const bulkSave = async (target, entities, updateOnlyNN = UPDATE_ONLY_NN.NONE, ignoreImage = IGNORE.OFF) => {
  const path = target + '/bulk/?updateOnlyNN=' + updateOnlyNN + '&ignoreImage=' + ignoreImage + '&_=' + new Date().getTime()
  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.postAppService(path, entities)

  return data
}

export const save2 = async (target, entities, conf = null, updateOnlyNN = UPDATE_ONLY_NN.NONE, ignoreImage = IGNORE.OFF) => {
  const csvHeader = Object.keys(entities[0]).map(v => `${v}`).join(",")
  const csvRecord = entities.map(e => Object.values(e).map(v => {
    if (v || v == 0) {
      v = `${v}`.replace(/"/gi, '""')
      return `"${v}"`
    } else {
      return '""'
    }
  }).join(",")).join("\n")

  let formData = new FormData()
  formData.append('csvHeader', csvHeader)
  formData.append('csvRecord', csvRecord)
  if (conf) {
    formData.append('conf', JSON.stringify(conf))
  }
  
  const path = `${target}/save/?updateOnlyNN=${updateOnlyNN}&ignoreImage=${ignoreImage}&_=${new Date().getTime()}`
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.postAppService(path, formData, config)

  return data
}

export const bulkSave2 = async (target, formData, charset, updateOnlyNN = UPDATE_ONLY_NN.NONE, ignoreImage = IGNORE.OFF) => {
  const path = `${target}/bulk/?charset=${charset}&updateOnlyNN=${updateOnlyNN}&ignoreImage=${ignoreImage}&_=${new Date().getTime()}`
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  let data = DEV.USE_MOCK_APS? mock[target]:
    await HttpHelper.postAppService(path, formData, config, true)
  return data
}

/**
 * 削除リクエストを行う。
 * @method
 * @async
 * @param {String} target 
 * @param {Number} id 
 * @return {Object}
 */
export const deleteEntity = async (target, id) => {
  const path = target + '/'
  let data = DEV.USE_MOCK_APS? mock[path + id]:
    await HttpHelper.deleteAppService(path + id + '?_=' + new Date().getTime())
  return data
}
