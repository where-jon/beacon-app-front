import axios from 'axios'
import _ from 'lodash'
import { EXCLOUD, APP_SERVICE, DEV } from '../constant/config'
import * as mock from '../../assets/mock/mock'
import moment from 'moment'
import * as HttpHelper from './HttpHelper'

const dateform = (time) => moment(time).format('YYYY/MM/DD HH:mm:ss')

export const fetchPosition = async (exbs, txs, pMock) => {
    let data = pMock? pMock: DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(APP_SERVICE.BASE_URL + EXCLOUD.POSITION_URL + new Date().getTime())
    return _(data)
    .filter((val) => DEV.NOT_FILTER_TX || txs && txs.some((tx) => tx.btxId == val.btx_id))
    .filter((val) => exbs && exbs.some((exb) => exb.location.posId == val.pos_id))
    .map((val) => {
      let tx = _.find(txs, (tx) => tx.btxId == val.btx_id)
      let label = tx && tx.displayName? tx.displayName: val.btx_id
      return {btx_id: val.btx_id, pos_id: val.pos_id, label, nearest: val.nearest}
    })
    .compact().value()
}

export const fetchPositionList = async (exbs, txs) => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(APP_SERVICE.BASE_URL + EXCLOUD.POSITION_URL + new Date().getTime())
    return _(data)
    .map((val) => {
        let tx = _.find(txs, (tx) => tx.btxId == val.btx_id)
        let exb = _.find(exbs, (exb) => exb.location.posId == val.pos_id)
        return {...val, tx: tx, exb: exb, updatetime: dateform(val.updatetime)}
    }).compact().value()
}

export const fetchSensor = async (sensorId) => {
  let data = DEV.USE_MOCK_EXC? mock.sensor[sensorId]:
      await HttpHelper.getExCloud(APP_SERVICE.BASE_URL + EXCLOUD.SENSOR_URL.replace("{id}", sensorId) + new Date().getTime())
  return _(data)
  .compact().value()
}

export const fetchRawPosition = async () => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(APP_SERVICE.BASE_URL + EXCLOUD.POSITION_URL + new Date().getTime())
    return _(data)
    .map((val) => {
        let nearest = _.map(val.nearest, (near) => ({...near, timestamp: dateform(near.timestamp)}))
        return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received), nearest}
    })
    .compact().value()
}

export const fetchGateway = async () => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(APP_SERVICE.BASE_URL + EXCLOUD.GATEWAY_URL + new Date().getTime())
    return _(data)
    .map((val) => {
        return {...val, updated: dateform(val.updated)}
    })
    .compact().value()
}

export const fetchTelemetry = async () => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(APP_SERVICE.BASE_URL + EXCLOUD.TELEMETRY_URL + new Date().getTime())
    return _(data)
    // .filter((val) => EXB.some((exb) => exb.pos_id == val.pos_id))
    .map((val) => {
        return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received)}
    })
    .compact().value()
}

export const postLed = async (param) => {
    let data = DEV.USE_MOCK_POS? mock.position:
        await HttpHelper.postExCloud(APP_SERVICE.BASE_URL + EXCLOUD.LED_URL + new Date().getTime(), param)
    return data
}

