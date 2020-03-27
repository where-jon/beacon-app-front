/**
 * システム設定画面に関するヘルパーモジュール
 * TODO: 意味不明すぎる。要書き直し
 * @module helper/domain/SettingHelper
 */

import { SETTING, PATTERN } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as Util from '../../util/Util'
import * as DateUtil from '../../util/DateUtil'
import * as LocalStorageHelper from '../base/LocalStorageHelper'

let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pi18n
 */
export const setApp = pi18n => {
  i18n = pi18n
}

/**
 * ツールチップに表示する文言を作成する。
 * @method
 * @param {String} str 
 * @return {String}
 */
export const convertTitle = str => {
  if(!Util.hasValue(str)){
    return str
  }
  const srcList = str.match(/\{[^}]*\}/g)
  if(srcList == null){
    return str
  }
  const optionsList = i18n.tnl('config.OPTIONS')
  srcList.forEach(src => {
    const optionsJson = Util.getValue(optionsList, src.replace(/[{}]/g, ''), {})
    const option = Object.keys(optionsJson).reduce((prev, cur) => {
      const elem = optionsJson[cur].split('::')
      return prev + '<br>' + elem[0] + ' : ' + elem[1]
    }, '')
    str = str.replace(new RegExp(src, 'g'), option)
  })
  return str
}

/**
 * 型表記を統一する。旧表記に対する対応。
 * @method
 * @param {String} valType 
 * @return {String}
 */
export const adjustValType = valType => {
  const type = valType.toLowerCase()
  if(['number', 'int'].includes(type)){
    return SETTING.NUMBER
  }
  if(['numberlist', 'numlist'].includes(type)){
    return SETTING.NUMBER_LIST
  }
  if(['stringlist', 'strlist'].includes(type)){
    return SETTING.STRING_LIST
  }
  if(['boolean', 'json', 'date', 'datetime', 'time','password'].includes(type)){
    return type
  }
  return SETTING.STRING
}

/**
 * 指定した設定項目のデフォルトカテゴリを取得する。
 * @method
 * @param {String} key 
 * @return {String}
 */
export const getDefaultSettingCategory = key => {
  const tenantSettingList = Util.getValue(
    LocalStorageHelper.getLogin(),
    'currentTenant.settingList',
    []
  )
  const tenantDefault = tenantSettingList.find(setting => setting.key == key)
  return tenantDefault? tenantDefault.category: ''
}

/**
 * 指定した設定項目のデフォルト値を取得する。
 * @method
 * @param {String} key 
 * @param {Boolean} [isTenant = false]
 * @return {String|Number}
 */
export const getDefaultValue = (key, isTenant = false) => {
  if(!isTenant){
    const tenantSettingList = Util.getValue(
      LocalStorageHelper.getLogin(),
      'currentTenant.settingList',
      []
    )
    const tenantDefault = tenantSettingList.find(setting => setting.key == key)
    if(tenantDefault){
      return tenantDefault.value
    }
  }
  const defaultConfig = LocalStorageHelper.getLocalStorage('defaultConfig')
  if(!Util.hasValue(defaultConfig)){
    return null
  }
  let ret
  const langDefValue = Util.getValue(SETTING.getDefault(), key)
  if(langDefValue != null){
    ret = langDefValue
  }
  else {
    ret = key.split('.').reduce((prev, cur) => prev != null && prev[cur] != null? prev[cur]: null, defaultConfig)
    if (ret && ret.toString().includes('[object Object]')) {
      ret = JSON.stringify(ret)
    }  
  }
  return ret? '(' + ret + ')': '' // config.jsの値（デフォルト値）はカッコで囲んでテナントの値と区別できるようにする
}

/**
 * 指定した設定項目のデフォルト型を取得する。
 * @method
 * @param {String} key 
 * @return {String}
 */
export const getDefaultValType = (key, forceType) => {
  const type = Util.getValue(SETTING.getType(), key)
  if(type != null && SETTING.VALUES.includes(type)){
    return type
  }
  if(forceType){
    return forceType
  }
  const defaultValue = getDefaultValue(key, true)
  if(defaultValue != null && typeof defaultValue != 'object'){
    return typeof defaultValue
  }
  return SETTING.STRING
}

/**
 * カテゴリを判定する。
 * @method
 * @param {Object} setting 
 * @return {String}
 */
export const getCategoryKey = setting => {
  const categoryObjs = i18n.tnl('config.OPTIONS.KEY_CATEGORY')
  const categoryKeys = categoryObjs? Object.keys(categoryObjs): []
  const key = Util.getValue(setting, 'key', '').split('.')[1]
  return key && categoryKeys.includes(key)? key: SETTING.OTHER_CATEGORY
}

/**
 * 設定項目を作成する。
 * @method
 * @param {Object} setting 
 * @param {Boolean} isTenant 
 * @param {Object} option 設定項目情報に追加する情報
 * @return {Object}
 */
export const createSetting = (setting, isTenant, option) => {
  const valType = adjustValType(setting.valType)
  const defaultVal = getDefaultValue(setting.key, isTenant)
  const defaultSettingCategory = getDefaultSettingCategory(setting.key)
  const ret = {
    ...setting,
    valType: valType,
    valTypeDisp: i18n.tnl('label.' + valType),
    defaultVal: defaultVal && defaultVal.toString? defaultVal.toString(): defaultVal,
    categoryKey: getCategoryKey(setting),
    category: defaultSettingCategory? defaultSettingCategory: setting.category,
  }
  if(option){
    Object.keys(option).forEach(key => {
      ret[key] = option[key]
    })
  }
  // デフォルト値の日時（UNIX時間）を日付表記へ変換
  if (valType == SETTING.DATETIME) {
    ret.defaultVal = DateUtil.formatDate(Number(ret.defaultVal),SETTING.DATE_NOTATION)
  }
  return ret
}

