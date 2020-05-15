/**
 * EXCloudに関するヘルパーモジュール
 * （実際現状、EXCloud直ではなく、app-service経由）
 * 
 * @module helper/dataproc/EXCloudHelper
 */

import _ from 'lodash'
import * as mock from '../../../assets/mock/mock'
import { DEV, EXSERVER, EXCLOUD, APP_SERVICE } from '../../constant/config'
import * as DateUtil from '../../util/DateUtil'
import * as HttpHelper from '../base/HttpHelper'
import { SENSOR } from '../../constant/Constants'

/**
 * 日付フォーマットを行う。
 * @method
 * @param {Number|Date} time 任意のエポック秒またはDateオブジェクト。エポック秒の場合はコンソール警告が出る。
 * @return {String}
 */
export const dateform = time => DateUtil.dateform(time)

/**
 * 表示用の時間を取得する。
 * @method
 * @param {Object} pos 位置情報
 * @return {Number}
 */
export const getDispTime = pos => pos.updatetime? pos.updatetime: pos.timestamp

/**
 * EXCloudのURLを取得する。
 * @method
 * @param {String} excloudUrl
 * @return {String}
 */
export const url = excloudUrl => {
  if (excloudUrl.startsWith('http')) {
    return excloudUrl
  }
  return APP_SERVICE.BASE_URL + excloudUrl
}


/**
 * 位置情報の履歴を取得する。
 * @method
 * @async
 * @param {Object[]} locations
 * @param {Object[]} exbs
 * @param {Object[]} txs
 * @param {Boolean} allShow
 * @param {Object[]} pMock
 * @return {Object[]}
 */
export const fetchPositionHistory = async (allShow, pMock) => {
  return pMock? pMock: DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_HISTORY_FETCH_URL.replace('{allFetch}', allShow? '1': '0')) + new Date().getTime())
}

/**
 * センサ情報を取得する。
 * @method
 * @async
 * @param {Number} sensorId
 * @return {Object[]}
 */
export const fetchSensor = async (sensorId) => {
  const sensorUrl = DEV.ONLY_FROM_DB? EXCLOUD.SENSOR_URL_NEW: EXCLOUD.SENSOR_URL // 大幅な変更があるため十分検証されるまでは、開発用のみで使う
  let data = DEV.USE_MOCK_EXC? mock.sensor[sensorId]:
    await HttpHelper.getExCloud(url(sensorUrl).replace('{id}', sensorId) + new Date().getTime())
  data = (sensorId == SENSOR.OMR_ENV ? data.sensors : data)
  data = _(data).map(val => { // deviceid, btx_idはすべて名前を変換する
    if (val.deviceid) {
      val.deviceId = val.deviceid
      delete val.deviceid
    }
    if (val.btx_id) {
      val.btxId = val.btx_id
      delete val.btx_id
    }      
    if (val.btxid) {
      val.btxId = val.btxid
      delete val.btxid
    }
    return val
  }).compact().value()
  if (sensorId == SENSOR.OMR_ENV) {
    data = data.map(sensor => {
      return {...sensor, sensorid: sensor.pos_id, btxId: sensor.sensor_id, updatetime: sensor.timestamp}
    })
  }
  return data
}

/**
 * モニタ用の位置情報を取得する。
 * @method
 * @async
 * @return {Object[]}
 */
export const fetchRawPosition = async () => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_URL) + new Date().getTime())
  return _(data)
    .map(val => {
      let nearest = _.map(val.nearest, near => { // deviceid, btx_idはすべて名前を変換する
        const deviceId = near.device_id
        delete near.device_id
        return {...near, deviceId}
      })

      const deviceId = val.device_id
      const btxId = val.btx_id
      delete val.btx_id
      delete val.device_id
      return {...val, deviceId, btxId, nearest}
    })
    .compact().value()
}

/**
 * モニタ用のゲートウェイ情報を取得する。
 * @method
 * @async
 * @return {Object[]}
 */
export const fetchGateway = async () => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.GATEWAY_URL) + new Date().getTime())
  return _(data)
    .map(val => {
      if (val.deviceid) { // deviceidはすべて名前を変換する
        val.deviceId = val.deviceid
        delete val.deviceid
      }
      if(EXSERVER.ENABLE){
        return {...val, updated: dateform(val.timestamp * 1000)}
      }else{
        return {...val, updated: dateform(val.timestamp)}
      }
    })
    .compact().value()
}

/**
 * モニタ用のテレメトリ情報を取得する。
 * @method
 * @async
 * @return {Object[]}
 */
export const fetchTelemetry = async () => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.TELEMETRY_URL) + new Date().getTime())
  return _(data)
    .map(val => {
      if (val.deviceid) { // deviceidはすべて名前を変換する
        val.deviceId = val.deviceid
        delete val.deviceid
      }
      let timestamp = EXSERVER.ENABLE ? val.timestamp * 1000 : val.timestamp
      return {...val, timestamp: timestamp, ibeacon_received: val.ibeacon_received}
    })
    .compact().value()
}

/**
 * LEDを操作するAPIをリクエストする。
 * @method
 * @async
 * @param {Object} param
 * @return {Object}
 */
export const postLed = async (param) => {
  let data = DEV.USE_MOCK_POS? mock.position:
    await HttpHelper.postExCloud(url(EXCLOUD.LED_URL) + new Date().getTime(), param)
  return data
}

/**
 * EXCloudから情報を取得するためにリクエストを行う。
 * @method
 * @async
 * @param {String} type
 * @param {String} yyyymmdd
 * @return {Object[]}
 */
export const fetchDlList = async (type, yyyymmdd) => {
  let data = await HttpHelper.getExCloud(url(EXCLOUD.DL_LIST_URL).replace('{type}', type).replace('{yyyymm}', yyyymmdd) + new Date().getTime())
  return _(data).map(val => ({date: val})).compact().value()
}
