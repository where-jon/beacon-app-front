
export default function (context) {
  console.log("reset", context.route.path)
  context.store.commit('replace', {showProgress: false})
}
