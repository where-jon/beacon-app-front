/**
 * アイコンに関するヘルパーモジュール
 * @module helper/ui/IconHelper
 */

import _ from 'lodash'
import { Container, Shape, Text, Bitmap } from 'createjs-module'
import cold from '../../../assets/icon/cold.png'
import comfort from '../../../assets/icon/comfort.png'
import hot from '../../../assets/icon/hot.png'
import { APP, DISP } from '../../constant/config'
import { SHAPE, TX, SENSOR, DISCOMFORT } from '../../constant/Constants'
import * as ColorUtil from '../../util/ColorUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as PositionHelper from '../domain/PositionHelper'
import * as SensorHelper from '../domain/SensorHelper'
import * as StyleHelper from './StyleHelper'

let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pi18n
 */
export const setApp = pi18n => {
  i18n = pi18n
}

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
  label.regY  = Util.getValue(option, 'regY', 0)
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

/**
 * 位置表示用の矩形を作成する。
 * @method
 * @param {Object} pos
 * @param {String} bgColor
 * @return {{bgColor: String, strokeColor: String}}
 */
export const createPositionRectInfo = (pos, bgColor) => {
  let strokeAlpha = 1
  let fillAlpha = 1
  if (NumberUtil.bitON(pos.tx.disp, TX.DISP.ALWAYS)) {
    // 常時表示時
    fillAlpha = pos.isLost? DISP.TX.LOST_ALPHA: pos.transparent? DISP.TX.ALPHA: fillAlpha
  } else if (pos.transparent) {
    // 通常の離席時
    strokeAlpha = DISP.TX.ALPHA
    fillAlpha = DISP.TX.ALPHA
  }
  return {
    bgColor: ColorUtil.getRGBA(bgColor, fillAlpha),
    strokeColor: ColorUtil.getRGBA(DISP.TX.STROKE_COLOR, strokeAlpha)
  }
}

/**
 * 位置表示用のアイコンを作成する。
 * @method
 * @param {Object} pos
 * @param {Number} shape
 * @param {String} color
 * @param {String} bgColor
 * @param {Number} mapScale
 * @return {Object}
 */
export const createPositionTxIcon = (pos, shape, color, bgColor, mapScale) => {
  const rectInfo = createPositionRectInfo(pos, bgColor)
  const txRadius = DISP.TX.R / mapScale
  return createIcon(
    pos.label, txRadius, txRadius, color, rectInfo.bgColor, {
      circle: shape == SHAPE.CIRCLE,
      roundRect: shape == SHAPE.SQUARE? 0: DISP.TX.ROUNDRECT_RADIUS / mapScale,
      strokeColor: rectInfo.strokeColor,
      strokeStyle: DISP.TX.STROKE_WIDTH,
    })
}

/**
 * ゾーンエリアに表示できる最後のTxのアイコンを作成する。
 * @method
 * @param {Object} pos
 * @param {Number} mapScale
 * @return {Object}
 */
export const createLastSystemTx = (pos, mapScale) => {
  const txRadius = DISP.TX.R / mapScale
  const bgAlpha = 0.01
  const txBtn = createIcon(
    pos.label, txRadius, txRadius, '#000000', ColorUtil.getRGBA('#FFFFFF', bgAlpha), {
      circle: true,
      roundRect: DISP.TX.ROUNDRECT_RADIUS,
      strokeColor: ColorUtil.getRGBA(DISP.TX.STROKE_COLOR, bgAlpha),
      strokeStyle: DISP.TX.STROKE_WIDTH,
    })
  txBtn.txId = pos.btx_id
  txBtn.x = pos.x
  txBtn.y = pos.y
  return txBtn
}

/**
 * 不在Txのアイコンを作成する。
 * @method
 * @param {Object} pos
 * @param {Number} shape
 * @param {String} color
 * @param {String} bgColor
 * @param {Number} mapScale
 * @return {Object}
 */
export const createAbsentTxIcon = (pos, shape, color, bgColor, mapScale) => {
  const txRadius = DISP.TX.R / mapScale
  return createIcon(
    pos.label, txRadius, txRadius, color, ColorUtil.getRGBA(bgColor, 1), {
      circle: shape == SHAPE.CIRCLE,
      roundRect: shape == SHAPE.SQUARE? 0: DISP.TX.ROUNDRECT_RADIUS / mapScale,
      strokeColor: ColorUtil.getRGBA(DISP.TX.STROKE_COLOR, 1),
      strokeStyle: DISP.TX.STROKE_WIDTH,
    })
}

/**
 * Txアイコンを作成する。
 * @method
 * @param {Object} pos
 * @param {Number} shape
 * @param {String} color
 * @param {String} bgColor
 * @param {Number} mapScale
 * @param {Boolean} isAbsent
 * @return {Object}
 */
