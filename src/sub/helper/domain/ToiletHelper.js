/**
 * トイレに関するヘルパーモジュール
 * @module helper/domain/ToiletHelper
 */

import _ from 'lodash'
import { SENSOR, LOCATION, SYSTEM_ZONE_CATEGORY_NAME } from '../../constant/Constants'
import * as Util from '../../util/Util'
import * as EXCloudHelper from '../../helper/dataproc/EXCloudHelper'

let store
let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pStore
 * @param {Object} pI18n
 */
export const setApp = (pStore, pI18n) => {
  store = pStore
  i18n = pI18n
}

/**
 * 各トイレごとのカウントを計算する
 * 
 * @param {*} toiletList 
 * @param {*} type 
 */
const createToiletCountInfo = (toiletList, type) => { // リストから、toiletTypeが所定のタイプのものの合計と、その中でisDetectの数の合計を求める。
  const emptyCount = toiletList.filter(e => e.toiletType == type && !e.isDetect).length
  const allCount = toiletList.filter(e => e.toiletType == type).length
  const count = allCount > 0? emptyCount + ' / ' + allCount: '-'
  const iconClass = allCount == 0? '': emptyCount == 0? 'occupy': 'empty'
  const iconLabel = allCount == 0? '': 'label.' + iconClass
  return {
    iconClass,
    iconLabel,
    count,
    allCount,
  }
}

/**
 * pirとmagnetのリストをマージして、areaId-zoneIdでグルーピング
 * 
 * @param {*} pirDataList 
 * @param {*} magnetDataList 
 */
const mergeToiletData = (pirDataList, magnetDataList) => {
  const group = _.groupBy(pirDataList.concat(magnetDataList), value => {
    return value.areaId + '-' + value.zoneId
  })
  const dataList = Object.keys(group).map(key => {
    const val = group[key]
    const first = val[0]
    return {
      areaId: first.areaId,
      areaName: first.areaName, // エリア名、ゾーン名はグループ内すべて同じなので最初の値を用いる
      zoneName: first.zoneName,
      male: createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MALE),
      female: createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.FEMALE),
      multip: createToiletCountInfo(val, LOCATION.EXT_VALUE.TOILET.MULTIP),
    }
  })
  return _(dataList).sortBy(e => e.areaCd + '-' + e.zoneCd).value()
}

/**
 * センサーデータを取得し、トイレ表示用リストに変換する
 * 
 * @param {*} sensorId 
 * @param {*} deviceKind 
 */
const fetchSensorData = async (sensorId, deviceKind) => {
  const config = deviceKind == 'exb'? { // センサーがexbかtxに紐付いたものかで値の処理の仕方を変える
    pKey: 'exbId', idMap: store.state.app_service.deviceIdMap, excloudIdKey: 'deviceId', valKey: 'count' 
  }: {
    pKey: 'txId', idMap: store.state.app_service.btxIdMap, excloudIdKey: 'btxId', valKey: 'magnet'
  }

  const exCloudSensors = await EXCloudHelper.fetchSensor(sensorId) // センサー情報を取得
  return exCloudSensors.map(sensor => {
    const device = config.idMap[sensor[config.excloudIdKey]] // txかexbを取得
    const toiletZone = device && device.location && device.location.getZone(SYSTEM_ZONE_CATEGORY_NAME.TOILET) // そのセンサーが置かれた場所に設定されたトイレのゾーンを取得（なければnull）
    const toiletType = Util.getValue(device, 'location.extValue.toilet') // トイレのタイプを取得（男/女/共用/多目的）
    // console.warn({sensor, device, toiletZone, toiletType})
    return toiletZone? {
      [config.pKey]: device[config.pKey], // exbId or txId
      isDetect: sensor[config.valKey] > 0, // 利用中か空きか(pirならcount、magnetならmagnet値を使用)
      areaId: Util.v(device, 'location.areaId'), areaCd: Util.v(device, 'location.area.areaCd'), areaName: Util.v(device, 'location.area.areaName'),
      zoneId: toiletZone.zoneId, zoneCd: toiletZone.zoneCd, zoneName: toiletZone.zoneName,
      toiletType,
    }: null
  }).filter(val => val && val.toiletType // トイレのゾーンに属するものとタイプが設定されているもののみ
  )
}

/**
 * トイレ表示用データを取得する。
 */
export const fetchData = async (areaId) => {
  const pirDataList = await fetchSensorData(SENSOR.PIR, 'exb') // PIRのセンサー情報を取得
  const magnetDataList = await fetchSensorData(SENSOR.MAGNET, 'tx') // magnetセンサー情報を取得
  let dataList = mergeToiletData(pirDataList, magnetDataList) // マージしてゾーン、そしてトイレタイプごとにカウントする。　
  // console.log(pirDataList, magnetDataList, dataList)
  if (areaId) {
    dataList = dataList.filter(e => e.areaId == areaId)
  }
  return dataList
}
