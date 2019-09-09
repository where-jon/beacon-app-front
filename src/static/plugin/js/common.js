// md5.min.jsが事前にロード済みであることが前提
const Common = {
  getLocalStorage: (key) => {
    const data = window.localStorage.getItem(key)
    try{
      return JSON.parse(data)
    }
    catch(e){
      return data
    }
  },
  getApiKey: () => {
    const loginInf = Common.getLocalStorage('login')
    return loginInf.apiKey ? md5(loginInf.apiKey) : ''
  }
}