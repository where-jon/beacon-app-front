/**
 * 表示周りに関するヘルパーモジュール
 * @module helper/ui/ViewHelper
 */

import elementLocale from 'element-ui/lib/locale'
import _ from 'lodash'
import { APP } from '../../constant/config'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as BulkHelper from '../dataproc/BulkHelper'

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
 * Element-UIをインポートする。
 * @method
 */
export const importElementUI = () => {
  import(`element-ui/lib/locale/lang/${i18n.locale}`).then(mojule => elementLocale.use(mojule.default))
}

/**
 * ラベルを言語化する。ラベルが定義されていない場合、keyプロパティ値を言語化してラベルとする。
 * @method
 * @param {Object} i18n 
 * @param {Object[]} objArr 
 * @return {Object[]}
 */
export const addLabelByKey = (i18n, objArr) => {
  return _(objArr).map(val => {
    return val? {...val, label: i18n? i18n.tnl('label.' + (val.label || val.key)): val.label || val.key}: null
  })
    .filter(val => val != null).value()
}

/**
 * ブレッドクラムに必要なデータを作成する。
 * @method
 * @param  {...Any} columns 各階層で表示するキー名。またはtextプロパティを持つオブジェクト
 * @return {Object[]}
 * @example
 * // 通常のブレッドクラム
 * createBreadCrumbItems('master', 'area'),
 * // textおよびhrefを定義したオブジェクトを使用した場合、リンクとなる。
 * createBreadCrumbItems('master', {text: 'area', href: '/master/area'}),
 */
export const createBreadCrumbItems = (...columns) => {
  const ret = []
  columns.forEach(column => {
    const isString = typeof column == 'string'
    ret.push({
      text: i18n.tnl(`label.${isString? column: column.text}`),
      active: isString? true: column.href == null,
      href: isString? null: column.href,
    })
  })
  return ret
}

/**
 * 編集画面の状態を示す文字列を取得する。
 * @method
 * @param {Number} id
 * @return {String} 更新の場合は'update'。新規作成の場合は'addSetting'
 */
export const getDetailCaptionKey = id => {
  return `${Util.hasValue(id)? 'update': 'addSetting'}`
}

/**
 * 実際の主キー名を、表示上の主キー名に変換する。
 * @method
 * @param {String} col 
 * @return {String}
 */
export const modifyColName = col => {
  if (col == 'TXID'){
    return APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId'
  }
  if (col == 'btxId' && APP.TX.BTX_MINOR == 'minor') {
    return 'minor'
  }
  return col
}

/**
 * 実際の主キー名に応じて、表示上の主キー名が保有する値を取得する。
 * @method
 * @param {String} col 
 * @param {Any} val 
 * @return {Any}
 */
export const modifyVal = (col, val) => {
  if (col == 'TXID'){
    if(APP.TX.BTX_MINOR == 'minor' && this.minor){
      return this.minor
    }
    if(APP.TX.BTX_MINOR != 'minor' && this.btxId){
      return this.btxId
    }
  }
  return val
}

/**
 * サブミット時にエラーが発生した場合のメッセージを作成する。
 * @method
 * @param {Exception} e 
 * @param {Number} showLine 
 * @param {String} crud 
 * @param {String} masterIdName 
 * @return {String}
 */
export const getSubmitErrorMessage = (e, showLine, crud, masterIdName) => {
  if (e.key) {
    return i18n.tnl('message.' + e.type, {key: i18n.tnl('label.' + modifyColName(StringUtil.snake2camel(e.key))), val: modifyVal(StringUtil.snake2camel(e.key), e.val)})
  }
  if(e.col){
    return i18n.tnl('message.' + e.type, {col: i18n.tnl(`label.${e.col}`), value: e.val})
  }
  if(e.bulkError) {
    return _.map(_.orderBy(e.bulkError, ['line'], ['asc']), err => {
      BulkHelper.editBulkError(err)
      const readingPoint = i18n.tnl(`message.readingPoint`)
      const col = err.cols? err.cols.map(c => i18n.tnl(`label.${c.trim()}`)).join(readingPoint): i18n.tnl(`label.${modifyColName(err.col.trim())}`)
      const value = err.values? err.values.join(readingPoint) : err.value
      return i18n.tline('message.bulk' + err.type + 'Failed', {
        line: err.line,
        col: col,
        value: StringUtil.sanitize(value, true),
        min: err.min,
        max: err.max,
        candidates: err.candidates,
        num: err.num,
        unit: err.unit? i18n.tnl(`label.${err.unit}Unit`): '',
        target: err.target? i18n.tnl(`label.${err.target}`): ''
      }, showLine)
    }).filter((val, idx, arr) => arr.indexOf(val) == idx)
  }
  return i18n.terror('message.' + crud + 'Failed', {target: i18n.tnl('label.' + masterIdName), code: e.message})
}

/**
 * ファイル選択コントロールの選択値を初期化する。
 * @method
 */
export const clearFileComponentAll = () => {
  const customFileLabel = document.getElementsByClassName('custom-file-label')
  if (customFileLabel && customFileLabel[0]) {
    customFileLabel[0].innerText =''
  }
}

/**
 * 全てのbuttonタグを有効化/無効化する。
 * @method
 * @param {Boolean} disabled 
 * @return {Boolean}
 */
export const disabledButtons = disabled => {
  const buttonList = document.getElementsByTagName('button')
  const buttonLength = buttonList.length
  for(let idx = 0; idx < buttonLength; idx++){
    buttonList[idx].disabled = disabled
  }
  return disabled
}
