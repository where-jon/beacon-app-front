/**
 * ヒートマップに関するヘルパーモジュール
 * @module helper/ui/HeatmapHelper
 */

import h337 from 'heatmap.js'
import _ from 'lodash'
import { DISP } from '../../constant/config'
import * as Util from '../../util/Util'
import * as VueUtil from '../../util/VueUtil'

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
 * @param {Function} [onFinally = null]
 * @return {Element}
 */
export const create = (vueComponent, elementId, mapSrc = null, onLoad = null, onFinally = null) => {
  const mapElement = document.getElementById(elementId)
  if(mapElement == null){
    onFinally && onFinally()
    return null
  }
  while (mapElement && mapElement.firstChild) {
    mapElement.removeChild(mapElement.firstChild)
  }
  const map = new Image()
  map.onload = evt => {
    if(!VueUtil.isAuthVuePage(vueComponent)){
      return
    }
    mapElement.appendChild(map)
    onLoad && onLoad(evt, mapElement, map)
    onFinally && onFinally()
  }
  if(mapSrc){
    map.src = mapSrc
  }
  else{
    onLoad && onLoad(null, mapElement, map)
    onFinally && onFinally()
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

/**
 * 分析用ヒートマップの情報を作成する。
 * @method
 * @param {Object[]} dataList
 * @param {umber} mapScale
 * @return {Object}
 */
export const creteAnalysisHeatmapData = (dataList, mapScale) =>{
  let positions = _.reduce(dataList, (ary, hist) => {
    if (ary[hist.locationId]) {
      ary[hist.locationId].value++
    } else {
      ary[hist.locationId] = {
        locationId: hist.locationId,
        x: Math.round(hist.x * mapScale),
        y: Math.round(hist.y * mapScale),
        value: 1,
      }
    }
    return ary
  }, [])
  positions = _.compact(positions)
  const maxValue = _.maxBy(positions, 'value').value
  return { max: maxValue, data: positions }
}

/**
 * 分析用ヒートマップを描画する。
 * @method
 * @param {Object} container
 * @param {Object[]} dataList
 * @param {Number} mapScale
 */
export const drawAnalysisHeatmap = (container, dataList, mapScale) => {
  if(!Util.hasValue(container)){
    return
  }
  if(!Util.hasValue(dataList)){
    removeHeatmap(container)
    return
  }
  draw(
    container,
    { radius: DISP.ANALYSIS.HEATMAP.RADIUS * mapScale, container: container },
    creteAnalysisHeatmapData(dataList, mapScale),
  )
}
