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