export const createTxBtn = (pos, shape, color, bgColor, mapScale, isAbsent = false) => {
  let txBtn = createPositionTxIcon(pos, shape, color, bgColor, mapScale)
  txBtn.btxId = pos.btx_id

  if (isAbsent) {
    txBtn = createAbsentTxIcon(pos, shape, color, bgColor, mapScale)
    txBtn.btxId = PositionHelper.zoneBtxIdAddNumber + pos.btx_id
  }
  txBtn.x = pos.x
  txBtn.y = pos.y
  txBtn.color = color
  txBtn.bgColor = bgColor
  txBtn.transparent
  return txBtn
}

/**
 * カウント用ラベルボタンを作成する。
 * @method
 * @param {Number} count
 * @param {Number} scale
 * @return {Object}
 */
export const createCountButton = (count, scale) => {
  const label = createCircleIcon(i18n.tnl('message.count', {count}), DISP.PIR.R_SIZE / scale, '#FF3222', '#FFFFFF', {bold: true, circle: false, alpha: 0, fontSize: 40 / scale})
  label.cursor = ''
  return label
}

/**
 * EXBの円形アイコンに関する描画情報を作成する。
 * @method
 * @param {Number} sensorId
 * @param {Number} count
 * @return {{bgColor: String, width: Number}}
 */
export const createExbShapeInfo = (sensorId, count) => {
  if(sensorId == SENSOR.PRESSURE){
    return {
      bgColor: (count <= DISP.PRESSURE.VOL_MIN)? DISP.PRESSURE.BGCOLOR: DISP.PRESSURE.EMPTY_BGCOLOR,
      width: DISP.PRESSURE.R_SIZE,
    }
  }
  return {
    bgColor: (count > 0)? DISP.PIR.BGCOLOR: DISP.PIR.EMPTY_BGCOLOR,
    width: DISP.PIR.R_SIZE,
  }
}

/**
 * EXBのアイコンに関するラベル情報を作成する。
 * @method
 * @param {Number} sensorId
 * @param {Number} count
 * @return {{label: String, color: String}}
 */
export const createExbLabelInfo = (sensorId, count) => {
  if(sensorId == SENSOR.PRESSURE){
    return {
      label: i18n.tnl('label.' + (count <= DISP.PRESSURE.VOL_MIN? DISP.PRESSURE.INUSE_LABEL: DISP.PRESSURE.EMPTY_LABEL)),
      color: DISP.PRESSURE.FGCOLOR
    }
  }
  return {
    label: i18n.tnl('label.' + (count > 0? DISP.PIR.INUSE_LABEL: DISP.PIR.EMPTY_LABEL)),
    color: DISP.PIR.FGCOLOR
  }
}

/**
 * 使用状態表示アイコンを作成する。
 * @method
 * @param {Number} sensorId
 * @param {Number} count
 * @param {Number} mapScale
 * @return {Object}
 */
export const createUseStateIcon = (sensorId, count, mapScale) => {
  const shapeInfo = createExbShapeInfo(sensorId, count)
  const labelInfo = createExbLabelInfo(sensorId, count)
  return createCircleIcon(labelInfo.label, shapeInfo.width / mapScale, labelInfo.color, shapeInfo.bgColor, {bold: false})
}

/**
 * 使用状態を表示するマグネットアイコンを作成する。
 * @method
 * @param {Object} tx
 * @param {Object[]} magnetSensorList
 * @param {Number} mapScale
 * @return {Object}
 */
export const createExbIconForMagnet = (tx, magnetSensorList, mapScale) => {
  Util.debug('showTx', tx)
  const magnet = SensorHelper.getSensorFromBtxId('magnet', magnetSensorList, tx.btxId)
  if(!magnet){
    return null
  }

  const magnetOn = magnet.magnet == SENSOR.MAGNET_STATUS.ON
  const count = APP.SENSOR.MAGNET_ON_IS_USED && magnetOn || !APP.SENSOR.MAGNET_ON_IS_USED && !magnetOn? 1: 0
  const txBtn = createUseStateIcon(tx.sensorId, count, mapScale)

  txBtn.x = tx.location.x
  txBtn.y = tx.location.y
  return txBtn
}

/**
 * 温度の画像アイコンを作成する。
 * @method
 * @param {Object} stage
 * @param {Object} exb
 * @return {Object}
 */
