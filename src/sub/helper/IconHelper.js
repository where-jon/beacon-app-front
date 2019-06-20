import { Container, Shape, Text } from '@createjs/easeljs/dist/easeljs.module'
import * as Util from '../util/Util'
import * as StyleUtil from '../util/StyleUtil'
import { DISP } from '../constant/config'

export const createShape = (radius, color, option = {}) => {
  const icon = new Shape()
  icon.graphics.beginFill(color).drawCircle(0, 0, radius, radius)
  icon.alpha = Util.getValue(option, 'alpha', 1)
  return icon
}

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

export const createText = (text, font, color, option = {}) => {
  const label = new Text(text)
  label.font = StyleUtil.getAdjustFontSize(()=> Util.getValue(option, 'fontSize', StyleUtil.getFont2Size(font)) * DISP.FONT_ICON_ADJUST_SCALE, Util.getValue(option, 'bold', false))
  label.color = color
  label.textAlign = Util.getValue(option, 'textAlign', 'center')
  label.textBaseline = Util.getValue(option, 'textBaseline', 'middle')
  label.y = Util.getValue(option, 'offsetY', 0)
  return label
}

export const createCircleIcon = (text, radius, color, bgColor, option = {}) => {
  const icon = new Container()
  icon.addChild(createShape(radius, bgColor, option))
  icon.addChild(createText(text, StyleUtil.getInRectFontSize(text, radius * 2, radius * 2), color, option))
  return icon
}

export const createRectIcon = (text, width, height, color, bgColor, option = {}) => {
  const icon = new Container()
  icon.addChild(createRect(width, height, bgColor, option))
  icon.addChild(createText(text, StyleUtil.getInRectFontSize(text, width * 2, height * 2), color, option))
  return icon
}

export const createIcon = (text, width, height, color, bgColor, option = {}) => {
  if(Util.getValue(option, 'circle', false)){
    return createCircleIcon(text, width, color, bgColor, option)
  }
  return createRectIcon(text, width, height, color, bgColor, option)
}
