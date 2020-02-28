/**
 * アイコンに関するヘルパーモジュール
 * @module helper/ui/IconHelper
 */

import _ from 'lodash'
import { Container, Shape, Text, Bitmap } from 'createjs-module'
import cold from '../../../assets/icon/cold.png'
import comfort from '../../../assets/icon/comfort.png'
import hot from '../../../assets/icon/hot.png'
import toiletM from '../../../assets/icon/male.svg'
import toiletF from '../../../assets/icon/female.svg'
import toiletS from '../../../assets/icon/share.svg'
import toiletP from '../../../assets/icon/multipurpose.svg'
import toiletUse from '../../../assets/icon/inuse.png'
import toiletEmpty from '../../../assets/icon/notuse.png'
import { APP, DISP } from '../../constant/config'
import { SHAPE, TX, SENSOR, DISCOMFORT, FONT, LOCATION } from '../../constant/Constants'
import * as ColorUtil from '../../util/ColorUtil'
import * as NumberUtil from '../../util/NumberUtil'
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
export const getLocationColor = (location, locationInfo) => {
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
export const createPositionRectInfo = (pos, bgColor) => {
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
export const createPositionTxIcon = (pos, shape, color, bgColor, mapScale) => {
  const rectInfo = createPositionRectInfo(pos, bgColor)
  const txRadius = (pos.txR? pos.txR: DISP.TX.R) / mapScale
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

export const createMRoomUseStateIcon = (sensorId, count, mapScale, bgColor) => {
  const shapeInfo = createExbShapeInfo(sensorId, count)
  const labelInfo = createExbLabelInfo(sensorId, count)
  const size = shapeInfo.width / mapScale
  return createRectIcon(labelInfo.label, size, size, labelInfo.color, bgColor, {bold: false})
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
  let exbBtn = null
  if (SensorHelper.match(exb.sensorIdList, SENSOR.TEMPERATURE, exbSensorIdList)) {
    exbBtn = createThermohIcon(exb, mapScale, stage)
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
  }
  else if (SensorHelper.match(exb.sensorIdList, SENSOR.PRESSURE, exbSensorIdList) && exb.pressVol != null) {
    exbBtn = createUseStateIcon(exb.sensorId, exb.pressVol, mapScale)
    exbBtn.cursor = ''
  }
  else if (SensorHelper.match(exb.sensorIdList, SENSOR.PIR, exbSensorIdList)) {
    exbBtn = createUseStateIcon(exb.sensorId, exb.count, mapScale)
    exbBtn.cursor = ''
  } else {
    let showMRoomStatus // FIXME: 定義されていないので仮にここに
    if (exb.sensorId == SENSOR.PRESSURE && exb.pressVol != null) {
      exbBtn = showMRoomStatus
        ? createMRoomUseStateIcon(exb.sensorId, exb.pressVol, mapScale, bgColor)
        : createUseStateIcon(exb.sensorId, exb.pressVol, mapScale)
      exbBtn.cursor = ''
    } else {
      exbBtn = showMRoomStatus
        ? createMRoomUseStateIcon(exb.sensorId, exb.count, mapScale, bgColor)
        : createUseStateIcon(exb.sensorId, exb.count, mapScale)
      exbBtn.cursor = ''
    }
  }
  exbBtn.deviceId = exb.deviceId
  exbBtn.exbId = exb.exbId
  exbBtn.x = exb.x
  exbBtn.y = exb.y
  return exbBtn
}

/**
 * トイレアイコンを取得する。
 * @method
 * @param {String} type
 * @return {Object}
 */
export const getToiletImage = type => {
  if(type == LOCATION.EXT_VALUE.TOILET.MALE) {
    return toiletM
  }
  if(type == LOCATION.EXT_VALUE.TOILET.FEMALE) {
    return toiletF
  }
  if(type == LOCATION.EXT_VALUE.TOILET.SHARE) {
    return toiletS
  }
  if(type == LOCATION.EXT_VALUE.TOILET.MULTIP) {
    return toiletP
  }
  return ''
}

/**
 * トイレカウント（数値）アイコンを編集する。
 * @method
 * @param {Object} stage
 * @param {Number} count
 * @param {Number} allCount
 */
export const editToiletNumIcon = (stage, emptyCount, allCount) => {
  const container = stage.getChildAt(0).getChildByName('info')
  if(!container) {
    return
  }
  const allCountContainer = container.getChildByName('allCount')
  if(allCountContainer) {
    allCountContainer.text = allCount <= 0? '-': allCount
  }
  const countContainer = container.getChildByName('count')
  if(countContainer) {
    countContainer.text = allCount <= 0? '-': emptyCount
    countContainer.color = allCount > 0 && emptyCount <= 0? '#FF0000': '#000000'
  }
}

/**
 * トイレカウント（マーク）アイコンを編集する。
 * @method
 * @param {Object} stage
 * @param {Number} emptyCount
 * @param {Number} allCount
 */
export const editToiletMarkIcon = (stage, emptyCount, allCount) => {
  const container = stage.getChildAt(0).getChildByName('info')
  if(!container) {
    return
  }
  let useCount = allCount - emptyCount

  const markList = container.children
  const markLength = markList.length
  for(let idx = 0; idx < markLength; idx++) {
    const mark = markList[idx]
    mark.image.src = useCount-- <= 0? toiletEmpty: toiletUse
    mark.visible = idx < allCount
  }
}

/**
 * トイレカウントアイコンを編集する。
 * @method
 * @param {Object} stage
 * @param {Number} count
 * @param {Number} allCount
 */
export const editToiletIcon = (stage, count, allCount) => {
  const container = stage.getChildAt(0).getChildByName('info')
  if(!container) {
    return
  }
  if(container.type == 'number') {
    editToiletNumIcon(stage, count, allCount)
    return
  }
  if(container.type == 'mark') {
    editToiletMarkIcon(stage, count, allCount)
    return
  }
}

/**
 * トイレカウント（数値）のアイコンを作成する。
 * @method
 * @return {Object}
 */
export const createToiletNumIcon = () => {
  let left = 0

  const infoIcon = new Container()
  infoIcon.name = 'info'
  infoIcon.type = 'number'

  const emptyString = new Text(i18n.tnl('label.emptyToilet'), FONT.OPTION.BOLD + DISP.TOILET.BASE_FONT_SIZE * 0.7 + FONT.TYPE)
  emptyString.x = left
  infoIcon.addChild(emptyString)
  left = emptyString.getBounds().width

  const count = new Text(99, FONT.OPTION.BOLD + DISP.TOILET.BASE_FONT_SIZE + FONT.TYPE)
  count.x = left + DISP.TOILET.BASE_FONT_SIZE * 1.5
  count.textAlign = 'right'
  count.name = 'count'
  infoIcon.addChild(count)
  left = count.x

  const allCount = new Text(99, FONT.OPTION.BOLD + DISP.TOILET.BASE_FONT_SIZE * 0.7 + FONT.TYPE)
  allCount.x = left + DISP.TOILET.BASE_FONT_SIZE * 0.8
  allCount.y = DISP.TOILET.BASE_FONT_SIZE * 1.5
  allCount.textBaseline = 'alphabetic'
  allCount.name = 'allCount'
  infoIcon.addChild(allCount)

  const slash = new Shape()
  slash.graphics.beginStroke('#000')
  slash.graphics.setStrokeStyle(2)
  slash.graphics.moveTo(left, DISP.TOILET.BASE_FONT_SIZE * 1.5)
  slash.graphics.lineTo(left + DISP.TOILET.BASE_FONT_SIZE, DISP.TOILET.BASE_FONT_SIZE * 0.5)
  infoIcon.addChild(slash)

  count.text = ''
  allCount.text = ''
  return infoIcon
}

/**
 * トイレカウント（マーク）のアイコンを作成する。
 * @method
 * @return {Object}
 */
export const createToiletMarkIcon = maxSize => {
  const infoIcon = new Container()
  infoIcon.name = 'info'
  infoIcon.type = 'mark'

  const maxRow = Math.ceil(maxSize / DISP.TOILET.MARK_COLUMN_NUM)
  for(let h = 0; h < maxRow; h++) {
    for(let w = 0; w < DISP.TOILET.MARK_COLUMN_NUM; w++) {
      const img = new Bitmap(toiletEmpty)
      img.image.onload = () => {
        img.scaleX = img.scaleY = DISP.TOILET.BASE_MARK_R / img.image.width
        img.x = DISP.TOILET.BASE_MARK_R * (w + 0.5) + w
        img.y = DISP.TOILET.BASE_MARK_R * (h + 0.5) + h
        img.stage.update()
      }
      infoIcon.addChild(img)
    }
  }
  return infoIcon
}

/**
 * カウント用のアイコンを作成する。
 * @method
 * @param {String} type
 * @param {Number} mode
 * @return {Object}
 */
export const createToiletIcon = (type, mode, maxSize) => {
  const parentIcon = new Container()
  const infoIcon = mode == 0? createToiletNumIcon(): createToiletMarkIcon(maxSize)

  const img = new Bitmap(getToiletImage(type))
  img.image.onload = () => {
    img.scaleX = img.scaleY = 48 / img.image.width
    img.stage.update()
    infoIcon.x = img.image.width * img.scaleX
    infoIcon.stage.update()
  }
  parentIcon.addChild(img)
  parentIcon.addChild(infoIcon)

  return parentIcon
}
