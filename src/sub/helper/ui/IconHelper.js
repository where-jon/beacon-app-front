/**
 * アイコンに関するヘルパーモジュール
 * @module helper/ui/IconHelper
 */

import _ from 'lodash'
import { Container, Shape, Text } from 'createjs-module'
import { DISP } from '../../constant/config'
import * as NumberUtil from '../../util/NumberUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as StyleHelper from './StyleHelper'

/**
 * 円アイコンを作成する。
 * @method
 * @param {Number} radius 
 * @param {String} color 
 * @param {Object} [option = {}]
 * @return {Object}
 */
export const createShape = (radius, color, option = {}) => {
  const icon = new Shape()
  icon.graphics.beginFill(color).drawCircle(0, 0, radius, radius)
  icon.alpha = Util.getValue(option, 'alpha', 1)
  return icon
}

/**
 * 矩形アイコンを作成する。
 * @method
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} color 
 * @param {Object} [option = {}]
 * @return {Object}
 */
export const createRect = (width, height, color, option = {}) => {
  const strokeColor = Util.getValue(option, 'strokeColor', '#000000')
  const strokeStyle = Util.getValue(option, 'strokeStyle', 0)
  const r = Util.getValue(option, 'roundRect', 0)
  const icon = new Shape()
  icon.graphics.beginStroke(strokeColor).setStrokeStyle(strokeStyle).beginFill(color)
  if(r == 0){
    icon.graphics.drawRect(-1 * width, -1 * height, width * 2, height * 2)
    return icon
  }
  icon.graphics.drawRoundRect(-width, -height, width * 2, height * 2, r)
  return icon
}

/**
 * テキストオブジェクトを作成する。
 * @method
 * @param {String} text 
 * @param {String} font 
 * @param {String} color 
 * @param {Object} [option = {}]
 * @return {Object}
 */
export const createText = (text, font, color, option = {}) => {
  const label = new Text(text)
  label.font = StyleHelper.getAdjustFontSize(()=> Util.getValue(option, 'fontSize', StyleHelper.getFont2Size(font)) * DISP.FONT_ICON_ADJUST_SCALE, Util.getValue(option, 'bold', false))
  label.color = color
  label.textAlign = Util.getValue(option, 'textAlign', 'center')
  label.textBaseline = Util.getValue(option, 'textBaseline', 'middle')
  return label
}

/**
 * 円にテキストを重ねたアイコンを作成する。
 * @method
 * @param {String} text 
 * @param {Number} radius 
 * @param {String} color 
 * @param {String} bgColor 
 * @param {Object} [option = {}]
 * @return {Object}
 */
export const createCircleIcon = (text, radius, color, bgColor, option = {}) => {
  const icon = new Container()
  icon.addChild(createShape(radius, bgColor, option))
  icon.addChild(createText(text, StyleHelper.getInRectFontSize(DISP.IS_SCALE_ICON_TEXT ? text : DISP.DUMMY_ICON_TEXT, radius * 2, radius * 2), color, option))
  return icon
}

/**
 * 矩形にテキストを重ねたアイコンを作成する。
 * @method
 * @param {String} text 
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} color 
 * @param {String} bgColor 
 * @param {Object} [option = {}]
 * @return {Object}
 */
export const createRectIcon = (text, width, height, color, bgColor, option = {}) => {
  const icon = new Container()
  icon.addChild(createRect(width, height, bgColor, option))
  icon.addChild(createText(text, StyleHelper.getInRectFontSize(DISP.IS_SCALE_ICON_TEXT ? text : DISP.DUMMY_ICON_TEXT, width * 2, height * 2), color, option))
  return icon
}

/**
 * 指定したタイプのアイコンを作成する。
 * @method
 * @param {String} text 
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} color 
 * @param {String} bgColor 
 * @param {Object} [option = {}]
 * @return {Object}
 */
export const createIcon = (text, width, height, color, bgColor, option = {}) => {
  if(Util.getValue(option, 'circle', false)){
    return createCircleIcon(text, width, color, bgColor, option)
  }
  return createRectIcon(text, width, height, color, bgColor, option)
}

/**
 * 位置アイコンを作成する。
 * @method
 * @param {Object} location 
 * @param {Object} locationInfo 
 * @param {Number} maxLength 
 * @param {Object} locationInfo 設定値「DISP.**_LOC」を使用する
 * @param {Number} mapScale 
 * @return {Object}
 */
export const createLocationIcon = (location, key, maxLength, locationInfo, mapScale) => {
  const rect = NumberUtil.getRectInfoFromCenterPos(0, 0, locationInfo.SIZE.W / mapScale, locationInfo.SIZE.H / mapScale)
  const iconArrowWidth = locationInfo.SIZE.W / 3 / mapScale
  const iconArrowHeight = locationInfo.SIZE.H / 3 / mapScale

  const icon = new Shape()
  icon.graphics.beginFill(locationInfo.BGCOLOR)
  icon.graphics.moveTo(rect.left, rect.top)
  icon.graphics.lineTo(rect.right, rect.top)
  icon.graphics.lineTo(rect.right, rect.bottom)
  icon.graphics.lineTo(rect.right - iconArrowWidth, rect.bottom)
  icon.graphics.lineTo(rect.right - iconArrowWidth - iconArrowWidth / 2, rect.bottom + iconArrowHeight)
  icon.graphics.lineTo(rect.right - iconArrowWidth - iconArrowWidth, rect.bottom)
  icon.graphics.lineTo(rect.left, rect.bottom)
  icon.graphics.lineTo(rect.left, rect.top)

  const text = StringUtil.cutOnLongByte(location[key], maxLength)
  const label = new Text(text)
  label.font = StyleHelper.getInRectFontSize(text, rect.width, rect.height)
  label.color = locationInfo.COLOR
  label.textAlign = 'center'
  label.textBaseline = 'middle'

  const button = new Container()
  button.addChild(icon)
  button.addChild(label)

  button.location = location
  button.x = location.x
  button.y = location.y - (rect.height / 2 + iconArrowHeight)
  return button
}
