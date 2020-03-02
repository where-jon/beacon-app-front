// vue.min.js, vue-i18n.min.js, axios.js, md5.min.jsが事前にロード済みであることが前提
class Common {
  constructor() {
    this._apServiceClient = axios.create({
      xsrfHeaderName: 'X-CSRF-Token',
      withCredentials: true
    })
  }

  async getI18n() {
    const defaultLocale = 'ja'
    let locale = null
    const localeMessages = {}
    try {
      locale = this.getLocalStorage(document.domain + '-locale')
      if (!locale || locale.length < 1) {
        locale = navigator.locale
      }
      const messages = await axios.get(`/plugin/${locale}.json`)
      localeMessages[locale] = messages.data
    } catch (e) {
      console.error(e)
    }
    return new VueI18n({
      locale: locale,
      fallbackLocale: defaultLocale,
      messages: localeMessages
    })
  }

  get apServiceClient() {
    return this._apServiceClient
  }

  getLocalStorage(key) {
    const data = window.localStorage.getItem(key)
    try{
      return JSON.parse(data)
    }
    catch(e){
      return data
    }
  }

  getApiKey() {
    const login = this.getLocalStorage('login')
    return login.apiKey ? md5(login.apiKey) : ''
  }
}