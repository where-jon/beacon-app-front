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
import { SHAPE, TX, SENSOR, DISCOMFORT, PRESENCE } from '../../constant/Constants'
import * as ColorUtil from '../../util/ColorUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as ConfigHelper from '../dataproc/ConfigHelper'
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
 * 場所配置アイコンの背景色を取得する。
 * @method
 * @param {Object} location
 * @param {Object} locationInfo 設定値「DISP.**_LOC」を使用する
 * @return {String}
 */
const getLocationColor = (location, locationInfo) => {
  const sensorNameList = Util.getValue(location, 'txList', [])
    .concat(Util.getValue(location, 'exbList', []))
    .map(device => device.sensorName)

  const hasTx = Util.hasValue(location.txList)
  const patternList = hasTx? locationInfo.BGCOLOR_PATTERN: locationInfo.BGCOLOR_PATTERN_NOTX
  const target = ConfigHelper.parseKeyValue(patternList).find(pattern => {
    return location.locationType == pattern.key || sensorNameList.some(sensorName => sensorName == pattern.key)
  }) 

  const defaultPattern = hasTx? locationInfo.BGCOLOR_DEFAULT: locationInfo.BGCOLOR_DEFAULT_NOTX
  return target? target.value: defaultPattern
}

/**
 * 円アイコンを作成する。
 * @method
 * @param {Number} radius
 * @param {String} color
 * @param {Object} [option = {}]
 * @return {Object}
 */
