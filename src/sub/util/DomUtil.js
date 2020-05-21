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
  return elm ? elm.getBoundingClientRect() : null
}

export const closest = (el, selector, excludeEl) => {
  let parent = el.parentNode

  if (!excludeEl && _matcher(el, selector)) {
      return el
  }

  while (parent && parent !== window.document.body) {
      if (_matcher(parent, selector)) {
          return parent
      }

      parent = parent.parentNode
  }

  return null
}

export const _matcher = (el, selector) => {
  const cssClassSelector = /^\./,
      idSelector = /^#/

  if (cssClassSelector.test(selector)) {
      return hasClass(el, selector.replace('.', ''))
  }
  if (idSelector.test(selector)) {
      return el.id === selector.replace('#', '')
  }

  return el.nodeName.toLowerCase() === selector.toLowerCase()
}

export const hasClass = (el, name) => {
  let className

  if (el.classList !== undefined) {
      return el.classList.contains(name)
  }

  className = getClass(el)

  return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className)
}

export const getClass = (el) => {
  if (!el || !el.className) {
      return ''
  }

  return el.className.baseVal === undefined ? el.className : el.className.baseVal
}