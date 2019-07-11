/**
 * vue.jsに関するユーティリティモジュール
 * @module util/VueUtil
 */

/**
 * 現在のURL文字列の末尾が'/'かチェック。
 * @method
 * @param {Object} vueComponent
 * @return {Boolean|String} URLが不明の場合は空文字を返す
 */
export const endsWithSlashUrl = vueComponent => {
  const nodeKey = vueComponent.$vnode && vueComponent.$vnode.data? vueComponent.$vnode.data.key: ''
  return nodeKey ? nodeKey.endsWith('/') : ''
}

/**
 * 遅延処理中にvueページが切り替わっていないか確認する。
 * @method
 * @param {Object} vueComponent 
 * @return {Boolean} true: 切り替わっていない false: 途中で切り替わった
 */
export const isAuthVuePage = vueComponent => vueComponent.$route.fullPath == vueComponent.$vnode.data.key

/**
 * 遅延処理中にvueページが切り替わった場合の対策用nextTick。
 * @method
 * @param {Object} vueComponent 
 * @param {Function} func
 */
export const nextTickEx = (vueComponent, func) => {
  vueComponent.$nextTick(() => {
    if(isAuthVuePage(vueComponent)){
      func()
    }
  })
}
