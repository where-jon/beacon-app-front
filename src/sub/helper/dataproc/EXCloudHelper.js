/**
 * EXCloudに関するヘルパーモジュール
 * @module helper/dataproc/EXCloudHelper
 */

import _ from 'lodash'
import moment from 'moment'
import * as mock from '../../../assets/mock/mock'
import { DEV, DISP, EXCLOUD, APP_SERVICE } from '../../constant/config'
import * as Util from '../../util/Util'
import * as HttpHelper from '../base/HttpHelper'

/**
 * 日付フォーマットを行う。
 * @method
 * @param {Number|Date} time 任意のエポック秒またはDateオブジェクト。エポック秒の場合はコンソール警告が出る。
 * @return {String}
 */
export const dateform = time => time? moment(time).format('YYYY/MM/DD HH:mm:ss'): ''

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
export const fetchPositionHistory = async (locations, exbs, txs, allShow, pMock) => {
  let data = pMock? pMock: DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_HISTORY_FETCH_URL.replace('{allFetch}', allShow? '1': '0')) + new Date().getTime())
  const txIdMap = {}
  txs.forEach(t => txIdMap[t.txId] = t)
  const exbIdMap = {}
  exbs.forEach(e => exbIdMap[e.exbId] = e)
  const locationIdMap = {}
  locations.forEach(l => locationIdMap[l.locationId] = l)
  console.log('data', data)

  return _(data).filter(val => allShow || DEV.NOT_FILTER_TX || txs && txIdMap[val.txId])
    .filter(val => allShow || Util.hasValue(val.locationId) && locationIdMap[val.locationId])
    .map(val => {
      let tx = txIdMap[val.txId]
      // FIXME: これはtxのlocationになっている。txの下に置かないと混同する。
      let location = Util.getValue(tx, 'location', null) && 0 < tx.location.x * tx.location.y? tx.location: locationIdMap[val.locationId]
      let exb = exbIdMap[val.exbId]
      let label = tx? tx.displayName? tx.displayName: tx.btxId: ''
      return { btx_id: tx? tx.btxId: '', minor: val.minor, device_id: exb? exb.deviceId : -1, tx_id: val.txId,
        x: val.x, y: val.y,
        label, location: location, exb, tx, updatetime: dateform(val.positionDt), timestamp:dateform(val.positionDt)}
    }).compact().value()
}

/**
 * 位置情報を取得する。
 * @method
 * @async
 * @param {Object[]} exbs
 * @param {Object[]} txs
 * @return {Object[]}
 */
export const fetchPositionList = async (exbs, txs) => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_URL) + new Date().getTime())
  return _(data)
    .map(val => {
      let tx = _.find(txs, tx => tx.btxId == val.btx_id)
      if (!DEV.NOT_FILTER_TX || !tx) { return null}
      let exb = _.find(exbs, exb => exb.deviceId == val.device_id)
      if (!exb) { return null}
      let label = tx && tx.displayName? tx.displayName: val.btx_id
      return {...val, tx: tx, exb: exb, label, updatetime: dateform(val.updatetime)}
    }).compact().value()
}

/**
 * センサ情報を取得する。
 * @method
 * @async
 * @param {Number} sensorId
 * @return {Object[]}
 */
export const fetchSensor = async (sensorId, doCompact=true) => {
  let data = DEV.USE_MOCK_EXC? mock.sensor[sensorId]:
    await HttpHelper.getExCloud(url(EXCLOUD.SENSOR_URL).replace('{id}', sensorId) + new Date().getTime())
  if(doCompact){
    return _(data).compact().value()
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
      let nearest = _.map(val.nearest, near => ({...near, timestamp: dateform(near.timestamp)}))
      return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received), nearest}
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
      if(DISP.POS.EXSERVER){
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
    // .filter((val) => EXB.some((exb) => exb.pos_id == val.pos_id))
    .map(val => {
      let timestamp = DISP.POS.EXSERVER ? val.timestamp * 1000 : val.timestamp
      return {...val, timestamp: dateform(timestamp), ibeacon_received: dateform(val.ibeacon_received)}
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