export const createDiscomfortIcon = (stage, exb, mapScale) => {
  const discomfort = SensorHelper.getDiscomfort(exb.temperature, exb.humidity)
  const bitmap = discomfort == DISCOMFORT.COLD? cold: discomfort == DISCOMFORT.COMFORT? comfort: hot
  const icon = new Bitmap(bitmap)
  icon.image.onload = () => {
    icon.x = 0
    icon.y = 0
    icon.scaleX = 25 / icon.image.width / mapScale
    icon.scaleY = icon.scaleX
    icon.regX = icon.image.width / 2
    icon.regY = icon.image.height / 2
    stage.update()
  }
  return icon
}

/**
 * 温湿度の丸枠アイコンを作成する。
 * @method
 * @param {Object} iconInfo
 * @param {Number} mapScale
 * @return {Object}
 */
export const createThermohShape = (iconInfo, mapScale) => {
  const btnicon = new Shape()
  btnicon.graphics.beginFill(iconInfo.color).drawCircle(0, 0, DISP.THERMOH.R_SIZE / mapScale, DISP.THERMOH.R_SIZE / mapScale)
  btnicon.alpha = DISP.THERMOH.ALPHA
  return btnicon
}

/**
 * 温湿度アイコンのフォントを取得する
 * @method
 * @param {String} ft
 * @param {Number} mapScale
 * @return {String}
 */
export const getThermohFont = (ft = DISP.THERMOH.FONT, mapScale) => {
  const font = ft.split('px')
  const fontSize = Number(font[0]) / mapScale
  return Math.round(fontSize) + 'px' + font[1]
}

/**
 * 温湿度アイコンのラベルを作成する。
 * @method
 * @param {Object} device
 * @param {Number} mapScale
 * @return {Object}
 */
export const createThermoLabel = (device, mapScale) => {
  const text = NumberUtil.formatTemperature(device.temperature) + i18n.tnl('label.temperatureUnit') + '\n' + NumberUtil.formatHumidity(device.humidity) + i18n.tnl('label.humidityUnit')
  const label = new Text(text)
  label.font = getThermohFont(DISP.THERMOH.FONT, mapScale)
  label.color = DISP.THERMOH.COLOR
  label.textAlign = 'center'
  label.textBaseline = 'alphabetic'
  label.y = -2
  return label
}

/**
 * 温湿度用アイコンを作成する。EXB、Tx共通
 * @method
 * @param {Object} device
 * @param {Number} mapScale
 * @param {Object} stage
 * @return {Object}
 */
export const createThermohIcon = (device, mapScale, stage) => {
  const btn = new Container()
  const iconInfo = SensorHelper.getThermohumidityIconInfo(SensorHelper.getThermoPatternConfig(), device.temperature, device.humidity)
  if (DISP.THERMOH.DISP == 'icon') {
    btn.addChild(createDiscomfortIcon(stage, device, mapScale))
  }
  else {
    btn.addChild(createThermohShape(iconInfo, mapScale))
    btn.addChild(createThermoLabel(device, mapScale))
  }
  btn.device = device
  btn.x = device.x
  btn.y = device.y
  btn.cursor = 'pointer'
  btn.iconInfo = iconInfo
  return btn
}

/**
 * 地図に表示するEXBのアイコンを作成する。
 * @method
 * @param {Object} exb
 * @param {Number} mapScale
 * @return {Object}
 */
export const createExbIcon = (exb, exbSensorIdList, mapScale, stage) => {
  if (!SensorHelper.includesSensorId(exbSensorIdList, exb.sensorId)) {
    return null
  }
  let exbBtn = null
  if(exb.sensorId == SENSOR.TEMPERATURE){
    exbBtn = createThermohIcon(exb, mapScale, stage)
  }
  else if (exb.sensorId == SENSOR.THERMOPILE && exb.count != null) {
    // not use?
    // if (exb.count > 10) {
    //   w = DISP.THERMOPILE_L_SIZE
    // }
    // else if (exb.count > 5) {
    //   w = DISP.THERMOPILE_M_SIZE
    // }
    // else {
    //   w = DISP.THERMOPILE_S_SIZE
    // }

    // only for Exhibition（delete immediately）
    exbBtn = createCountButton(exb.count, mapScale)
    exbBtn.cursor = ''
  }
  else if (exb.sensorId == SENSOR.PRESSURE && exb.pressVol != null) {
    exbBtn = createUseStateIcon(exb.sensorId, exb.pressVol, mapScale)
    exbBtn.cursor = ''
  }
  else {
    exbBtn = createUseStateIcon(exb.sensorId, exb.count, mapScale)
    exbBtn.cursor = ''
  }
  exbBtn.deviceId = exb.deviceId
  exbBtn.exbId = exb.exbId
  exbBtn.x = exb.x
  exbBtn.y = exb.y
  return exbBtn
}
