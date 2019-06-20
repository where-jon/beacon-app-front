/**
 * カラーコードの先頭から'#'を除去し、6文字になるように0埋めした文字列を取得。
 * @method
 * @param {String|{hex: String}} obj 16進数数値を示す文字列、または同様の文字列をhexプロパティに持つオブジェクト
 * @return {String}
 */
export const colorCd4db = obj => {
  if(!obj){
    return '000000'
  }
  const str = obj.hex? obj.hex: obj
  const color = str.replace('#', '')
  return `000000${color}`.slice(-6)
}

/**
 * カラーコードの先頭に'#'を付与した文字列を取得。最初から付与されている場合は何もしない。
 * @method
 * @param {String|{hex: String}} obj 16進数数値を示す文字列、または同様の文字列をhexプロパティに持つオブジェクト
 * @param {String} [defaultColor = '#000000'] objが空の場合に取得するカラーコード
 * @return {String}
 */
export const colorCd4display = (obj, defaultColor = '#000000') => {
  if(!obj){
    return defaultColor
  }
  let color = obj.hex? obj.hex: obj
  return '#' + color.replace('#', '').slice(0, 6)
}

/**
 * RGB成分を取得する
 * @method
 * @param {String} hex 16進数数値を示す文字列
 * @return {Number[]}　要素0番目からRの成分値、Gの成分値、Bの成分値
 */
export const colorCdHex2Decimal = hex => {
  const hexCd = hex.replace('#', '')
  return [
    parseInt(hexCd.slice(0, 2), 16),
    parseInt(hexCd.slice(2, 4), 16),
    parseInt(hexCd.slice(4, 6), 16)
  ]
}

