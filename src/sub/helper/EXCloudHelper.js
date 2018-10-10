import axios from 'axios'
import _ from 'lodash'
import { EXCLOUD, DISP, DEV } from '../constant/config'
import * as mock from '../../assets/mock/mock'
import moment from 'moment'
import * as HttpHelper from './HttpHelper'

const dateform = (time) => moment(time).format('YYYY/MM/DD hh:mm:ss')

export const fetchPosition = async (exbs, txs, pMock) => {
    let data = pMock? pMock: DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(EXCLOUD.POSITION_URL + new Date().getTime())
    return _(data)
    // .filter((val) => txs.some((tx) => tx.btxId == val.btx_id))
    .filter((val) => exbs.some((exb) => exb.location.posId == val.pos_id))
    .map((val) => {
      let tx = _.find(txs, (tx) => tx.btxId == val.btx_id)
      let label = tx && tx.displayName? tx.displayName: val.btx_id
      return {id: val.btx_id, pos_id: val.pos_id, label}
    })
    .compact().value()
}

export const fetchSensor = async (sensorId) => {
  let data = DEV.USE_MOCK_EXC? mock.position:
      await HttpHelper.getExCloud(EXCLOUD.SENSOR_URL.replace("{id}", sensorId) + new Date().getTime())
  return _(data)
  .compact().value()
}

export const fetchRawPosition = async () => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(EXCLOUD.POSITION_URL + new Date().getTime())
    return _(data)
    .map((val) => {
        let nearest = _.map(val.nearest, (near) => ({...near, timestamp: dateform(near.timestamp)}))
        return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received), nearest}
    })
    .compact().value()
}

export const fetchGateway = async () => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(EXCLOUD.GATEWAY_URL + new Date().getTime())
    return _(data)
    .map((val) => {
        return {...val, updated: dateform(val.updated)}
    })
    .compact().value()
}

export const fetchTelemetry = async () => {
    let data = DEV.USE_MOCK_EXC? mock.position:
        await HttpHelper.getExCloud(EXCLOUD.TELEMETRY_URL + new Date().getTime())
    return _(data)
    // .filter((val) => EXB.some((exb) => exb.pos_id == val.pos_id))
    .map((val) => {
        return {...val, timestamp: dateform(val.timestamp), ibeacon_received: dateform(val.ibeacon_received)}
    })
    .compact().value()
}

