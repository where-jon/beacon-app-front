import * as MenuHelper from '../sub/helper/MenuHelper'

export default (context, inject) => {
    console.log("App Init") // If you need common initialize procedure, write here.
    MenuHelper.setStore(context.store)
}
  
  