/**
 * 言語ファイルで定義している設定項目リストを作成するインナーメソッド。
 * @method
 * @param {Object} config 
 * @param {Boolean} isTenant 
 * @param {String} [parentKey = ''] 再帰処理用：親キー名
 * @param {Object[]} [list = []] 再帰処理用：設定項目のリスト
 * @return {Object[]}
 */
export const getI18ConfigInner = (config, isTenant, parentKey = '', list = []) => {
  Object.keys(config).forEach(configKey => {
    const data = config[configKey]
    const key = parentKey + configKey
    if(typeof data == 'object' && !ArrayUtil.isArray(data)){
      getI18ConfigInner(data, isTenant, key + '.', list)
      return
    }
    const params = data.split('::')
    const setting = {key: key, valType: getDefaultValType(key, params[2])}
    list.push(createSetting(setting, isTenant, {keyName: params[0], title: convertTitle(params[1]), isParent: false}))
  })
  return list
}

/**
 * 言語ファイルで定義している設定項目リストを作成する。
 * @method
 * @param {Boolean} isTenant 
 * @return {Object[]}
 */
export const getI18Config = isTenant => {
  const configObjs = i18n.tnl('config')
  if(!Util.hasValue(configObjs)){
    return []
  }
  const ret = {}
  Object.keys(configObjs).forEach(configKey => {
    if(/^(OPTIONS)(\..+)*$/g.test(configKey)){
      return
    }
    ret[configKey] = configObjs[configKey]
  })
  return getI18ConfigInner(ret, isTenant)
}

/**
 * 設定項目リストをカテゴリごとに固める。ヘッダデータも付与する。
 * @method
 * @param {Object[]} settings 
 * @return {Object[]}
 */
export const mergeSettings = settings => {
  const categoryObjs = i18n.tnl('config.OPTIONS.KEY_CATEGORY')
  const ret = []
  Object.keys(categoryObjs).forEach(categoryKey => {
    if(categoryKey == SETTING.OTHER_CATEGORY){
      return
    }
    ret.push({key: categoryObjs[categoryKey], isParent: true, categoryKey: categoryKey, _rowVariant: 'secondary'})
    const regExp = new RegExp('^[^.]*\\.' + categoryKey + '(\\..*)?$', 'g')
    settings.forEach(setting => {
      if(setting.key.match(regExp)){
        ret.push({...setting, categoryKey: categoryKey})
      }
    })
    settings = settings.filter(setting => !setting.key.match(regExp))
  })
  if(settings.length != 0){
    ret.push({key: categoryObjs[SETTING.OTHER_CATEGORY], isParent: true,  categoryKey: SETTING.OTHER_CATEGORY, _rowVariant: 'secondary'})
    settings.forEach(setting => ret.push({...setting, categoryKey: SETTING.OTHER_CATEGORY}))
  }
  return ret
}

/**
 * 設定項目リストを作成する。
 * @method
 * @param {Object[]} settings m_settingに登録されている設定項目リスト
 * @param {Boolean} isTenant 
 * @return {Object[]}
 */
export const createSettingList = (settings, isTenant) => {
  const i18ConfigList = getI18Config(isTenant)
  i18ConfigList.forEach(i18Config => {
    const targetSetting = settings.find(setting => setting.key == i18Config.key)
    if(!targetSetting){
      return
    }
    Util.merge(i18Config, targetSetting, ['valType'])
    settings = settings.filter(setting => setting.key != i18Config.key)
  })
  settings.forEach(setting => {
    i18ConfigList.push(createSetting(setting, isTenant, {isParent: false}))
  })
  return mergeSettings(i18ConfigList)
}

/**
 * 設定項目リストから変更差分のみ抽出する。
 * @method
 * @param {Object[]} oldSettings 更新前のリスト
 * @param {Object[]} settings 更新予定リスト
 * @return {Object[]}
 */
export const getDiffSettingList = (oldSettings, settings) => {
  return settings.filter(setting => {
    const oldTarget = oldSettings.find(oldSetting => oldSetting.key == setting.key)
    if(oldTarget == null){
      return true
    }
    return setting.value != oldTarget.value
  })
}

/**
 * 設定項目リストの検証を行う
 * @method
 * @param {Object[]} settings 
 * @return {Boolean}
 */
export const validation = settings => {
  return settings.filter(setting => {
    if(!Util.hasValue(setting.value)){
      return false
    }
    if([SETTING.STRING, SETTING.STRING_LIST, SETTING.BOOLEAN].includes(setting.valType)){
      return false
    }
    if(setting.valType == SETTING.NUMBER){
      return !setting.value.toString().match(PATTERN.NUMBER)
    }
    if(setting.valType == SETTING.NUMBER_LIST){
      return !setting.value.match(PATTERN.NUMBER_LIST)
    }
    if(setting.valType == SETTING.JSON){
      try {
        JSON.parse(setting.value)
        return false
      }
      catch (e) {}
      return true
    }
    return false
  })
}
