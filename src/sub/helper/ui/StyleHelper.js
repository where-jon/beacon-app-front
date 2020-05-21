/**
 * cssスタイルに関するヘルパーモジュール
 * @module helper/ui/StyleHelper
 */

import { DISP } from '../../constant/config'
import { SHAPE, FONT } from '../../constant/Constants'
import * as ColorUtil from '../../util/ColorUtil'
import * as StringUtil from '../../util/StringUtil'
import * as SensorHelper from '../domain/SensorHelper'
import * as Util from '../../util/Util'

export const defaultDisplay = {
  color: DISP.TX.COLOR,
  bgColor: DISP.TX.BGCOLOR,
  shape: DISP.TX.SHAPE,
}

/**
 * カテゴリ、グループのサンプル矩形スタイルを取得する。
 * @method
 * @param {Object[]} entity
 * @return {Object[]}
 */
export const getStyleDisplay = entity => entity.map(val => ({entity: val, style: getStyleDisplay1(val)}))

/**
 * サンプル矩形スタイルを取得する。
 * @method
 * @param {{shape: Number, color: String, bgColor: String}} val
 * @param {{reverceColor: Boolean, fixSize: Boolean}} [option = {reverceColor: false, fixSize: true}]
 * @return {Object}
 */
export const getStyleDisplay1 = (val, option = {reverceColor: false, fixSize: true}) => {
  const style = {
    'color': ColorUtil.colorCd4display(option.reverceColor? val.bgColor: val.color),
    'background-color': ColorUtil.colorCd4display(option.reverceColor? val.color: val.bgColor, '#FFFFFF'),
    'text-align': 'center',
    border: Util.nvl(val.border, 'solid 1px #ccc'),
    'border-radius': val.shape == SHAPE.CIRCLE? '50%': val.shape == SHAPE.ROUND_SQUARE? DISP.TX.ROUNDRECT_RADIUS + 'px': null,
    'justify-content': 'center',
    'display': ['-ms-flexbox', '-webkit-flex', 'flex'],
    '-ms-flex-align': 'center',
    '-webkit-box-align': 'center',
    'align-items': 'center',
    'white-space': 'nowrap',
  }
  const label = Util.getValue(val, 'label')
  let r = val.size? val.size: option.fixSize != false? DISP.TX.FIX_R: DISP.TX.R
  const fontSize = label? getInRectFontSize(label, r * 2, r * 2): r
  style.font = getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
  style.width = (r * 2) + 'px'
  style.height = (r * 2) + 'px'
  return style
}

/**
 * 指定したサイズに収まるフォントデータを取得する。
 * @method
 * @param {String} text
 * @param {Number} width 最大幅
 * @param {Number} height 最大高さ
 * @param {Number} maxFontSize 最大フォントサイズ
 * @return {String}
 */
export const getInRectFontSize = (text, width, height, maxFontSize) => {
  if(!Util.hasValue(text)){
    return getAdjustFontSize(() => 0)
  }
  const dummyFontSize = 10
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = `${dummyFontSize}${FONT.TYPE}`
  const metrix = context.measureText(text)
  const w = Math.floor(dummyFontSize * width / metrix.width)
  const h = Math.floor(dummyFontSize * height / dummyFontSize) - 5
  const inRectSize = (w > h? h: w) - 1
  return getAdjustFontSize(() => maxFontSize != null && maxFontSize < inRectSize? maxFontSize: inRectSize)
}

/**
 * 指定したフォントサイズでstyle用のフォントデータを作成する。ただし規定値以下のサイズの場合は調整される。
 * @method
 * @param {Function} getFontSize 基盤となるフォントサイズを算出する。引数なし。
 * @param {Boolean} [isBold = false] 太字の場合はtrue
 * @return {String}
 */
export const getAdjustFontSize = (getFontSize, isBold = false) => {
  const size = Math.round(getFontSize())
  return `${isBold? 'bold ': ''}${(size < FONT.SIZE.MIN? FONT.SIZE.MIN: size)}${FONT.TYPE}`
}

/**
 * フォントデータからフォントサイズを取得する。
 * @method
 * @param {String} font フォントデータ
 * @param {Number}
 */
export const getFont2Size = font => Number(font.split(' ').find(val => val.match(/[0-9]+/)).replace(/[^0-9]/g, ''))

/**
 * 指定したフォント1文字がラベルに収まるか。
 * @method
 * @param {Number} iconRadius アイコンの半径
 * @param {Number|String} font フォントサイズ、またはフォントデータ
 * @param {Boolean} useLabel ラベルを使用する
 */
export const inLabel = (iconRadius, font, useLabel) => {
  if(!useLabel){
    return false
  }
  const fontSize = typeof font == 'number'? font: getFont2Size(font)
  return iconRadius >= fontSize * 1.5
}

/**
 * 位置表示用のアイコンスタイルを取得する。
 * @method
 * @param {Object} tx
 * @return {{color: String, bgColor: String, shape: Number}}
 */
export const getPositionDisplay = (tx, useDefaultColor) => {
  const display = tx.display? tx.display: Util.v(tx, 'pot.' + DISP.TX.DISPLAY_PRIORITY + '.display', {})
  const color = display.color ? display.color : useDefaultColor ? defaultDisplay.color : DISP.TX.COLOR
  const bgColor = display.bgColor ? display.bgColor : useDefaultColor ? defaultDisplay.bgColor : DISP.TX.BGCOLOR
  return {
    color: StringUtil.addPrefix(color, '#'),
    bgColor: StringUtil.addPrefix(bgColor, '#'),
    shape: display.shape || DISP.TX.SHAPE
  }
}

/**
 * 位置表示Txアイコンの文字色を取得する。
 * @method
 * @param {Object} display
 * @param {Object} meditag
 * @param {Object} magnet
 * @return {String}
 */
export const getTxIconColor = (display, meditag, magnet) => meditag? '#000': SensorHelper.isMagnetOn(magnet)? display.bgColor : display.color

/**
 * 位置表示Txアイコンの背景色を取得する。
 * @method
 * @param {Object} display
 * @param {Object} meditag
 * @param {Object} magnet
 * @return {String}
 */
export const getTxIconBgColor = (display, meditag, magnet) => meditag? meditag.bg: SensorHelper.isMagnetOn(magnet)? display.color: display.bgColor

/**
 * 長方形配置時の、原点からの距離(半径)を取得する
 * @method
 * @param {Number} index
 * @param {Number} radius
 * @return {Number}
 */
export const getRadiusSquare = (index, radius) => index % 2 === 0 ? radius : Math.sqrt(Math.pow(radius, 2) * 2)

/**
 * ひし形配置時の、原点からの距離(半径)を取得する
 * @method
 * @param {Number} index
 * @param {Number} radius
 * @return {Number}
 */
export const getRadiusDiamond = (index, radius) => (index % 2 !== 0 && index % 6 !== 0) ? radius : radius * 1.5



