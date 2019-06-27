import * as Util from '../util/Util'

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
 * 指定した文字列に対して検証を行う
 * @method
 * @param {String} value - 任意の文字列
 * @param {RegExp} regexp - 任意の正規表現
 * @param {String} errorMessage - 検証失敗時のエラーメッセージ
 * @return {String} 検証に成功した場合はnull。エラーの場合はerrorMessageを取得する
 */
export const validatePattern = (value, regexp, errorMessage) => {
  if (value === null || (typeof value) === 'undefined') {
    return null
  }
  return value.match(regexp) !== null ? null : errorMessage
}

/**
 * 必須入力項目に対して検証を行う
 * @method
 * @param {String} value - 任意の文字列
 * @param {String} errorMessage - 検証失敗時のエラーメッセージ
 * @return {String} 検証に成功した場合はnull。失敗した場合はerrorMessageを取得する
 */
export const validateRequire = (value, errorMessage) => {
  const val = (value === null || (typeof value) === 'undefined') ? '' : value
  return val.length > 0 ? null : errorMessage
}

/**
 * 必須入力項目に対して検証を行う（分析用）
 * @method
 * @param {Object} param 
 * @return {Object}
 */
export const validateRequireForAnalysis = param => {
  if(!param.values.find(value => value != null)){
    param.message = i18n.tnl((1 < param.names.length? 'message.requiredMore': 'message.required'), {target: concatNames(param.names)})
    return param
  }
  return null
}

/**
 * 引数値を言語化してconcatする。
 * @method
 * @param {Strng[]} names 
 * @return {String}
 */
export const concatNames = names => {
  let allNames = ''
  for(let idx = 0; idx < names.length; idx++) {
    if(idx != 0){
      allNames = `${allNames}, `
    }
    allNames = `${allNames}${i18n.tnl(`label.${names[idx]}`)}`
  }
  return allNames
}

/**
 * データが昇順になっているか検証を行う。
 * @method
 * @param {Object} param 
 * @return {Object}
 */
export const validateAsc = param => {
  for(let idx = 0; idx < param.values.length - 1; idx++){
    if(param.values[idx] > param.values[idx + 1] ||
      (!param.equal && param.values[idx] == param.values[idx + 1])){
      param.message = i18n.tnl('message.invalid', {target: concatNames(param.names)})
      return param
    }
  }
  return null
}

/**
 * データが指定値より低いか検証を行う。
 * @method
 * @param {Object} param 
 * @return {Object}
 */
export const validateLess = param => {
  let total = 0
  for(let idx = 0; idx < param.values.length; idx++){
    total += param.values[idx]
  }
  if(total > param.base || (!param.equal && total == param.base)){
    param.message = i18n.tnl('message.invalidLessHours', {target: concatNames(param.names), max: param.displayBase? param.displayBase: param.base})
    return param
  }
  return null
}

/**
 * データの検証を行う。
 * @method
 * @param {Object[]} params 
 * @return {Object[]}
 */
export const validateCheck = params => {
  const errors = []
  params.forEach(param => {
    let result = null
    if(param.type == 'require'){
      result = validateRequireForAnalysis(param)
    }
    else if(param.type == 'asc'){
      result = validateAsc(param)
    }
    else if(param.type == 'less'){
      result = validateLess(param)
    }
    if(result){
      errors.push(param)
    }
  })
  return errors
}

/**
 * 検証結果メッセージを整形する。
 * @method
 * @param {Object[]} errors 
 * @return {Object[]}
 */
export const formatValidateMessage = errors => {
  const errorMessages = errors.map(error => error.message)
  return errorMessages.filter((errorMessage, index) => errorMessages.indexOf(errorMessage) == index).map(errorMessage => errorMessage)
}

/**
 * 検証失敗時の文字列をカスタマイズするためのキー値を取得する。
 * @method
 * @param {Element} target htmlのinput要素を示すオブジェクト
 * @return {String} 検証に成功した場合はnullを返す
 */
export const createCustomValidationKey = target => {
  const key = ['badInput', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow', 'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing'].find(key => target.validity[key])
  if(!key){
    return null
  }
  const baseKey = `message.${key}`
  if(key == 'badInput'){
    const type = target.type.toLowerCase()
    return ['number'].includes(type)? `${baseKey}${type.charAt(0).toUpperCase()}${type.slice(1)}`: baseKey
  }
  if(key == 'typeMismatch'){
    const type = target.type.toLowerCase()
    return ['email'].includes(type)? `${baseKey}${type.charAt(0).toUpperCase()}${type.slice(1)}`: baseKey
  }
  if(key == 'valueMissing'){
    const tag = target.tagName.toLowerCase()
    return ['input', 'select'].includes(tag)? `${baseKey}${tag.charAt(0).toUpperCase()}${tag.slice(1)}`: baseKey
  }
  return baseKey
}

/**
 * 検証失敗時のメッセージをカスタマイズする。
 * @method
 * @param {Event} e 入力時発火イベント
 */
export const customValidation = e => {
  const target = e.target
  const validity = target.validity
  if(validity == null){
    return
  }
  const key = createCustomValidationKey(target)
  if(!key){
    target.setCustomValidity('')
    return
  }
  const step = Util.hasValue(target.step) && isNaN(target.step)? Number(target.step): 1
  target.setCustomValidity(`${i18n.tnl(key, {
    minLength: target.minLength,
    maxLength: target.maxLength,
    min: target.min,
    max: target.max,
    length: target.value? target.value.length: 0,
    value: target.value,
    stepLow: Math.floor(target.valueAsNumber / step) * step,
    stepHigh: Math.floor(target.valueAsNumber / step) * step + step,
  })}${validity.patternMismatch && target.title? target.title: ''}`)
  return
}

/**
 * すべてのinput要素およびselect要素にカスタムバリデーションを設定する。
 * @method
 */
export const setCustomValidationMessage = () => {
  const inputElements = document.getElementsByTagName('input')
  if(inputElements != null){
    for(let idx = 0; idx < inputElements.length; idx++){
      inputElements[idx].addEventListener('input', e => customValidation(e))
      inputElements[idx].addEventListener('invalid', e => customValidation(e))
    }
  }

  const selectElements = document.getElementsByTagName('select')
  if(selectElements != null){
    for(let idx = 0; idx < selectElements.length; idx++){
      selectElements[idx].addEventListener('change', e => customValidation(e))
      selectElements[idx].addEventListener('invalid', e => customValidation(e))
    }
  }
}
