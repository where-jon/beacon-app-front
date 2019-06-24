/**
 * ローカルストレージから情報を削除する。
 * @method
 * @param {String} key
 */
export const removeLocalStorage = key => {
  window.localStorage.removeItem(key)
}

/**
 * ローカルストレージから情報を取得する。
 * @method
 * @param {String} key
 * @return {Any} JSONの場合はObjectに変換される。
 */
export const getLocalStorage = key => {
  const data = window.localStorage.getItem(key)
  try{
    return JSON.parse(data)
  }
  catch(e){
    return data
  }
}

/**
 * ローカルストレージに情報を設定する。
 * @method
 * @param {String} key
 * @param {Any} data
 */
export const setLocalStorage = (key, data) => {
  if(data != null){
    window.localStorage.setItem(key, data)
    return
  }
  removeLocalStorage(key)
}

/**
 * ローカルストレージに情報が存在するかチェックする。
 * @method
 * @param {String} key
 * @return {Boolean}
 */
export const existLocalStorage = key => window.localStorage.getItem(key) != null

/**
 * ローカルストレージの情報を取得する。取得した情報はストレージから削除される。
 * @method
 * @param {String} key
 * @return {Any}
 */
export const popLocalStorage = key => {
  const ret = getLocalStorage(key)
  removeLocalStorage(key)
  return ret
}

/**
 * ローカルストレージからログイン情報を取得する。
 * @method
 * @return {Object}
 */
export const getLogin = () => getLocalStorage('login')

