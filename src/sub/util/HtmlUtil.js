
export const addClass = (e, cls) => e && e.target.classList.add(cls)

export const removeClass = (e, cls) => e && e.target.classList.remove(cls)

export const getLangShort = () => {
  let lang = getLang()
  if (lang && lang.length >= 2) {
    return lang.substr(0, 2)
  }
  return lang
}

export const getLang = () => navigator.languages? navigator.languages[0]: navigator.language

export const getRect = (selector, key) => {
  let elm = document.querySelector(selector)
  if (key) {
    elm = elm[key]
  }
  return elm.getBoundingClientRect()
}

export const fileDL = (name, content) => {
  var e = document.createElement("a")
  e.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
  e.setAttribute("download", name)
  e.style.display = "none"
  document.body.appendChild(e)
  e.click()
  document.body.removeChild(e)
}

export const readImage = (e, onload) => {
  let files = e.target.files
  let that = this
  if ( files && files[0] ) {
    var fr = new FileReader()
    fr.onload = (evt) => {
      var image = new Image()
      image.src = evt.target.result
      image.onload = function() {
        onload && onload(evt, this.width, this.height)
      }
    }       
    fr.readAsDataURL(files[0])
  }
}
