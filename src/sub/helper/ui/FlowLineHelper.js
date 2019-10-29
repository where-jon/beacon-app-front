/**
 * 動線分析に関するヘルパーモジュール
 * @module helper/ui/FlowLineHelper
 */

import { Shape, Container, Text } from 'createjs-module'
import { DISP } from '../../constant/config'
import * as ColorUtil from '../../util/ColorUtil'

/**
 * 指定した座標を示す逆三角形を描画する。
 * @method
 * @param {Object} container
 * @param {Object} pos
 * @param {String} triangleColor
 * @param {String} caption
 */
export const drawArrowPoint = (container, pos, triangleColor, caption, canvasScale) => {
  const triangle = new Shape()
  triangle.graphics.beginFill(triangleColor).drawPolyStar(0, -20 / canvasScale, 20 / canvasScale, 3, 0, 90)

  const label = new Text(caption)
  label.font = parseInt(16 / canvasScale) + 'px Arial'
  label.color = '#000'
  label.textAlign = 'center'
  label.textBaseline = 'middle'
  label.y = -40 / canvasScale

  const arrowContainer = new Container()
  arrowContainer.x = pos.x * pos.mapScale
  arrowContainer.y = pos.y * pos.mapScale
  arrowContainer.addChild(label)
  arrowContainer.addChild(triangle)

  container.addChild(arrowContainer)
}

/**
 * 指定した座標を示す点を描画する。
 * @method
 * @param {Object} container
 * @param {Object} pos
 * @param {String} color
 * @param {Number} radius
 */
export const drawDotPoint = (container, pos, color, radius) => {
  const dot = new Shape()
  dot.graphics.beginFill(color).drawCircle(pos.x * pos.mapScale, pos.y * pos.mapScale, radius)
  container.addChild(dot)
}

/**
 * 動線を描画する。
 * @method
 * @param {Object} container
 * @param {Object[]} positionInfos
 * @param {Number} mapScale
 * @return {Object}
 */
export const drawFlowline = (container, positionInfos) => {
  const line = new Shape()
  line.graphics.beginStroke(ColorUtil.getRGBA(DISP.ANALYSIS.LINE.COLOR, DISP.ANALYSIS.LINE.OPACITY))
  Object.entries(positionInfos).forEach(([key, positionInfo]) => {
    line.graphics.setStrokeStyle(positionInfo.weight)
    line.graphics.moveTo(positionInfo.start.x, positionInfo.start.y)
    line.graphics.lineTo(positionInfo.end.x, positionInfo.end.y)
  })
  container.addChild(line)
  return container
}

/**
 * 動線の始点と終点を描画する。
 * @method
 * @param {Object} container
 * @param {Number} potId
 * @param {Object[]} potInfos
 * @param {Number} mapScale
 * @return {Object}
 */
export const drawStartEnd = (container, potId, potInfos, mapScale) => {
  const startInfo = { caption: 'start', color: '#2299cc' }
  const endInfo = { caption: 'end', color: '#ee0033' }
  const dotRadius = 3

  if(potId){
    const potInfo = potInfos[potId]
    drawArrowPoint(container, {...potInfo[0], mapScale: 1}, startInfo.color, startInfo.caption, mapScale)
    drawArrowPoint(container, {...potInfo[potInfo.length - 1], mapScale: 1}, endInfo.color, endInfo.caption, mapScale)
    return container
  }
  Object.values(potInfos).forEach(potInfo => {
    drawDotPoint(container, {...potInfo[0], mapScale: 1}, startInfo.color, dotRadius)
    drawDotPoint(container, {...potInfo[potInfo.length - 1], mapScale: 1}, endInfo.color, dotRadius)
  })
  return container
}

