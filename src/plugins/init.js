import * as MenuHelper from '../sub/helper/MenuHelper'
import * as ConfigHelper from '../sub/helper/ConfigHelper'

export default (context, inject) => {
    console.log("App Init") // If you need common initialize procedure, write here.
    MenuHelper.setStore(context.store)
    ConfigHelper.loadConfigJson()
    ConfigHelper.loadSetting()
}
  
  