/**
 * 滞在時間に関するヘルパーモジュール
 * @module helper/domain/StayTimeHelper
 */

import { APP, DISP } from '../../constant/config'
import * as BrowserUtil from '../../util/BrowserUtil'
import { getCharSet } from '../base/CharSetHelper'
import * as ChartHelper from '../ui/ChartHelper'

/**
 * 比率を計算する。
 * @method
 * @param {Number} secTime 秒
 * @param {Number} [digit = 設定値「APP.STAY_SUM.PARSENT_DIGIT」と同値] 出力する桁数
 * @param {Number} [baseSecTime = getStayBaseSec()の算出値] 基盤となる秒
 * @return {String}
 */
export const getRatio = (secTime, digit = APP.STAY_SUM.PARSENT_DIGIT, baseSecTime = getStayBaseSec()) => {
  return (Math.round((secTime / baseSecTime) * 100 * digit) / digit).toFixed(String(digit).length-1)
}

/**
 * 滞在時間の基準秒を算出する。
 * @method
 * @return {Number}
 */
export const getStayBaseSec = () => {
  let from = ((Math.floor(APP.STAY_SUM.FROM / 100) * 60) + Math.floor(APP.STAY_SUM.FROM % 100)) * 60
  let to = ((Math.floor(APP.STAY_SUM.TO / 100) * 60) + Math.floor(APP.STAY_SUM.TO % 100)) * 60
  return to - from
}

/**
 * グラフを表示する
 * @param {*} obj 
 * @param {*} sumData 
 */
export const showChart = (obj, sumData) => {
  // convert data for chart
  sumData.forEach((e) => {
    if (e.stackId == null) {
      e.stackId = -1
    }
    if (e.stack == null) {
      e.stack = obj.$i18n.t('label.other')
    }
    if (e.axisId == null) {
      e.axisId = -1
    }
    if (e.axis == null) {
      e.axis = obj.$i18n.t('label.other')
    }
  })

  const axisIds = _(sumData).map((e) => e.axisId).uniqWith(_.isEqual).value()
  if (axisIds.length > 200) { // 横軸が200件を超える場合エラーに
    return 'sumTooManyResults'
  }
  const maxPeriod = Math.max(...axisIds.map((axisId) => _.sumBy(sumData.filter((e) => e.axisId == axisId), (e) => e.period)))
  if (maxPeriod == 0) { // 最大の滞在時間が0の場合エラーに
    return 'listEmpty'
  }

  // 積上の凡例の数が指定色数より多い場合、全体の合計が上位指定色数-1まで表示し、ほかはすべてその他に加算して表示する
  let stackIds = _(sumData).map((e) => e.stackId).uniqWith(_.isEqual).value()
  if (stackIds.length > DISP.SUM_STACK_COLOR.length) {
    sumData = reduceToOther(obj, stackIds, sumData, axisIds)
  }

  stackIds = _(sumData).sortBy((e) => e.stack).map((e) => e.stackId).uniqWith(_.isEqual).value() // 積上凡例を名前順にソート
  if (stackIds && stackIds[0] == -1) {
    stackIds.shift()
    stackIds.push(-1)
  }

  const stacks = stackIds.map((stackId) => sumData.find((e) => e.stackId == stackId).stack)
  const axises = axisIds.map((axisId) => sumData.find((e) => e.axisId == axisId).axis)

  // 棒グラフの最大値に合わせて目盛を秒・分・時で計算
  let yLabel = ''
  let div = 1
  if(obj.form.target == 'count'){
    yLabel = 'unitCount'
  }else{
    if (maxPeriod > APP.PROXIMITY.UNIT_HOUR) {
      yLabel = 'unitHour'
      div = 60 * 60
    }
    else if (maxPeriod > APP.PROXIMITY.UNIT_MINUTE) {
      yLabel = 'unitMinute'
      div = 60
    }else{
      yLabel = 'unitSecond'
    }
  }
  const yLabelString = obj.$i18n.t('label.' + yLabel)

  // チャート用のデータを作成　縦軸ｘ横軸の２次元配列で作成
  const chartData = new Array(stackIds.length)
  for(let y = 0; y < chartData.length; y++) {
    chartData[y] = new Array(axisIds.length).fill(0)
  }
  obj.chartData = _.cloneDeep(chartData) // for DL
  sumData.forEach((e) => {
    let axisIdx = _.findIndex(axisIds, (axisId) => axisId == e.axisId)
    let stackIdx = _.findIndex(stackIds, (stackId) => stackId == e.stackId)
    chartData[stackIdx][axisIdx] = Math.floor(e.period / div * 100) / 100
    obj.chartData[stackIdx][axisIdx] = e.period // DL用は秒で保存
  })

  // show chart
  obj.showChart = true
  const parent = document.getElementById('stayTimeChart').parentElement
  const canvas = obj.$refs.stayTimeChart
  canvas.width = parent.clientWidth
  if (BrowserUtil.isAndroidOrIOS()) {
    canvas.height = 250
  }
  else {
    canvas.height = document.documentElement.clientHeight - parent.offsetTop - 80
  }
  obj.$nextTick(() => {
    ChartHelper.showBarChart('stayTimeChart', axises, stacks, chartData, yLabelString)
    obj.hideProgress()
  })

  // for csv dl
  obj.axises = axises
  obj.stacks = stacks
}

export const reduceToOther = (obj, stackIds, sumData, axisIds) => {
  // 積上単位の全体の合計を出し、多い順に並べる
  const sortedStacks = _(stackIds.map((stackId) => ({stackId, sum:_.sumBy(sumData.filter((e) => e.stackId == stackId), (e) => e.period)}))).sortBy((e) => e.sum * -1).value()
  const upperStacks = sortedStacks.filter((e) => e.stackId != -1).slice(0, DISP.SUM_STACK_COLOR.length - 1) // その他を除く配列を抽出
  // sumData.filter((e) => e.stackId == upperStacks[0].stackId).forEach((e) => e.stackId = -1) // for test

  axisIds.forEach((axisId) => { // 軸単位に処理する
    let period = 0
    sumData.filter((sum) => sum.axisId == axisId).forEach((sum) => {
      if (!_.some(upperStacks, (e) => e.stackId == sum.stackId) && sum.stackId != -1) { // 上位の積上に含まれない場合、その他に加算
        period += sum.period
        sum.stackId = null
      }
    })
    let other = sumData.find((sum) => sum.axisId == axisId && sum.stackId == -1)
    if (other) {
      other.period += period
    }
    else { // その他がない場合はその他を作成
      sumData.push({axisId, axis:sumData.find((e) => e.axisId == axisId).axis, stackId: -1, stack: obj.$i18n.t('label.other'), period})
    }
  })

  return sumData.filter((sum) => sum.stackId) // 集計データから先にstackId=nullをセットしたものを除去
}

/**
 * 指定したファイルをダウンロードする
 * @param {*} obj 
 * @param {*} filename 
 */
export const download = (obj, filename) => {
  if (obj.chartData == null || obj.chartData.length == 0) {
    obj.message = obj.$i18n.tnl('message.notFound')
    obj.replace({showAlert: true})
    return
  }
  const rows = []
  rows.push('"","' + obj.axises.join('","') + '"')
  obj.chartData.forEach((e, idx)=>{
    rows.push('"' + obj.stacks[idx] + '",' + e.join(','))
  })
  BrowserUtil.fileDL(
    filename,
    rows.join('\n'),
    getCharSet(obj.$store.state.loginId)
  )
}