// vue.min.js, vue-i18n.min.js, axios.js, md5.min.jsが事前にロード済みであることが前提
class Common {
  constructor() {
    this._apServiceClient = axios.create({
      xsrfHeaderName: 'X-CSRF-Token',
      withCredentials: true
    })
  }

  async getI18n() {
    const locale = this.getLocalStorage(document.domain + '-locale')
    const messages = await axios.get(`/plugin/${locale}.json`)
    const localeMessages = {}
    localeMessages[locale] = messages.data
    return new VueI18n({
      locale: locale,
      fallbackLocale: 'ja',
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
    const loginInf = this.getLocalStorage('login')
    return loginInf.apiKey ? md5(loginInf.apiKey) : ''
  }
}