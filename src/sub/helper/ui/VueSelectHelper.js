/**
 * vue-selectコンポーネントに関するヘルパーモジュール
 * @module helper/ui/VueSelectHelper
 */

import { DISP } from '../../constant/config'
import { KEYCODE } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'

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
 * v-select選択肢情報を取得する
 * @method
 * @param {Object[]} selectOptions - valueプロパティを含むオブジェクトの配列
 * @param {Any} selected - 検索するvalueプロパティの値
 * @param {Boolean} isFirst - 結果にかかわらず、先頭の選択肢を取得する
 * @return {Object} - 存在しない場合はnull
 */
export const getVueSelectData = (selectOptions, selected, isFirst) => {
  return selectOptions.find((selectOption, idx) => isFirst && idx == 0 || selectOption.value == selected)
}

/**
 * v-selectのstyleを取得する。
 * @method
 * @return {{width: String}}
 */
export const getVueSelectStyle = () => {
  return { width: DISP.CONTROL.COMBO_BOX.W + 'px !important' }
}

/**
 * v-selectの選択肢が存在しない場合に表示する文字列を取得する。
 * @method
 * @return {String}
 */
export const vueSelectNoMatchingOptions = () => i18n.tnl('label.noMatchingOptions')

/**
 * v-selectの選択中文字の表記を省略した場合の文字列を取得する。
 * @method
 * @param {Object} selected 
 * @param {Boolean} required 必須選択の場合true（×印分の幅を考慮）
 * @return {String}
 */
export const vueSelectCutOn = (selected, required = false) => {
  const style = {padding: required? '1.4em': '2em'}
  return selected? StringUtil.cutOnLongWidth(selected.label, DISP.CONTROL.COMBO_BOX.W * 0.9, true, style): null
}

export const vueSelectCutOnWithWidth = (selected, width, required = false) => {
  const style = {padding: required? '1.4em': '2em'}
  return selected? StringUtil.cutOnLongWidth(selected.label, width * 0.9, true, style): null
}

/**
 * v-selectの選択中文字が省略されているか確認する
 * @method
 * @param {Object} selected 
 * @return {Boolean}
 */
export const isVueSelectCutOn = selected => {
  return vueSelectCutOn(selected) != Util.getValue(selected, 'label')
}

/**
 * v-selectにマウスオーバーした場合のツールチップ文字列を取得。
 * @method
 * @param {Object} selected 
 * @return {String}
 */
export const vueSelectTitle = selected => {
  if(isVueSelectCutOn(selected)){
    return Util.getValue(selected, 'label')
  }
  return null
}

/**
 * すべてのv-select選択肢欄を閉じる。
 * @method
 */
export const closeVueSelect = () => {
  const elements = document.getElementsByClassName('vs__search')
  if(elements){
    for(let idx = 0; idx < elements.length; idx++){
      elements[idx].blur()
    }
  }
}

/**
 * v-selectの選択値をすべて初期化する。
 * @method
 * @param {Object} vueSelected 
 */
export const clearVueSelect = vueSelected => {
  if(vueSelected && typeof vueSelected == 'object'){
    Object.keys(vueSelected).forEach(key => vueSelected[key] = ArrayUtil.isArray(vueSelected[key])? []: null)
  }
}

/**
 * v-selectのsubmitを無効化する
 * @method
 */
export const disabledAllSubmit = () => {
  const vueSelectComponentList = document.getElementsByClassName('vs__search')
  const length = vueSelectComponentList.length
  for(let idx = 0; idx < length; idx++){
    vueSelectComponentList[idx].onkeypress = () => window.event.keyCode != KEYCODE.ENTER
  }
}

