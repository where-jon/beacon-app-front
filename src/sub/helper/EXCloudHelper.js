import _ from 'lodash'
import { EXCLOUD, APP_SERVICE, DEV } from '../constant/config'
import * as mock from '../../assets/mock/mock'
import moment from 'moment'
import * as HttpHelper from './HttpHelper'

export const dateform = (time) => time? moment(time).format('YYYY/MM/DD HH:mm:ss'): ''

export const getDispTime = (pos) => pos.updatetime? pos.updatetime: pos.timestamp

export const url = (excloudUrl) => {
  if (excloudUrl.startsWith('http')) {
    return excloudUrl
  }
  return APP_SERVICE.BASE_URL + excloudUrl
}

export const fetchPosition = async (exbs, txs, pMock) => {
  let data = pMock? pMock: DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_URL) + new Date().getTime())
  return _(data)
    .filter((val) => DEV.NOT_FILTER_TX || txs && txs.some((tx) => tx.btxId == val.btx_id))
    .filter((val) => exbs && exbs.some((exb) => exb.location.posId == val.pos_id))
    .map((val) => {
      let tx = _.find(txs, (tx) => tx.btxId == val.btx_id)
      let exb = _.find(exbs, (exb) => exb.location.posId == val.pos_id)
      let label = tx && tx.displayName? tx.displayName: val.btx_id
      return {btx_id: val.btx_id, minor: val.minor, power_level: val.power_level, 
        pos_id: val.pos_id, label, exb, tx, nearest: val.nearest, updatetime: dateform(val.updatetime)}
    })
    .compact().value()
}

export const fetchPositionHistory = async (exbs, txs, allShow, pMock) => {
  let data = pMock? pMock: DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_HISTORY_FETCH_URL.replace('{allFetch}', allShow? '1': '0')) + new Date().getTime())
  return _(data)
    .filter((val) => DEV.NOT_FILTER_TX || txs && txs.some((tx) => tx.txId == val.txId))
    .filter((val) => exbs && exbs.some((exb) => exb.location.locationId == val.locationId))
    .map((val) => {
      let tx = _.find(txs, (tx) => tx.txId == val.txId)
      let exb = _.find(exbs, (exb) => exb.exbId == val.exbId)
      let label = tx? tx.displayName? tx.displayName: tx.btxId: ''
      return { btx_id: tx? tx.btxId: '',  minor: val.minor, pos_id: exb.posId, tx_id: val.txId,
        label, exb, tx, updatetime: dateform(val.positionDt), timestamp:dateform(val.positionDt)}
    })
    .compact().value()
}

export const fetchPositionList = async (exbs, txs) => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_URL) + new Date().getTime())
  return _(data)
    .map((val) => {
      let tx = _.find(txs, (tx) => tx.btxId == val.btx_id)
      if (!DEV.NOT_FILTER_TX || !tx) { return null}
      let exb = _.find(exbs, (exb) => exb.location.posId == val.pos_id)
      if (!exb || !exb.enabled) { return null}
      let label = tx && tx.displayName? tx.displayName: val.btx_id
      return {...val, tx: tx, exb: exb, label, updatetime: dateform(val.updatetime)}
    }).compact().value()
}

export const fetchSensor = async (sensorId) => {
  let data = DEV.USE_MOCK_EXC? mock.sensor[sensorId]:
    await HttpHelper.getExCloud(url(EXCLOUD.SENSOR_URL).replace('{id}', sensorId) + new Date().getTime())
  return _(data)
    .compact().value()
}

export const fetchRawPosition = async () => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.POSITION_URL) + new Date().getTime())
  return _(data)
    .map((val) => {
      let nearest = _.map(val.nearest, (near) => ({...near, timestamp: dateform(near.timestamp)}))
      return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received), nearest}
    })
    .compact().value()
}

export const fetchGateway = async () => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.GATEWAY_URL) + new Date().getTime())
  return _(data)
    .map((val) => {
      return {...val, updated: dateform(val.timestamp)}
    })
    .compact().value()
}

export const fetchTelemetry = async () => {
  let data = DEV.USE_MOCK_EXC? mock.position:
    await HttpHelper.getExCloud(url(EXCLOUD.TELEMETRY_URL) + new Date().getTime())
  return _(data)
    // .filter((val) => EXB.some((exb) => exb.pos_id == val.pos_id))
    .map((val) => {
      return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received)}
    })
    .compact().value()
}

export const postLed = async (param) => {
  let data = DEV.USE_MOCK_POS? mock.position:
    await HttpHelper.postExCloud(url(EXCLOUD.LED_URL) + new Date().getTime(), param)
  return data
}

export const fetchDlList = async (type, yyyymmdd) => {
  let data = await HttpHelper.getExCloud(url(EXCLOUD.DL_LIST_URL).replace('{type}', type).replace('{yyyymm}', yyyymmdd) + new Date().getTime())
  return _(data).map((val) => ({date: val})).compact().value()
}
