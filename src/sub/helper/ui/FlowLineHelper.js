/**
 * 動線分析に関するヘルパーモジュール
 * @module helper/ui/FlowLineHelper
 */

import { Shape, Container, Text } from 'createjs-module'

/**
 * 指定した座標を示す逆三角形を描画する。
 * @method
 * @param {Object} container 
 * @param {Object} pos 
 * @param {String} triangleColor 
 * @param {String} caption 
 */
export const drawArrowPoint = (container, pos, triangleColor, caption) => {
  const triangle = new Shape()
  triangle.graphics.beginFill(triangleColor).drawPolyStar(0, -20, 20, 3, 0, 90)

  const label = new Text(caption)
  label.font = '16px Arial'
  label.color = '#000'
  label.textAlign = 'center'
  label.textBaseline = 'middle'
  label.y = -40

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
