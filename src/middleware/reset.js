import * as Util from '../sub/util/Util'

export default function (context) {
  console.log('reset', context.route.path)
  context.store.commit('replace', {showProgress: false})
  //context.store.commit('main/replaceMain', {selectedTx: {}})
  Util.removeInterval()
}
