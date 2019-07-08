/**
 * 数値に関するユーティリティモジュール
 * @module util/NumberUtil
 */

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

