import * as Util from '../sub/util/Util'
import * as LocalStorageHelper from '../sub/helper/base/LocalStorageHelper'

export default function (context) {
  // console.log('reset', context.route.path)
  context.store.commit('replace', {showProgress: false})
  context.store.commit('main/replaceMain', {selectedGroupId: null})
  context.store.commit('main/replaceMain', {selectedCategoryId: null})
  context.store.commit('main/replaceMain', {selectedFreeWord: null})
  Util.removeInterval()

  LocalStorageHelper.setLocalStorage('defaultConfigDescription', JSON.stringify(context.app.$i18n.tnl('config'))) // TODO: 未使用なら削除

  // IE11のみGC実行
  if(window.CollectGarbage){
    window.CollectGarbage()
  }
}
