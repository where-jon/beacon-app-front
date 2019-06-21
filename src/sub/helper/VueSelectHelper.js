/**
 * v-select選択肢情報を取得する
 * @method
 * @param {Object[]} selectOptions - valueプロパティを含むオブジェクトの配列
 * @param {Any} selected - 検索するvalueプロパティの値
 * @param {Boolean} isFirst - 結果にかかわらず、先頭の選択肢を取得する
 * @return {Object} - 存在しない場合はnull
 */
export const getVueSelectData = (selectOptions, selected, isFirst) => {
  const ret = selectOptions.find((selectOption, idx) => isFirst && idx == 0 || selectOption.value == selected)
  return ret? ret: null
}
