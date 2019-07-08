/**
 * ヒートマップに関するヘルパーモジュール
 * @module helper/ui/HeatmapHelper
 */

import h337 from 'heatmap.js'
import _ from 'lodash'
import * as Util from '../../util/Util'

/**
 * ヒートマップのキャンバス要素を全て取得する。
 * @method
 * @param {Element} mapElement 
 * @return {Element[]}
 */
export const getCanvasElements = mapElement => {
  if(mapElement){
    const canvasElements = mapElement.querySelectorAll('.heatmap-canvas')
    if(canvasElements && canvasElements.length != 0){
      return canvasElements
    }
  }
  return []
}

/**
 * ヒートマップを削除する。
 * @method
 * @param {Element} mapElement 
 * @return {Object}
 */
export const removeHeatmap = mapElement => {
  if(mapElement){
    const canvasElements = getCanvasElements(mapElement)
    canvasElements.forEach(canvasElement => {
      mapElement.removeChild(canvasElement)
    })
  }
  return null
}

/**
 * ヒートマップ要素を作成する。
 * @method
 * @param {String} elementId 
 * @param {String} [mapSrc = null] 
 * @param {Function} [onLoad = null] 
 * @return {Element}
 */
export const create = (elementId, mapSrc = null, onLoad = null) => {
  const mapElement = document.getElementById(elementId)
  while (mapElement.firstChild) {
    mapElement.removeChild(mapElement.firstChild)
  }
  const map = new Image()
  map.onload = evt => {
    mapElement.appendChild(map)
    onLoad && onLoad(evt, mapElement, map)
  }
  if(mapSrc){
    map.src = mapSrc
  }
  else{
    onLoad && onLoad(null, mapElement, map)
  }
  return mapElement
}

/**
 * ヒートマップを描画する。
 * @method
 * @param {Element} mapElement 
 * @param {Object[]} heatmapOptions 
 * @param {Object} [heatmapData = null]
 */
export const draw = (mapElement, heatmapOptions, heatmapData = null) => {
  removeHeatmap(mapElement)
  if(heatmapData){
    const heatmapInstance = h337.create({ ...heatmapOptions, container: mapElement })
    heatmapInstance.setData(heatmapData)
  }
}

/**
 * ヒートマップで使用するデータを集計する。
 * @method
 * @param {Obejct[]} heatmapSrcList 
 * @param {Object} [heatmapOptions = null]
 * @param {Function} [getKeyFunc = () => 'key']
 * @param {Function} [getValueFunc = () => 0]
 * @param {Function} [getPointFunc = () => {return {x: 0, y: 0}}]
 * @param {Function} [getExtParamFunc = () => {return {}})]
 * @return {Object}
 */
export const collect = (heatmapSrcList, heatmapOptions = null, getKeyFunc = () => 'key', getValueFunc = () => 0, getPointFunc = () => {return {x: 0, y: 0}}, getExtParamFunc = () => {return {}}) => {
  let data = _.reduce(heatmapSrcList, (results, heatmapSrc) => {
    const key = getKeyFunc(heatmapSrc)
    const point = getPointFunc(heatmapSrc)
    if (results[key]) {
      results[key].value = getValueFunc(results[key], heatmapSrc)
    } else {
      results[key] = {
        ...getExtParamFunc(heatmapSrc),
        x: Math.round(point.x),
        y: Math.round(point.y),
        value: getValueFunc(null, heatmapSrc),
      }
    }
    return results
  }, {})
  data = _.map(data, (d) => d)
  data = _.compact(data)
  const max = _.maxBy(data, 'value')
  const maxValue = max? max.value: 0
  return {max: maxValue, data: data, ...heatmapOptions? heatmapOptions: {}}
}

/**
 * ヒートマップの色分布設定を算出する。
 * @method
 * @param {String[]} gradientArray カラーコード
 * @return {Object}
 */
export const createGradient = (gradientArray = null) => {
  if(!Util.hasValue(gradientArray)){
    return null
  }
  const ret = {}
  
  const per = Math.floor(1 / (gradientArray.length + 1) * 100) / 100
  let level = per
  gradientArray.forEach(gradient => {
    ret[`${level}`] = gradient
    level += per
  })
  return ret
}
