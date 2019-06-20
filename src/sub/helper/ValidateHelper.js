/**
 * 指定した文字列に対して検証を行う
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
 * @param {String} value - 任意の文字列
 * @param {String} errorMessage - 検証失敗時のエラーメッセージ
 * @return {String} 検証に成功した場合はnull。失敗した場合はerrorMessageを取得する
 */
export const validateRequire = (value, errorMessage) => {
  const val = (value === null || (typeof value) === 'undefined') ? '' : value
  return val.length > 0 ? null : errorMessage
}
