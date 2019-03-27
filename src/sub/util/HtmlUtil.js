import Encoding from 'encoding-japanese'
import { str2Array, hasValue } from './Util'
import * as HttpHelper from '../../sub/helper/HttpHelper'
import { APP } from '../constant/config'

let locale
let i18n

export const setApp = (pi18n) => {
  locale = pi18n.locale
  i18n = pi18n
}


export const addClass = (e, cls) => e && e.target.classList && e.target.classList.add(cls)

export const removeClass = (e, cls) => e && e.target && e.target.classList && e.target.classList.remove(cls)

export const getLangShort = () => {
  let lang = locale? locale: getLang()
  if (lang && lang.length >= 2) {
    return lang.substr(0, 2)
  }
  return lang
}

export const isMobile = () => {
  let isMobile = window.matchMedia('only screen and (max-width: 760px)')
  return isMobile && isMobile.matches
}

const intervals = []

export const registerInterval = (func, period) => intervals.push(setInterval(func, period))

export const removeInterval = () => {
  while (intervals.length > 0) {
    window.clearInterval(intervals.shift())
  }
}

export const getLang = () => navigator.languages? navigator.languages[0]: navigator.language

export const getRect = (selector, key) => {
  let elm = document.querySelector(selector)
  if (key) {
    elm = elm[key]
  }
  return elm.getBoundingClientRect()
}

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

export const executeFileDL = (url) => {
  let e = document.createElement('a')
  e.href = url
  e.download = name
  e.style.display = 'none'
  document.body.appendChild(e)
  e.click()
  document.body.removeChild(e)
}

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

// not use now
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

export const getMessageData = async (lang) => {
  return await HttpHelper.getFronServerFile('/' + lang + '.json')
}

export const endsWithSlashUrl = (vueComponent) => {
  const nodeKey = vueComponent.$vnode && vueComponent.$vnode.data? vueComponent.$vnode.data.key: ''
  return nodeKey.endsWith('/')
}

export const createCustomValidationKey = (target) => {
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

export const customValidation = (e) => {
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
