import Encoding from 'encoding-japanese'
import { hasValue, isImageFile } from './Util'
import { str2Array } from './StringUtil'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { APP } from '../constant/config'
import elementLocale from 'element-ui/lib/locale'

let i18n
let locale

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pi18n
 */
export const setApp = pi18n => {
  i18n = pi18n
  locale = pi18n.locale
}

/**
 * Element-UIをインポートする。
 * @method
 */
export const importElementUI = () => {
  import(`element-ui/lib/locale/lang/${i18n.locale}`).then(mojule => elementLocale.use(mojule.default))
}

/**
 * ローカルストレージからログイン情報を取得する。
 * @method
 * @return {Object}
 */
export const getLogin = () => JSON.parse(window.localStorage.getItem('login'))

/**
 * ローカルストレージの情報を取得する。取得した情報はストレージから削除される。
 * @method
 * @param {String} key
 * @return {String}
 */
export const popLocalStorage = key => {
  const ret = window.localStorage.getItem(key)
  window.localStorage.removeItem(key)
  return ret
}

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

const intervals = []

/**
 * 定期的にメソッドを実行する対象に含める。
 * @method
 * @param {Function} func
 * @param {Number} period 実行間隔
 */
export const registerInterval = (func, period) => intervals.push(setInterval(func, period))

/**
 * 定期的にメソッドを実行する対象から、直近に含めた1つを除外する。
 * @method
 */
export const removeInterval = () => {
  while (intervals.length > 0) {
    window.clearInterval(intervals.shift())
  }
}

/**
 * ブラウザの言語設定を取得する。
 * @method
 * @return {String}
 */
export const getLang = () => navigator.languages? navigator.languages[0]: navigator.language

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

/**
 * 指定したURLに存在する画像に対してメソッドを実行する。指定したURLにデータが存在しない場合も実行する。
 * @method
 * @param {String} url
 * @param {Function} callback 実行するメソッド。引数は順に「result: Object」「isImage: Boolean」。
 */
export const getLogoData = async (url, callback) => {
  if(!await HttpHelper.existServerFile(url)){
    callback(null, false)
    return
  }
  toDataURL(url, result => {
    callback(result, /^data:image\/(png)|(jpg)|(jpeg)|(gif);base64,.*$/.test(result))
  })
}

/**
 * 言語ファイルを取得する。
 * @method
 * @param {String} lang 言語種類を示す文字列
 * @return {String}
 */
export const getMessageData = async (lang) => {
  const fileName = lang + '.json'
  if(!await HttpHelper.existServerFile(fileName)){
    return ''
  }
  return await HttpHelper.getFronServerFile('/' + fileName)
}

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
 * 検証失敗時の文字列をカスタマイズするためのキー値を取得する。
 * @method
 * @param {Element} target htmlのinput要素を示すオブジェクト
 * @return {String} 検証に成功した場合はnullを返す
 */
export const createCustomValidationKey = target => {
  const key = ['badInput', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow', 'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing'].find(key => target.validity[key])
  if(!key){
    return null
  }
  const baseKey = `message.${key}`
  if(key == 'badInput'){
    const type = target.type.toLowerCase()
    return ['number'].includes(type)? `${baseKey}${type.charAt(0).toUpperCase()}${type.slice(1)}`: baseKey
  }
  if(key == 'typeMismatch'){
    const type = target.type.toLowerCase()
    return ['email'].includes(type)? `${baseKey}${type.charAt(0).toUpperCase()}${type.slice(1)}`: baseKey
  }
  if(key == 'valueMissing'){
    const tag = target.tagName.toLowerCase()
    return ['input', 'select'].includes(tag)? `${baseKey}${tag.charAt(0).toUpperCase()}${tag.slice(1)}`: baseKey
  }
  return baseKey
}

/**
 * 検証失敗時のメッセージをカスタマイズする。
 * @method
 * @param {Event} e 入力時発火イベント
 */
export const customValidation = e => {
  const target = e.target
  const validity = target.validity
  if(validity == null){
    return
  }
  const key = createCustomValidationKey(target)
  if(!key){
    target.setCustomValidity('')
    return
  }
  const step = hasValue(target.step) && isNaN(target.step)? Number(target.step): 1
  target.setCustomValidity(`${i18n.tnl(key, {
    minLength: target.minLength,
    maxLength: target.maxLength,
    min: target.min,
    max: target.max,
    length: target.value? target.value.length: 0,
    value: target.value,
    stepLow: Math.floor(target.valueAsNumber / step) * step,
    stepHigh: Math.floor(target.valueAsNumber / step) * step + step,
  })}${validity.patternMismatch && target.title? target.title: ''}`)
  return
}

/**
 * すべてのinput要素およびselect要素にカスタムバリデーションを設定する。
 * @method
 */
export const setCustomValidationMessage = () => {
  const inputElements = document.getElementsByTagName('input')
  if(inputElements != null){
    for(let idx = 0; idx < inputElements.length; idx++){
      inputElements[idx].addEventListener('input', e => customValidation(e))
      inputElements[idx].addEventListener('invalid', e => customValidation(e))
    }
  }

  const selectElements = document.getElementsByTagName('select')
  if(selectElements != null){
    for(let idx = 0; idx < selectElements.length; idx++){
      selectElements[idx].addEventListener('change', e => customValidation(e))
      selectElements[idx].addEventListener('invalid', e => customValidation(e))
    }
  }
}

/**
 * リソースのパスを取得する。
 * @method
 * @param {String} path
 * @return {String} 先頭に'.'または'/'が付与されていない場合、'/'が付与される
 */
export const getResourcePath = path => hasValue(path) && isImageFile(path)? path.indexOf(0) == /^[\\./]/.test(path)? path: `/${path}`: path

/**
 * URLに現在時刻情報を付与する。既に付与されている場合は何もしない。
 * @method
 * @param {String} path
 * @return {String}
 * @example
 * addTimeToPath('XXX') = 'XXX?_=1234567890'
 */
export const addTimeToPath = path => {
  if (path.includes('?_=') || path.includes('&_=')) {
    return path
  }
  return path + (path.includes('?')? '&': '?') + '_=' + new Date().getTime()
}
