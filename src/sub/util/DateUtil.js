import moment from 'moment'
import { APP } from '../constant/config'
import { hasValue, debug } from './Util'

/**
 * フォーマットした日時情報を取得する。
 * @method
 * @param {Date} date
 * @param {String} by 'day'は日付以降を切り捨て。'hour'は分以降を切り捨て。それ以外は秒以降を切り捨て。
 * @return {{key: String, text: String}} byが'day'の場合のみtextプロパティを含む。
 */
export const formatDateRange = (date, by) => {
  const zMonth = `00${date.getMonth() + 1}`.slice(-2)
  const zDate = `00${date.getDate()}`.slice(-2)
  let key = `${date.getFullYear()}/${zMonth}/${zDate}`
  if(by == 'day'){
    return {key: `${key} 00:00`, text: key}
  }
  if(by == 'hour'){
    return {
      key: `${key} ${`00${date.getHours()}`.slice(-2)}:00`,
    }
  }
  return {
    key: `${key} ${`00${date.getHours()}`.slice(-2)}:${`00${date.getMinutes()}`.slice(-2)}`,
  }
}

/**
 * フォーマットした日時情報の配列を取得する。
 * @method
 * @param {Number|Date|String} start
 * @param {Number|Date|String} end
 * @param {String} by 'day'は日ごと。'hour'は時ごと。それ以外は分ごと。
 * @return {Object[]} keyプロパティを含む。by='day'の場合、さらにtextプロパティを含む。
 */
export const dateRange = (start, end, by) => {
  const ret = []
  const date = new Date(start)
  if(by == 'day'){
    for(; date < end; date.setDate(date.getDate() + 1)) {
      ret.push(formatDateRange(date, by))
    }
    ret.push(formatDateRange(date, by))
    return ret
  }
  if(by == 'hour'){
    for(; date < end; date.setHours(date.getHours() + 1)) {
      ret.push(formatDateRange(date, by))
    }
    ret.push(formatDateRange(date, by))
    return ret
  }
  for(; date < end; date.setMinutes(date.getMinutes() + 1)) {
    ret.push(formatDateRange(date, by))
  }
  ret.push(formatDateRange(date, by))
  return ret
}

/**
 * 日付フォーマットを行う。
 * @method
 * @param {Number|Date} timestamp 任意のエポック秒またはDateオブジェクト。エポック秒の場合はコンソール警告が出る。
 * @param {String} [format = 'YYYY/MM/DD HH:mm:ss'] 表記はmoment.jsに準拠。
 * @return {String}
 */
export const formatDate = (timestamp, format = 'YYYY/MM/DD HH:mm:ss') => timestamp? moment(timestamp).format(format): ''

/**
 * 時刻フォーマットを行う。
 * @method
 * @param {Number} time エポック秒
 * @param {String} [format = 'HH:mm:ss'] 'HH','mm','ss'の自動変換に対応。
 * @return {String}
 */
export const formatTime = (time, format = 'HH:mm:ss') => {
  if(time == null || format == null){
    return ''
  }
  const hour = Math.floor(time / 3600)
  const minute = Math.floor((time / 60) % 60)
  const second = time % 60
  const hourDigit = hour.toString().length
  const hourSliceDigit = -1 * (hourDigit < 2? 2: hourDigit)
  return format.replace(/HH/g, `00${hour}`.slice(hourSliceDigit))
    .replace(/mm/g, `00${minute}`.slice(-2))
    .replace(/ss/g, `00${second}`.slice(-2))
}

/**
 * 指定した日時が現在時刻を下回っているか。
 * @method
 * @param {Number} time エポック秒
 * @return {Boolean}
 */
export const isExpired = time => time != null? time < (new Date()).getTime(): false

/**
 * 現在日付の午前0時を示すエポック秒を返す。
 * @method
 * @return {Number}
 */
export const getMidnightMs = () => {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const offset = APP.COMMON.TIME_ZONE * 60 * 60 * 1000
  const nowToday = Math.floor(now.getTime() / dayMs)
  const midnight = (nowToday * dayMs) + offset
  debug('calcurating midnight. now is ', now)
  debug(now.getTime())
  debug('midnight is ', midnight)
  debug(new Date(midnight))
  return midnight
}

/**
 * 日時を文字列にフォーマットする。
 * @method
 * @param {Date} date
 * @param {String} format 'yyyy','MM','dd','HH','mm','ss','SSS'の自動変換に対応
 * @return {String}
 */
export const formatDatetime = (date, format) => {
  return format.replace(/yyyy/g, `0000${date.getFullYear()}`.slice(-4))
    .replace(/MM/g, `00${date.getMonth() + 1}`.slice(-2))
    .replace(/dd/g, `00${date.getDate()}`.slice(-2))
    .replace(/HH/g, `00${date.getHours()}`.slice(-2))
    .replace(/mm/g, `00${date.getMinutes()}`.slice(-2))
    .replace(/ss/g, `00${date.getSeconds()}`.slice(-2))
    .replace(/SSS/g, `000${date.getMilliseconds()}`.slice(-3))
}

/**
 * 日付情報を編集する。
 * @method
 * @param {Date} baseDatetime 
 * @param {{year: Number, date: Number, hours: Number, minutes: Number, seconds: Number}} controlData 日時を調整する場合に定義する
 * @param {String} format 'yyyy','MM','dd','HH','mm','ss','SSS'の自動変換に対応
 * @return {String|Date} formatを定義している場合はString。定義していない場合はDate
 */
export const getDatetime = (baseDatetime, controlData, format) => {
  const datetime = new Date(baseDatetime.getTime())
  datetime.setMilliseconds(0)
  if(!controlData){
    return format? formatDatetime(datetime, format): datetime
  }
  datetime.setFullYear(datetime.getFullYear() + (controlData.year? controlData.year: 0))
  datetime.setDate(datetime.getDate() + (controlData.date? controlData.date: 0))
  datetime.setHours(datetime.getHours() + (controlData.hours? controlData.hours: 0))
  datetime.setMinutes(datetime.getMinutes() + (controlData.minutes? controlData.minutes: 0))
  datetime.setSeconds(datetime.getSeconds() + (controlData.seconds? controlData.seconds: 0))
  return format? formatDatetime(datetime, format): datetime
}

/**
 * 日付の差分を算出する。
 * @method
 * @param {Date} datetimeFrom
 * @param {Date} datetimeTo
 * @return {{date: Number, hour: Number, minute: Number}}
 */
export const getSubDatetime = (datetimeFrom, datetimeTo) => {
  const subTime = new Date(datetimeTo.getTime()) - new Date(datetimeFrom.getTime())
  const subDatetime = {}
  subDatetime.minute = subTime / 1000 / 60
  subDatetime.hour = subDatetime.minute / 60
  subDatetime.date = subDatetime.hour / 24
  return subDatetime
}

/**
 * 時間を「HH:mm:ss」形式に変換する。
 * @method
 * @param {Number} secTime 秒
 * @return {String}
 */
export const convertToTime = secTime => {
  if (secTime < 0) {
    return 'hh:mm'
  }
  let sec = (secTime % 60) % 60
  let min = Math.floor(secTime / 60) % 60
  let hour = Math.floor(secTime / 3600)
  let h = hour < 10? '0' + hour: hour
  let m = min < 10? '0' + min: min
  let s = sec < 10? '0' + sec: sec
  return h + ':' + m + ':' + s
}

/**
 * 指定した日時が現在日付の月末を過ぎているか。
 * @method
 * @param {Date} date
 * @return {Boolean}
 */
export const isAfterNextMonth = date => hasValue(date) && moment(date).isAfter(moment().endOf('months'))

