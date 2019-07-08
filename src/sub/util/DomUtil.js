/**
 * DOMに関するユーティリティモジュール
 * @module util/DomUtil
 */

/**
 * inputタグでサポートされているtypeかチェックする。
 * @method
 * @param {String} type
 * @return {Boolean}
 */
export const supportInputType = type => {
  let input = document.createElement('input')
  input.setAttribute('type', type)
  const support = input.type === type
  input = null
  return support
}

/**
 * イベントを発火した要素にクラスを追加する。
 * @method
 * @param {Event} e イベントオブジェクト
 * @param {String} cls クラス名称
 */
export const addClass = (e, cls) => e && e.target && e.target.classList && e.target.classList.add(cls)

/**
 * イベントを発火した要素からクラスを除外する。
 * @method
 * @param {Event} e イベントオブジェクト
 * @param {String} cls クラス名称
 */
export const removeClass = (e, cls) => e && e.target && e.target.classList && e.target.classList.remove(cls)

/**
 * 指定した要素の領域を取得する。
 * @method
 * @param {String} selector cssセレクタを示す文字列
 * @param {String} key selectorが示す要素のキー名
 * @return {Object} keyが定義されていない場合は、selectorが示す要素本体の領域を取得する
 */
export const getRect = (selector, key) => {
  let elm = document.querySelector(selector)
  if (key) {
    elm = elm[key]
  }
  return elm.getBoundingClientRect()
}

