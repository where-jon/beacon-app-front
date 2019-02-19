import _ from 'lodash'
import h337 from 'heatmap.js'
import * as Util from '../util/Util'

export const getCanvasElements = (mapElement) => {
  if(mapElement){
    const canvasElements = mapElement.querySelectorAll('.heatmap-canvas')
    if(canvasElements && canvasElements.length != 0){
      return canvasElements
    }
  }
  return []
}

export const removeHeatmap = (mapElement) => {
  if(mapElement){
    const canvasElements = getCanvasElements(mapElement)
    canvasElements.forEach((canvasElement) => {
      mapElement.removeChild(canvasElement)
    })
  }
  return null
}

export const create = (elementId, mapSrc = null, onLoad = null) => {
  const mapElement = document.getElementById(elementId)
  while (mapElement.firstChild) {
    mapElement.removeChild(mapElement.firstChild)
  }
  const map = new Image()
  map.onload = (evt) => {
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

export const draw = (mapElement, heatmapOptions, heatmapData = null) => {
  removeHeatmap(mapElement)
  if(heatmapData){
    const heatmapInstance = h337.create({ ...heatmapOptions, container: mapElement })
    heatmapInstance.setData(heatmapData)
  }
}

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

export const createGradient = (gradientArray = null) => {
  if(!Util.hasValue(gradientArray)){
    return null
  }
  const ret = {}
  
  const per = Math.floor(1 / (gradientArray.length + 1) * 100) / 100
  let level = per
  gradientArray.forEach((gradient) => {
    ret[`${level}`] = gradient
    level += per
  })
  return ret
}
