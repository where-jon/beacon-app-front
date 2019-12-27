import * as Util from '../sub/util/Util'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'

export default function (context) {
  console.log('reset', context.route.path)
  context.store.commit('replace', {showProgress: false})
  //context.store.commit('main/replaceMain', {selectedTx: {}})
  Util.removeInterval()

  LocalStorageHelper.setLocalStorage('defaultConfigDescription', JSON.stringify(context.app.$i18n.tnl('config')))
}
