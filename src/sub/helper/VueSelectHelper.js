import * as Util from '../util/Util'
import * as StringUtil from '../util/StringUtil'
import { DISP } from '../constant/config'

/**
 * v-select選択肢情報を取得する
 * @method
 * @param {Object[]} selectOptions - valueプロパティを含むオブジェクトの配列
 * @param {Any} selected - 検索するvalueプロパティの値
 * @param {Boolean} isFirst - 結果にかかわらず、先頭の選択肢を取得する
 * @return {Object} - 存在しない場合はnull
 */
export const getVueSelectData = (selectOptions, selected, isFirst) => {
  const ret = selectOptions.find((selectOption, idx) => isFirst && idx == 0 || selectOption.value == selected)
  return ret? ret: null
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

/**
 * v-selectの選択中文字が省略されているか確認する
 * @method
 * @param {Object} selected 
 * @return {Boolean}
 */
export const isVueSelectCutOn = selected => {
  return vueSelectCutOn(selected) != Util.getValue(selected, 'label', null)
}

/**
 * v-selectにマウスオーバーした場合のツールチップ文字列を取得。
 * @method
 * @param {Object} selected 
 * @return {String}
 */
export const vueSelectTitle = selected => {
  if(isVueSelectCutOn(selected)){
    return Util.getValue(selected, 'label', null)
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