const createShape = (radius, color, option = {}) => {
  const icon = new Shape()
  icon.graphics.beginFill(color).drawCircle(0, 0, radius, radius)
  icon.alpha = Util.getValue(option, 'alpha', 1)
  icon.radius = radius
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
const createRect = (width, height, color, option = {}) => {
  const strokeColor = Util.getValue(option, 'strokeColor', '#000000')
  const strokeStyle = Util.getValue(option, 'strokeStyle', 0)
  const r = Util.getValue(option, 'roundRect', 0)
  const icon = new Shape()
  icon.graphics.beginStroke(strokeColor).setStrokeStyle(strokeStyle).beginFill(color)
  icon.width = width
  icon.height = height
  if(r == 0){
    icon.graphics.drawRect(-1 * width, -1 * height, width * 2, height * 2)
    return icon
  }
  icon.radius = r
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
const createText = (text, font, color, option = {}) => {
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
const createCircleIcon = (text, radius, color, bgColor, option = {}) => {
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
const createRectIcon = (text, width, height, color, bgColor, option = {}) => {
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
 * 場所アイコンを更新する。
 * @method
 * @param {Object} icon
 * @param {Object} location
 * @param {Object} locationInfo 設定値「DISP.**_LOC」を使用する
 * @param {Number} mapScale
 * @return {Object}
 */
export const refreshLocationIcon = (icon, location, locationInfo, mapScale) => {
  const rect = NumberUtil.getRectInfoFromCenterPos(0, 0, locationInfo.SIZE.W / mapScale, locationInfo.SIZE.H / mapScale)
  const iconArrowWidth = locationInfo.SIZE.W / 3 / mapScale
  const iconArrowHeight = locationInfo.SIZE.H / 3 / mapScale

  icon.graphics.beginFill(getLocationColor(location, locationInfo))
  icon.graphics.moveTo(rect.left, rect.top)
  icon.graphics.lineTo(rect.right, rect.top)
  icon.graphics.lineTo(rect.right, rect.bottom)
  icon.graphics.lineTo(rect.right - iconArrowWidth, rect.bottom)
  icon.graphics.lineTo(rect.right - iconArrowWidth - iconArrowWidth / 2, rect.bottom + iconArrowHeight)
  icon.graphics.lineTo(rect.right - iconArrowWidth - iconArrowWidth, rect.bottom)
  icon.graphics.lineTo(rect.left, rect.bottom)
  icon.graphics.lineTo(rect.left, rect.top)
}

/**
 * 場所アイコンのテキストを更新する。
 * @method
 * @param {Object} label
 * @param {Object} location
 * @param {Object} key
 * @param {Number} maxLength
 * @param {Object} locationInfo 設定値「DISP.**_LOC」を使用する
 * @param {Number} mapScale
 * @return {Object}
 */
export const refreshLocationIconText = (label, location, key, maxLength, locationInfo, mapScale) => {
  const rect = NumberUtil.getRectInfoFromCenterPos(0, 0, locationInfo.SIZE.W / mapScale, locationInfo.SIZE.H / mapScale)
  label.text = StringUtil.cutOnLongByte(location[key], maxLength)
  label.font = StyleHelper.getInRectFontSize(label.text, rect.width, rect.height, locationInfo.MAX_FONT_SIZE)
  label.color = locationInfo.COLOR
  label.textAlign = 'center'
  label.textBaseline = 'middle'
}

/**
 * 位置アイコンを作成する。
 * @method
 * @param {Object} location
 * @param {Object} key
 * @param {Number} maxLength
 * @param {Object} locationInfo 設定値「DISP.**_LOC」を使用する
 * @param {Number} mapScale
 * @return {Object}
 */
export const createLocationIcon = (location, key, maxLength, locationInfo, mapScale) => {
  const rect = NumberUtil.getRectInfoFromCenterPos(0, 0, locationInfo.SIZE.W / mapScale, locationInfo.SIZE.H / mapScale)
  const iconArrowHeight = locationInfo.SIZE.H / 3 / mapScale

  const icon = new Shape()
  refreshLocationIcon(icon, location, locationInfo, mapScale)

  const label = new Text()
  refreshLocationIconText(label, location, key, maxLength, locationInfo, mapScale)

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
const createPositionRectInfo = (pos, bgColor) => {
  let strokeAlpha = 1
  let fillAlpha = 1
  if (NumberUtil.bitON(pos.tx.disp, TX.DISP.ALWAYS)) {
    // 常時表示時
    fillAlpha = pos.isLost? DISP.TX.LOST_ALPHA: pos.isTransparent? DISP.TX.ALPHA: fillAlpha
  } else if (pos.isTransparent) {
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
const createPositionTxIcon = (pos, shape, color, bgColor, mapScale) => {
  const rectInfo = createPositionRectInfo(pos, bgColor)
  const txRadius = (pos.txR? pos.txR: DISP.TX.R) / mapScale
  const aspectRatio = Util.nvl(DISP.TX.ASPECT_RATIO, 1)
  return createIcon(
    pos.label, txRadius, txRadius * aspectRatio, color, rectInfo.bgColor, {
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
  txBtn.txId = pos.btxId
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
const createAbsentTxIcon = (pos, shape, color, bgColor, mapScale) => {
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
  txBtn.btxId = pos.btxId

  if (isAbsent) {
    txBtn = createAbsentTxIcon(pos, shape, color, bgColor, mapScale)
    txBtn.btxId = PositionHelper.zoneBtxIdAddNumber + pos.btxId
  }
  txBtn.x = pos.x
  txBtn.y = pos.y
  txBtn.color = color
  txBtn.bgColor = bgColor
  // txBtn.isTransparent  // TODO: 値をセットしていない

  // プレゼンスアイコン追加
  if (APP.POS.WITH.PRESENCE) {
    addPresenceIcon(pos, txBtn)
  }

  return txBtn
}

/**
 * プレゼンスアイコンを付加する
 * 
 * @param {*} pos 
 * @param {*} txBtn 
 */
const addPresenceIcon = (pos, txBtn) => {
  const shape = txBtn.children.find(e => e instanceof Shape)
  if (!shape) return

  const statusRadius = DISP.TX.PRESENCE.R // ステータスアイコンの半径
  let x, y // TXアイコン内の位置を計算
  if (shape.width) {
    if (shape.radius) { // 角丸四角の場合
      x = shape.width - shape.radius * (1 - Math.sqrt(0.5)) - statusRadius
      y = shape.height - shape.radius * (1 - Math.sqrt(0.5)) - statusRadius
    }
    else { // 四角の場合
      x = (shape.width - statusRadius) * 0.95 // 若干隙間を入れる
      y = (shape.height - statusRadius) * 0.95
    }
  }
  else { // 円の場合
    x = y = Math.sqrt(0.5) * shape.radius - statusRadius
  }

  let status = Util.nvl(pos.presenceStatus, PRESENCE.STATUS.PresenceUnknown)
  const icon = new Shape()
  if (ArrayUtil.equalsAny(status, [PRESENCE.STATUS.BeRightBack, PRESENCE.STATUS.DoNotDisturb])) {
    // 中抜にする
    icon.graphics.beginStroke(DISP.PRESENCE.BG[status - 2]) // 滞在グラフとは異なり一つ前の色に合わせる
    icon.graphics.setStrokeStyle(statusRadius / 1.5)
    icon.graphics.beginFill('#FFF')
    icon.graphics.drawCircle(0, 0, statusRadius * 0.9, statusRadius * 0.9) // 線を入れると若干大きくなるため補正
  }
  else {
    icon.graphics.beginFill(DISP.PRESENCE.BG[status - 1])
    icon.graphics.drawCircle(0, 0, statusRadius, statusRadius)
  }
  icon.x = x
  icon.y = y
  txBtn.addChild(icon)
}


/**
 * カウント用ラベルボタンを作成する。
 * @method
 * @param {Number} count
 * @param {Number} scale
 * @return {Object}
 */
const createCountButton = (count, scale) => {
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
const createExbShapeInfo = (sensorId, count) => {
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
const createExbLabelInfo = (sensorId, count) => {
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
const createUseStateIcon = (sensorId, count, mapScale) => {
  const shapeInfo = createExbShapeInfo(sensorId, count)
  const labelInfo = createExbLabelInfo(sensorId, count)
  return createCircleIcon(labelInfo.label, shapeInfo.width / mapScale, labelInfo.color, shapeInfo.bgColor, {bold: false})
}

export const createMRoomStateIcon = (name, x, y, mapScale, bgColor) => {
  const size = DISP.PIR.R_SIZE / mapScale
  const btn = createRectIcon(name, size, size, DISP.PIR.FGCOLOR, bgColor, {bold: false})
  btn.cursor = ''
  btn.x = x
  btn.y = y
  return btn
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
  const magnet = SensorHelper.getSensorFromBtxId('magnet', magnetSensorList, tx.btxId)
  if(!magnet){
    return null
  }

  const magnetOn = magnet.magnet == SENSOR.MAGNET_STATUS.ON
  const count = APP.SENSOR.MAGNET_ON_IS_USED && magnetOn || !APP.SENSOR.MAGNET_ON_IS_USED && !magnetOn? 1: 0
  const txBtn = createUseStateIcon(SENSOR.MAGNET, count, mapScale)

  txBtn.sensorName = i18n.tnl('label.magnet')
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
const createDiscomfortIcon = (stage, device, mapScale) => {
  const discomfort = SensorHelper.getDiscomfort(device.temperature, device.humidity)
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
const createThermohShape = (iconInfo, mapScale) => {
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
const getThermohFont = (ft = DISP.THERMOH.FONT, mapScale) => {
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
const createThermoLabel = (device, mapScale) => {
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
  if (!exb.sensorIdList || exb.sensorIdList[0] == null) return
  let exbBtn = null
  if (SensorHelper.match(exb.sensorIdList, SENSOR.TEMPERATURE, exbSensorIdList)) {
    exbBtn = createThermohIcon(exb, mapScale, stage)
    exbBtn.sensorName = i18n.tnl('label.temperature')
  }
  else if (SensorHelper.match(exb.sensorIdList, SENSOR.THERMOPILE, exbSensorIdList) && exb.count != null) { 
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
    exbBtn.sensorName = i18n.tnl('label.thermopile')
  }
  else if (SensorHelper.match(exb.sensorIdList, SENSOR.PRESSURE, exbSensorIdList) && exb.pressVol != null) {
    exbBtn = createUseStateIcon(SENSOR.PRESSURE, exb.pressVol, mapScale)
    exbBtn.cursor = ''
    exbBtn.sensorName = i18n.tnl('label.pressure')
  }
  else if (SensorHelper.match(exb.sensorIdList, SENSOR.PIR, exbSensorIdList)) {
    exbBtn = createUseStateIcon(SENSOR.PIR, exb.count, mapScale)
    exbBtn.cursor = ''
    exbBtn.sensorName = i18n.tnl('label.pir')
  }
  exbBtn.deviceId = exb.deviceId
  exbBtn.exbId = exb.exbId
  exbBtn.x = exb.x
  exbBtn.y = exb.y
  return exbBtn
}

