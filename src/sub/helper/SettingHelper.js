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
    const option = Object.keys(optionsJson).reduce((prev, cur) => prev + '\n' + cur + ' : ' + optionsJson[cur], '')
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

export const getDefaultValue = (key) => {
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
  const defaultValue = getDefaultValue(key)
  if(defaultValue != null && typeof defaultValue != 'object'){
    return typeof defaultValue
  }
  return SETTING.STRING
}

export const createSetting = (setting, option) => {
  const valType = adjustValType(setting.valType)
  const defaultVal = getDefaultValue(setting.key)
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

export const getI18ConfigInner = (config, parentKey = '', list = []) => {
  Object.keys(config).forEach(configKey => {
    const data = config[configKey]
    const key = parentKey + configKey
    if(/^(TYPE|DEFAULT|OPTIONS)(\..+)*$/g.test(key)){
      return
    }
    if(typeof data == 'object' && !Util.isArray(data)){
      getI18ConfigInner(data, key + '.', list)
      return
    }
    const setting = {key: key, valType: getDefaultValType(key)}
    const params = data.split('::')
    list.push(createSetting(setting, {keyName: params[0], title: convertTitle(params[1])}))
  })
  return list
}

export const getI18Config = () => {
  const configObjs = i18n.tnl('config')
  if(!Util.hasValue(configObjs)){
    return []
  }
  return getI18ConfigInner(configObjs)
}

export const mergeSettings = (settings) => {
  const i18ConfigList = getI18Config()
  i18ConfigList.forEach(i18Config => {
    const targetSetting = settings.find(setting => setting.key == i18Config.key)
    if(!targetSetting){
      return
    }
    Util.merge(i18Config, targetSetting, ['valType'])
    settings = settings.filter(setting => setting.key != i18Config.key)
  })
  settings.forEach(setting => {
    i18ConfigList.push(createSetting(setting))
  })
  return i18ConfigList
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
