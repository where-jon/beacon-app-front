// axios.js, md5.min.jsが事前にロード済みであることが前提
class Common {
  constructor() {
    this._apServiceClient = axios.create({
      xsrfHeaderName: 'X-CSRF-Token',
      withCredentials: true
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
