import { SETTING, PATTERN } from '../constant/Constants'
import * as Util from '../util/Util'

let i18n

export const setApp = (pi18n) => {
  i18n = pi18n
}

export const convertTitle = (str) => {
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

export const adjustValType = (valType) => {
  const type = valType.toLowerCase()
  if(['number', 'int'].includes(type)){
    return SETTING.NUMBER
  }
  if(['string'].includes(type)){
    return SETTING.STRING
  }
  if(['numberlist', 'numlist'].includes(type)){
    return SETTING.NUMBER_LIST
  }
  if(['stringlist', 'strlist'].includes(type)){
    return SETTING.STRING_LIST
  }
  if(['boolean'].includes(type)){
    return SETTING.BOOLEAN
  }
  return SETTING.STRING
}

export const getDefaultValue = (key, isTenant = false) => {
  if(!isTenant){
    const tenantSettingList = Util.getValue(
      JSON.parse(window.localStorage.getItem('login')),
      'currentTenant.settingList',
      []
    )
    const tenantDefault = tenantSettingList.find(setting => setting.key == key)
    if(tenantDefault){
      return tenantDefault.value
    }
  }
  const defaultConfig = JSON.parse(window.localStorage.getItem('defaultConfig'))
  if(!Util.hasValue(defaultConfig)){
    return null
  }
  const langDefValue = i18n.tdef('config.DEFAULT.' + key)
  if(langDefValue != null){
    return langDefValue
  }
  return key.split('.').reduce((prev, cur) => prev != null && prev[cur] != null? prev[cur]: null, defaultConfig)
}

export const getDefaultValType = (key) => {
  const type = i18n.tdef('config.TYPE.' + key)
  if(type != null && SETTING.VALUES.includes(type)){
    return type
  }
  const defaultValue = getDefaultValue(key, true)
  if(defaultValue != null && typeof defaultValue != 'object'){
    return typeof defaultValue
  }
  return SETTING.STRING
}

export const createSetting = (setting, isTenant, option) => {
  const valType = adjustValType(setting.valType)
  const defaultVal = getDefaultValue(setting.key, isTenant)
  const ret = {
    ...setting,
    valType: valType,
    valTypeDisp: i18n.tnl('label.' + valType),
    defaultVal: defaultVal && defaultVal.toString? defaultVal.toString(): defaultVal
  }
  if(option){
    Object.keys(option).forEach(key => {
      ret[key] = option[key]
    })
  }
  return ret
}

export const getI18ConfigInner = (config, isTenant, parentKey = '', list = []) => {
  Object.keys(config).forEach(configKey => {
    const data = config[configKey]
    const key = parentKey + configKey
    if(typeof data == 'object' && !Util.isArray(data)){
      getI18ConfigInner(data, isTenant, key + '.', list)
      return
    }
    const setting = {key: key, valType: getDefaultValType(key)}
    const params = data.split('::')
    list.push(createSetting(setting, isTenant, {keyName: params[0], title: convertTitle(params[1]), isParent: false}))
  })
  return list
}

export const getI18Config = (isTenant) => {
  const configObjs = i18n.tnl('config')
  if(!Util.hasValue(configObjs)){
    return []
  }
  const ret = {}
  Object.keys(configObjs).forEach(configKey => {
    if(/^(TYPE|DEFAULT|OPTIONS)(\..+)*$/g.test(configKey)){
      return
    }
    ret[configKey] = configObjs[configKey]
  })
  return getI18ConfigInner(ret, isTenant)
}

export const mergeSettings = (settings) => {
  const categoryObjs = i18n.tnl('config.OPTIONS.SETTING_CATEGORY')
  const ret = []
  Object.keys(categoryObjs).forEach(categoryKey => {
    if(categoryKey == 'OTHER'){
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
    ret.push({key: categoryObjs['OTHER'], isParent: true,  categoryKey: 'OTHER', _rowVariant: 'secondary'})
    settings.forEach(setting => ret.push({...setting, categoryKey: 'OTHER'}))
  }
  return ret
}

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

export const validation = (settings) => {
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
    return false
  })
}
