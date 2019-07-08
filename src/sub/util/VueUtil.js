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

