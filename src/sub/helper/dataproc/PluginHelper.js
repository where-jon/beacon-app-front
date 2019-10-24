/**
 * プラグイン処理に関するヘルパーモジュール
 * @module helper/dataproc/PluginHelper
 */

import * as Util from '../../util/Util'

/**
 * デフォルトhtmlファイルか確認する
 * @method
 * @param {String} src
 * @return {Boolean}
 */
export const isDefaultHtml = src => {
  return src != null && /data-n-head/.test(src)
}

/**
 * プラグインを読み込む
 * @method
 * @param {String} url
 * @param {Function} callback
 */
export const loadInner = (url, callback) => {
  const xhr = new XMLHttpRequest()
  xhr.onload = () => {
    callback(isDefaultHtml(xhr.response)? null: xhr.response)
  }
  xhr.open("GET", url, true)
  xhr.send(null)
}

/**
 * プラグインを読み込む
 * @method
 * @param {String} fileName
 * @param {Function} callbackHtml
 * @param {Function} callbackJson
 */
export const load = (filePath, callbackHtml, callbackJson) => {
  loadInner(filePath + '.html', result => {
    if(result != null && !isDefaultHtml(result)){
      callbackHtml(result)
      return
    }
    loadInner(filePath + '.json', result => callbackJson(result))
  })
}

/**
 * カスタムテキストボックスタグか確認する
 * @method
 * @param {Object} plugin
 * @return {Boolean}
 */
export const isTextboxTag = plugin => plugin.tag.toLowerCase() == 'p-textbox'

/**
 * カスタム数値テキストボックスタグか確認する
 * @method
 * @param {Object} plugin
 * @return {Boolean}
 */
export const isNumberTextboxTag = plugin => plugin.tag.toLowerCase() == 'p-number'

/**
 * カスタムチェックボックスタグか確認する
 * @method
 * @param {Object} plugin
 * @return {Boolean}
 */
export const isCheckboxTag = plugin => plugin.tag.toLowerCase() == 'p-check'

/**
 * カスタム日付タグか確認する
 * @method
 * @param {Object} plugin
 * @return {Boolean}
 */
export const isDateTag = plugin => plugin.tag.toLowerCase() == 'p-date'

/**
 * カスタムプルダウンタグか確認する
 * @method
 * @param {Object} plugin
 * @return {Boolean}
 */
export const isSelectTag = plugin => plugin.tag.toLowerCase() == 'p-select'

/**
 * htmlのプラグイン部分をjsonに変換する
 * @method
 * @param {Object[]} ret
 * @param {Object} children
 * @return {Object[]}
 */
export const convertInner = (ret, children) => {
  const length = children.length
  for(let idx = 0; idx < length; idx++){
    const child = children[idx]
    ret.push({
      tag: child.tagName,
      ...Util.getValue(child, 'dataset', {})
    })
    if(Util.hasValue(child.children)){
      convertInner(ret, child.children)
    }
  }
  return ret
}

/**
 * htmlのプラグイン部分をjsonに変換する
 * @method
 * @param {String} [pluginTag = 'c-plugins']
 * @return {Object[]}
 */
export const convert = (pluginTag = 'c-plugins') => {
  const elements = document.getElementsByTagName(pluginTag)
  if(!Util.hasValue(elements)){
    return {request: '', ui: []}
  }
  return {
    request: elements[0].dataset.request,
    ui: convertInner([], elements[0].children),
  }
}

/**
 * プラグイン部分をhtml定義場所に移動する
 * @method
 * @param {String} [pluginTag = 'c-plugins']
 * @param {String} [pluginJsonId = 'pluginJson']
 * @return {Object[]}
 */
export const rePosition = (pluginTag = 'c-plugins', pluginJsonId = 'pluginJson') => {
  const elements = document.getElementsByTagName(pluginTag)
  const jsonElement = document.getElementById(pluginJsonId)
  if(!Util.hasValue(jsonElement) || !Util.hasValue(elements)){
    return
  }
  jsonElement.parentElement.removeChild(jsonElement)
  elements[0].parentNode.insertBefore(jsonElement, elements[0])
  elements[0].parentElement.removeChild(elements[0])
}
