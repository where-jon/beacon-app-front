/**
 * 分析に関するヘルパーモジュール
 * @module helper/domain/AnalysisHelper
 */

import { DISP } from '../../constant/config'
import * as Util from '../../util/Util'
import * as FlowLineHelper from '../ui/FlowLineHelper'
import * as HttpHelper from '../base/HttpHelper'

const requestPath = '/core/positionHistory'

let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pI18n
 */
export const setApp = pI18n => {
  i18n = pI18n
}

/**
 * 人＆物情報を個人ごとに分別する。
 * @method
 * @param {Object[]} results
 * @return {Object[]}
 */
export const analysePotInfos = results => {
  const potInfos = {}
  results.forEach(result => {
    if(!potInfos[result.potId]){
      potInfos[result.potId] = []
    }
    potInfos[result.potId].push(result)
  })
  return potInfos
}

/**
 * 動線の線の太さ情報を作成する。
 * @method
 * @param {Object[]} positionInfos
 * @return {Object[]}
 */
export const analyseWeightInfos = positionInfos => {
  const weightInfos = []
  Object.values(positionInfos).forEach(positionInfo => {
    if(!weightInfos.includes(positionInfo.count)){
      weightInfos.push(positionInfo.count)
    }
  })
  weightInfos.sort((a, b) => a - b)
  const min = DISP.ANALYSIS.LINE.MIN_WEIGHT
  const max = min + weightInfos.length - 1 < DISP.ANALYSIS.LINE.MAX_WEIGHT? min + weightInfos.length - 1: DISP.ANALYSIS.LINE.MAX_WEIGHT
  const per = max <= min? 0: weightInfos.length <= 1? 0: (max - min) / (weightInfos.length - 1)
  Object.values(positionInfos).forEach(positionInfo => {
    const stageIndex = weightInfos.indexOf(positionInfo.count)
    positionInfo.weight = min + stageIndex * per
  })
  return positionInfos
}

/**
 * 人＆物情報から動線情報を作成する。
 * @method
 * @param {Object[]} potInfos
 * @return {Object[]}
 */
export const analysePositionInfos = potInfos => {
  const positionInfos = {}
  Object.values(potInfos).forEach(potInfo => {
    for(let idx = 1; idx < potInfo.length; idx++){
      const prev = potInfo[idx - 1]
      const current = potInfo[idx]
      if(prev.locationId == current.locationId){
        continue
      }
      const positionInfoKey = prev.x < current.x ? `${prev.x},${prev.y}-${current.x},${current.y}` : `${current.x},${current.y}-${prev.x},${prev.y}`
      if(!positionInfos[positionInfoKey]){
        positionInfos[positionInfoKey] = {
          start: prev,
          end: potInfo[idx],
          count: 0,
        }
      }
      positionInfos[positionInfoKey].count++
    }
  })
  console.error({positionInfos})
  return analyseWeightInfos(positionInfos)
}

/**
 * 動線情報を作成する。
 * @method
 * @param {Object[]} results
 * @return {Object}
 */
export const analyseFlowline = results => {
  const potInfos = analysePotInfos(results)
  const positionInfos = analysePositionInfos(potInfos)
  console.error({results}, {potInfos}, {positionInfos})
  return {potInfos: potInfos, positionInfos: positionInfos}
}

/**
 * 動線の分析から描画まで行う。
 * @method
 * @param {Object} container
 * @param {Number} potId
 * @param {Object[]} results
 * @param {Number} mapScale
 * @return {Object}
 */
export const analyse = (container, potId, results, mapScale) => {
  const analysisResults = analyseFlowline(results)
  FlowLineHelper.drawFlowline(container, analysisResults.positionInfos)
  FlowLineHelper.drawStartEnd(container, potId, analysisResults.potInfos, mapScale)
  return container
}

/**
 * 動線分析・ヒートマップ測位の情報を取得する。
 * @async
 * @method
 * @param {String} title
 * @param {Object} form
 * @return {Object}
 */
export const sendRequest = async (title, form) => {
  const reqParam = [
    requestPath,
    form.areaId,
    form.categoryId ? form.categoryId : '0',
    form.groupId ? form.groupId : '0',
    form.potId ? form.potId : '0',
    form.datetimeFrom.getTime(),
    form.datetimeTo.getTime(),
  ].join('/')
  Util.debug(reqParam)
  const ret = {}
  ret.dataList = await HttpHelper.getAppService(reqParam)
  Util.debug(ret.dataList)
  if(!ret.dataList.length){
    ret.errorMessage = i18n.tnl('message.notFoundData', {target: i18n.tnl('label.' + title)})
  }
  return ret
}
