import Encoding from 'encoding-japanese'
import { str2Array } from './Util'
import * as HttpHelper from '../../sub/helper/HttpHelper'



export const addClass = (e, cls) => e && e.target.classList && e.target.classList.add(cls)

export const removeClass = (e, cls) => e && e.target.classList && e.target.classList.remove(cls)

export const getLangShort = () => {
  let lang = getLang()
  if (lang && lang.length >= 2) {
    return lang.substr(0, 2)
  }
  return lang
}

export const isMobile = () => {
  let isMobile = window.matchMedia("only screen and (max-width: 760px)")
  return isMobile && isMobile.matches
}

const intervals = []

export const registerInterval = (func, period) => intervals.push(setInterval(func, period))

export const removeInterval = () => {
  console.log(clearInterval, {intervals})
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

export const fileDL = (name, content, charSet = "UTF8") => {
  var e = document.createElement("a")
  const encodeString = Encoding.convert(str2Array(content),
    { from: "UNICODE", to: charSet }
  )
  var uint8_array = new Uint8Array( encodeString );
  var blob = new Blob([ uint8_array ], { type: 'text/csv' });

  if(window.navigator.msSaveBlob){
    window.navigator.msSaveBlob(blob, name)
    return
  }

  window.URL = window.URL || window.webkitURL;
  e.href = window.URL.createObjectURL(blob);
  // IE対応
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveOrOpenBlob(blob, name);
    return
  }
  e.download = name;
  e.style.display = "none"
  document.body.appendChild(e)
  e.click()
  document.body.removeChild(e)
}

export const readImage = (e, onload, resize) => {
  let files = e.target.files
  if ( files && files[0] ) {
    let fr = new FileReader()
    fr.onload = (evt) => {
      let image = new Image()
      image.src = evt.target.result
      image.crossOrigin = "Anonymous"
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
    }       
    fr.readAsDataURL(files[0])
  }
}

export const getMessageData = async (lang) => {
  return await HttpHelper.getFronServerFile('/' + lang + '.json')
}
