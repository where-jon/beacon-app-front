/**
 * ブラウザに関するユーティリティモジュール
 * @module util/BrowserUtil
 */

import Encoding from 'encoding-japanese'
import { APP } from '../constant/config'
import { str2Array } from './StringUtil'

let locale

/**
 * ios端末か判定する。
 * @method
 * @return {Boolean}
 */
export const isIos = () => /(iPhone|iPod|iPad)/.test(navigator.userAgent)

/**
 * Android端末か判定する。
 * @method
 * @return {Boolean}
 */
export const isAndroid = () => /(Android)/.test(navigator.userAgent)

/**
 * モバイル端末か判定する。
 * @method
 * @return {Boolean}
 */
export const isAndroidOrIOS = () => isIos() || isAndroid()

/**
 * ウィンドウ幅が規定値以下かチェックする。
 * @method
 * @param {Boolean} or trueの場合は768以下、falseの場合は768未満かチェックする
 */
export const isResponsiveMode = or => or? window.innerWidth <= 768: window.innerWidth < 768

/**
 * ドメインを示す文字列を取得する。
 * @method
 * @return {String}
 */
export const getDomainCd = () => document && document.domain? document.domain.split('.')[0]: ''

/**
 * 言語設定を取得する。
 * @method
 * @return {String} i18nの設定値が優先される。無い場合はブラウザの設定値が適用される。
 */
export const getLangShort = () => {
  let lang = locale? locale: getLang()
  if (lang && lang.length >= 2) {
    return lang.substr(0, 2)
  }
  return lang
}

/**
 * モバイル端末かチェックする。
 * @method
 * @return {Boolean}
 */
export const isMobile = () => {
  let isMobile = window.matchMedia('only screen and (max-width: 760px)')
  return isMobile && isMobile.matches
}

/**
 * IEかチェックする。
 * @method
 * @return {Boolean}
 */
export const isIe = () => {
  var userAgent = window.navigator.userAgent.toLowerCase()
  return ['msie', 'trident'].some(val => userAgent.indexOf(val) != -1)
}

/**
 * iFrame内にいるかチェックする。
 * @method
 * @return {Boolean}
 */
export const inIframe = () => {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

/**
 * URLのクエリパラメタを取得する
 * 
 * @param {*} pKey 
 */
export const getParam = (pKey) => {
  let ret
  location.search.split('&').some(e => {
    const keyVal = e.split('=')
    let key = keyVal[0]
    if (key.startsWith('?')) {
      key = key.substr(1)
    }
    if (key == pKey) {
      if (keyVal.length == 2) {
        ret = keyVal[1]
      }
      else {
        ret = null
      }
      return true
    }
  })
  return ret
}


/**
 * ブラウザの言語設定を取得する。
 * @method
 * @return {String}
 */
export const getLang = () => navigator.languages? navigator.languages[0]: navigator.language

/**
 * 指定した内容のデータをファイルとしてダウンロードする。
 * @method
 * @param {String} name 出力ファイル名
 * @param {String} content 出力内容
 * @param {String} [charSet = 'UTF8'] 出力時の文字セット
 */
export const fileDL = (name, content, charSet = 'UTF8') => {
  let e = document.createElement('a')
  const encodeString = Encoding.convert(str2Array(content),
    { from: 'UNICODE', to: charSet }
  )
  const uint8_array = new Uint8Array( encodeString )
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
  const blob = new Blob([ charSet == 'UTF8'? bom: null, uint8_array ].filter((val) => val), { type: 'text/csv' })

  if(window.navigator.msSaveBlob){
    window.navigator.msSaveBlob(blob, name)
    return
  }

  window.URL = window.URL || window.webkitURL
  e.href = window.URL.createObjectURL(blob)
  // IE対応
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveOrOpenBlob(blob, name)
    return
  }
  e.download = name
  e.style.display = 'none'
  document.body.appendChild(e)
  e.click()
  document.body.removeChild(e)
}

/**
 * 指定したURLにあるデータをファイルとしてダウンロードする。
 * @method
 * @param {String} url
 */
export const executeFileDL = url => {
  let e = document.createElement('a')
  e.href = url
  e.download = name
  e.style.display = 'none'
  document.body.appendChild(e)
  e.click()
  document.body.removeChild(e)
}

/**
 * 画像をロードする
 * @method
 * @param {Event} e ファイル情報を含むイベントオブジェクト
 * @param {Function} onload 画像ロード完了後に実行するメソッド。引数は順に「e: Event」「width: Number」「height: Number」「thumbnil: String」。
 * @param {Number} resize 画像のリサイズ幅および高さ
 * @param {Function} onerror 指定した画像のサイズが規定値を上回る場合に実行するメソッド。引数は順に「size: Number」。
 */
export const readImage = (e, onload, resize, onerror) => {
  let files = e.target.files
  if ( files && files[0] ) {
    let size = files[0].size
    if (size > APP.MAX_IMAGE_SIZE && onerror) {
      console.warn('Image file exceed ' + APP.MAX_IMAGE_SIZE, size)
      onerror(size)
      return
    }
    let fr = new FileReader()
    fr.onload = (evt) => {
      let image = new Image()
      image.crossOrigin = 'Anonymous'
      image.onload = function() {
        let thumbnail
        if (resize) {
          let canvas = document.createElement('canvas')
          let ctx = canvas.getContext('2d')
          canvas.width = (this.width > this.height)? resize: this.width * resize / this.height
          canvas.height = (this.width > this.height)? this.height * resize / this.width: resize
          ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height)
          thumbnail = canvas.toDataURL()            
        }
        onload && onload(evt, this.width, this.height, thumbnail)
      }
      image.src = evt.target.result
    }       
    fr.readAsDataURL(files[0])
  }
}

/**
 * 指定したURLに存在するデータに対してメソッドを実行する。
 * @method
 * @param {String} url
 * @param {Function} callback ロード終了後に実行するメソッド。引数は順に「result: Object」
 */
export const toDataURL = (url, callback) => {
  var xhr = new XMLHttpRequest()
  xhr.onload = function() {
    var reader = new FileReader()
    reader.onloadend = function() {
      callback(reader.result)
    }
    reader.readAsDataURL(xhr.response)
  }
  xhr.open('GET', url)
  xhr.responseType = 'blob'
  xhr.send()
}

