import { FONT } from '../constant/Constants'
import { hasValue } from './Util'

/**
 * 指定したサイズに収まるフォントデータを取得する。
 * @method
 * @param {String} text
 * @param {Number} width 最大幅
 * @param {Number} height 最大高さ
 * @return {String}
 */
export const getInRectFontSize = (text, width, height) => {
  if(!hasValue(text)){
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

