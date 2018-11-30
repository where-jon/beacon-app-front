import * as HtmlUtil from '../sub/util/HtmlUtil'

export default function (context) {
  console.log("reset", context.route.path)
  context.store.commit('replace', {showProgress: false})
  //context.store.commit('main/replaceMain', {selectedTx: {}})
  HtmlUtil.removeInterval()
  // loading chunk failed対策
  setTimeout(() => {
    console.debug("check chunk")
    let errorPages = document.getElementsByClassName("__nuxt-error-page")
    if (errorPages.length > 0) {
      location.reload()
    }
  }, 1000)
}
