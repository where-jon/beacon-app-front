import * as HtmlUtil from '../sub/util/HtmlUtil'

export default function (context) {
  console.log("reset", context.route.path)
  context.store.commit('replace', {showProgress: false})
  HtmlUtil.removeInterval()
}
