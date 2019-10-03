import { hasValue } from './Util'

/**
 * 数値に関するユーティリティモジュール
 * @module util/NumberUtil
 */

/**
 * 16進数値か確認する。
 * @method
 * @param {String} val 
 * @return {Boolean}
 */
export const isHex = val => /^[0-9a-fA-F]*$/.test(val)

/**
 * 小数点以下が0で終わる場合、それらを取り除く。
 * @method
 * @param {Number} val
 * @return {Number}
 * @example
 * 10203.405060 => 10203.40506
 */
export const trim = val => {
  const str = val.toString()
  if(typeof val != 'number' || !str.match(/\./)){
    return val
  }
  const ret = str.match(/^.*[1-9]/g)
  return ret && ret[0] != null? parseFloat(ret): val
}

/**
 * 指定した小数位で切り捨てた数値を取得する。
 * @method
 * @param {Number} val
 * @param {Number} [decimalPoint = 2] 小数第N位
 * @return {Number}
 */
export const floorVal = (val, decimalPoint = 2) => {
  const operate = Math.pow(10, decimalPoint)
  return Math.floor(val * operate) / operate
}

/**
 * 輝度を取得する。
 * @method
 * @param {String} hex rbgを16進数の数値6桁で表した文字列
 * @return {Number}
 */
export const luminance = hex => {
  const num = parseInt(hex, 16)
  const r = num >> 16
  const g = num >> 8 & 0xff
  const b = num & 0xff
  return 0.298912 * r + 0.586611 * g + 0.114478 * b
}

/**
 * ビット積を使用したフラグ判定を行う。
 * @method
 * @param {Number} target チェック対象
 * @param {Number} bit チェック項目を示す2進数値
 * @return {Boolean}
 */
export const bitON = (target, bit) => {
  return (target & bit) == bit
}

/**
 * 温度情報をフォーマットする
 * @method
 * @param {Number} temperature
 * @return {String}
 */
export const formatTemperature = temperature => typeof temperature == 'number'? floorVal(temperature, 1): ''

/**
 * 湿度情報をフォーマットする
 * @method
 * @param {Number} humidity
 * @return {String}
 */
export const formatHumidity = humidity => typeof humidity == 'number'? floorVal(humidity, 0): ''

/**
 * 指定した座標が範囲内に存在するか確認する。
 * @method
 * @param {{x: Number, y: Number, w: Number, h: Number}} range 
 * @param {{x: Number, y: Number}} pos 
 * @return {Boolean}
 */
export const inRange = (range, pos) => {
  if (!hasValue(range.x) || !hasValue(range.y) || !hasValue(range.h) || !hasValue(range.w)) {
    return false
  }
  const right = range.x + range.w
  const bottom = range.y + range.h
  return range.x <= pos.x && pos.x <= right && range.y <= pos.y && pos.y <= bottom
}

/**
 * 中心座標と幅高さから矩形の頂点座標を取得する。
 * @method
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @return {Object}
 */
export const getRectInfoFromCenterPos = (x, y, width, height) => {
  const left = -width / 2
  const top = -height / 2
  return {
    left: x + left, right: x + left + width,
    top: y + top, bottom: y + top + height,
    width: width, height: height,
    centerX: x, centerY: y,
  }
}

/**
 * パラメータが整数値かどうか判定する。
 * @method
 * @param {Object} num
 * @return {Boolean} 整数値の場合true
 */
export const isNumber = (num)  => {
  var numberFormat = new RegExp(/^[0-9]+$/);
  return numberFormat.test(num);
}
