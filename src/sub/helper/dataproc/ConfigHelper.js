/**
 * システム設定に関するヘルパーモジュール
 * @module helper/dataproc/ConfigHelper
 */

import axios from 'axios'
import _ from 'lodash'
import * as config from '../../constant/config'
import { SETTING } from '../../constant/Constants'
import * as Util from '../../util/Util'
import * as LocalStorageHelper from '../base/LocalStorageHelper'

/**
 * 設定値を指定した型で保存できるように変換する。
 * @method
 * @param {String} str 設定値
 * @param {String} type 型
 * @return {String|Number|String[]|Number[]}
 */
export const convertValue = (str, type) => {
  if(!/^.*(list|array)$/.test(type.toLowerCase())){
    switch(type) {
    case 'number':
    case 'float':
    case 'double':
    case 'int':
      return Number(str)
    case 'boolean':
      return str == 'true'
    case 'json':
      return JSON.parse(str)
    }
    return str
  }
  return str.split(',').filter(val => val.length != 0).map(val => {
    val.trim()
    if(/^number.*$/.test(type)){
      val = Number(val)
    }
    return val
  })
}

/**
 * config.jsonに記載されている設定を適用する。
 * @method
 * @async
 */
export const loadConfigJson = async () => {
  let configJson = await axios.get('/config.json')
  if (configJson.data) {
    updateConfig(configJson.data)
  }
}

/**
 * update config with AppService's m_setting
 * key: category + "." + key (if category is not empty)
 * val: value according to valType(int, array or other(string))
 * @method
 * @param {Object[]} settingArr 
 * @param {Object} [defaultConfig = null]
 */
export const applyAppServiceSetting = (settingArr, defaultConfig = null) => {
  if (!settingArr) return

  let updateData = _.reduce(settingArr, (result, setting) => {
    let key = (setting.category? setting.category + '.': '') + setting.key
    let val = setting.value
    let valType = setting.valType? setting.valType.toLowerCase(): null
    if (val && valType) {
      val = convertValue(val, valType)
    }
    result[key] = val
    return result
  }, {})
  updateConfig(updateData, defaultConfig)
}

/**
 * 設定値を更新する。
 * @method
 * @param {Object} updateData 
 * @param {Object} [defaultConfig = null]
 */
export const updateConfig = (updateData, defaultConfig = null) => {
  _(updateData).forEach((val, propKey) => {
    let curKey = config
    let curDefaultConfig = defaultConfig
    if (propKey.split) {
      propKey.split('.').forEach((key, idx, arr) => {
        if (idx == arr.length - 1) {
          if(val != null){
            curKey[key] = val
          }
          else if(curDefaultConfig && curDefaultConfig[key]){
            curKey[key] = curDefaultConfig[key]
          }
          else{
            delete curKey[key]
          }
        }
        else {
          if (!curKey[key]) {
            curKey[key] = {}
          }
          curKey = curKey[key]
          curDefaultConfig = curDefaultConfig? curDefaultConfig[key]: null
        }
      })
    }
  })
  Util.debug({config})
}

/**
 * 設定値を初期化する
 * @method
 */
export const initConfig = () => {
  const defaultConfig = LocalStorageHelper.getLocalStorage('defaultConfig')
  const toString = Object.prototype.toString
  _(defaultConfig).forEach((defaultConfigVal, propKey) => {
    if(['EXCLOUD', 'DEV', 'APP', 'DISP'].includes(propKey) && toString.call(defaultConfigVal) == '[object Object]'){
      _(defaultConfigVal).forEach((paramVal, paramKey) => {
        config[propKey][paramKey] = paramVal
      })
    }
  })
}

/**
 * 指定した設定値が、指定した設定項目に含まれているか確認する。
 * @method
 * @param {String} selectType 
 * @param {String} target 
 * @return {Boolean} targetの設定値が「both」の場合は必ずtrue
 */
export const includesOrBoth = (selectType, target) => [selectType, 'both'].includes(target)

/**
 * 指定した設定がdeviceId表示設定に含まれているか確認する。
 * @method
 * @param {String} deviceType 
 * @return {Boolean}
 */
export const includesDeviceType = deviceType => includesOrBoth(deviceType, config.APP.EXB.DEVICEID_TYPE)

/**
 * 指定した設定がbtxId表示設定に含まれているか確認する。
 * @method
 * @param {String} btxMinor 
 * @return {Boolean}
 */
export const includesBtxMinor = btxMinor => includesOrBoth(btxMinor, config.APP.TX.BTX_MINOR)

/**
 * 「a:b」の形式で保存されているデータを分解する
 * @method
 * @param {String|String[]} keyValueString 
 * @return {Object[]}
 */
export const parseKeyValue = keyValueString => {
  const isSingle = typeof keyValueString == 'string'
  const list = isSingle? [keyValueString]: keyValueString
  const ret = list.map(kv => {
    const params = kv.split(SETTING.SPLITTER).map(v => v.trim())
    if(!Util.hasValue(params[0])) {
      return
    }
    return { key: params[0], value: params[1] }
  })
  return isSingle? ret[0]: ret
}
