import { DISP } from '../constant/config'
import { SHAPE, FONT } from '../constant/Constants'
import * as ColorUtil from '../util/ColorUtil'
import * as Util from '../util/Util'


/**
 * カテゴリ、グループのサンプル矩形スタイルを取得する。
 * @param {Object[]} entity 
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
    border: 'solid 1px #ccc',
    'border-radius': val.shape == SHAPE.CIRCLE? '50%': val.shape == SHAPE.ROUND_SQUARE? DISP.TX.ROUNDRECT_RADIUS + 'px': null,
    'justify-content': 'center',
    'display': ['-ms-flexbox', '-webkit-flex', 'flex'],
    '-ms-flex-align': 'center',
    '-webkit-box-align': 'center',
    'align-items': 'center',
    'white-space': 'nowrap',
  }
  const label = Util.getValue(val, 'label', null)
  if(option.fixSize != false){
    const fontSize = label? getInRectFontSize(label, DISP.TX.FIX_R * 2, DISP.TX.FIX_R * 2): DISP.TX.FIX_R
    style.font = getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
    style.width = (DISP.TX.FIX_R * 2) + 'px'
    style.height = (DISP.TX.FIX_R * 2) + 'px'
  }
  else{
    const fontSize = label? getInRectFontSize(label, DISP.TX.R * 2, DISP.TX.R * 2): DISP.TX.R
    style.font = getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
    style.width = (DISP.TX.R * 2) + 'px'
    style.height = (DISP.TX.R * 2) + 'px'
  }
  return style
}

/**
 * 指定したサイズに収まるフォントデータを取得する。
 * @method
 * @param {String} text
 * @param {Number} width 最大幅
 * @param {Number} height 最大高さ
 * @return {String}
 */
export const getInRectFontSize = (text, width, height) => {
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
  return getAdjustFontSize(() => (w > h? h: w) - 1)
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

