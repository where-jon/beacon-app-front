// import * as Util from '../util/Util'

export const getVueSelectData = (selectOptions, selected, isFirst) => {
  const ret = selectOptions.find((selectOption, idx) => isFirst && idx == 0 || selectOption.value == selected)
  return ret? ret: null
}
