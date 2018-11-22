import { APP, DISP, DEV } from '../constant/config'
import * as Util from '../util/Util'
import * as mock from '../../assets/mock/mock.js'
import styles from '../constant/config.scss'

/**
 * 過去の位置データの移動平均、RSSIによるフィルタリング、時間によるフィルタリングで位置を決定
 * 
 * @param {*} orgPositions 
 * @param {*} now 
 */
export const correctPosId = (orgPositions, now) => {
  Util.debug(now, orgPositions)
  let positions = _.chain(orgPositions).reduce((result, positions, idx) => { // MOVING_AVERAGE回の測位データを集約し、nearestをフラットにして１階層のオブジェエクト配列にする
    _.forEach(positions, (pos) => {
      _.forEach(pos.nearest, (val) => {
        result.push({btx_id:pos.btx_id, pos_id:val.place_id, label:pos.label, rssi:val.rssi, timestamp:val.timestamp})
      })
    })
    return result
  }, [])
  .uniqWith(_.isEqual) // 重複除去
  .map((val) => { if (DEV.DEBUG) console.log('受信日時: ' + new Date(val.timestamp), '現在日時: ' + new Date(now), (now - val.timestamp) / 1000 + '秒前', 'RSSI: ' + val.rssi); return val})
  .filter((val) => val.rssi >= APP.RSSI_MIN && val.timestamp >= now - APP.HIDE_TIME) // RSSI値、指定時刻でフィルタ
  .orderBy(['btx_id', 'pos_id', 'timestamp']) // btx_id, pos_id, timestampでソート
  .value()

  Util.table('単純ソート後', positions)

  positions = _.chain(positions).reduce((result, pos, idx) => { // btx_id,pos_idグループでsum(rssi), countを集計（lodashのgroupByは複数には対応していない）
    let prev = _.find(result, (val) => val.btx_id == pos.btx_id && val.pos_id == pos.pos_id)
    if (prev) {
      prev.rssiTotal += pos.rssi
      prev.count++
      prev.rssiAvg = prev.rssiTotal / prev.count
      prev.timestamp = pos.timestamp
    }
    else {
      result.push({...pos, count:1, rssiTotal:pos.rssi, rssiAvg:pos.rssi})
    }
    return result
  }, [])
  .map((val => ({...val, count: val.count>1? 2: 1}))) // count 2以上は2とみなす（1回のみとは区別）
  .orderBy(['count', 'rssiAvg', 'pos_id', 'btx_id'], ['desc','desc','asc','asc']) // 記録回数（多）、RSSI（強）、pos_id、btx_idでソート 
  .value()

  Util.table('グルーピング後', positions)

  // 上記の順番で取り出す
  let usedTx = []
  let usedPos = []  // １つの場所に１TXの場合
  positions = _.reduce(positions, (result, val) => { // 回数とRSSI値の強い順にpos_idとbtx_idのペアを決めていく
    if (!usedTx.includes(val.btx_id) && (!APP.TX_POS_ONE_TO_ONE || !usedPos.includes(val.pos_id))) {
      usedTx.push(val.btx_id)
      if (APP.TX_POS_ONE_TO_ONE) {
        usedPos.push(val.pos_id)
      }
      result.push({...val, rssi:val.rssiAvg, transparent: val.timestamp < now - APP.TRANSPARENT_TIME})
    }
    return result
  }, [])

  if (DEV.DEBUG > 1 && mock.insertPosition) {
    console.warn("insert mock position")
    positions = positions.concat(mock.insertPosition)
  }

  // EXB.forEach((exb) => { // EXBのpos_idが配列にない場合（＝空き状態）追加
  //   if (!usedPos.includes(exb.pos_id)) {
  //     positions.push({pos_id: exb.pos_id, btx_id: 0})
  //   }
  // })

  Util.table('各TX単位', positions)

  return positions
}

export const adjustPosition = (positions, ratio, exbs = []) => {
  const ret = []
  exbs.forEach((exb) => {
    let samePos = positions.filter((pos) => pos.pos_id == exb.location.posId)
    if (!samePos || samePos.length == 0) {
      return
    }
    let baseX = exb.location.x * ratio
    let baseY = exb.location.y * ratio
    switch (samePos.length) {
      case 1:
        ret.push({...samePos[0], x: baseX, y: baseY})
        break
      case 2:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_2, y: baseY})
        ret.push({...samePos[1], x: baseX + DISP.TX_R / DISP.TX_DIV_2, y: baseY})
        break
      case 3:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_3, y: baseY})
        ret.push({...samePos[1], x: baseX, y: baseY})
        ret.push({...samePos[2], x: baseX + DISP.TX_R / DISP.TX_DIV_3, y: baseY})
        break
      case 4:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_2, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[1], x: baseX + DISP.TX_R / DISP.TX_DIV_2, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[2], x: baseX - DISP.TX_R / DISP.TX_DIV_2, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[3], x: baseX + DISP.TX_R / DISP.TX_DIV_2, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        break
      default:
        ret.push({...samePos[0], x: baseX - DISP.TX_R / DISP.TX_DIV_3, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[1], x: baseX, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[2], x: baseX + DISP.TX_R / DISP.TX_DIV_3, y: baseY - DISP.TX_R / DISP.TX_DIV_2})
        ret.push({...samePos[3], x: baseX - DISP.TX_R / DISP.TX_DIV_3, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        if (samePos.length <= 6) {
          ret.push({...samePos[4], x: baseX, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        }
        if (samePos.length == 6) {
          ret.push({...samePos[5], x: baseX + DISP.TX_R / DISP.TX_DIV_3, y: baseY + DISP.TX_R / DISP.TX_DIV_2})
        }
        if (samePos.length > 6) { // 6超の場合、2段目を分割して重ねて表示
          for (let i=4; i < samePos.length; i++) {
            ret.push({...samePos[i], x: baseX - DISP.TX_R / DISP.TX_DIV_3 + DISP.TX_R * 5 / (samePos.length - 3) * (i - 3), y: baseY + DISP.TX_R / DISP.TX_DIV_2})
          }
        }
        break
      }
    })

    return ret
}

export const setDetectState = (positions) => {
  const now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start
  const undetect = now - APP.POSITION_UNDETECT_TIME // 検知後未検知となる時刻
  const boundary = Util.getMidnightMs() // 当日0:00

  _.forEach(positions, (position) => {
    let lastDetect
    const nearest = _.filter(position.nearest, (val) =>
      val.rssi >= DISP.RSSI_MIN // rssi最低値でフィルタ
    )
    if (!Util.hasValue(nearest)) {
      lastDetect = -1
    } else {
      lastDetect = _(nearest)
          .map((val) => val.timestamp)
          .sort().last()
    }

    if (lastDetect > undetect) {
      position.detectState = 1
    } else if (lastDetect > boundary) {
      position.detectState = 2
    } else if (!(lastDetect === -1)) {
      position.detectState = 3
      position.noSelectedTx = true
    } else {
      position.detectState = 4
      position.noSelectedTx = true
    }

    Util.debug("detect conditions...", now, undetect, boundary)
    Util.debug("nearest is ", nearest)
    Util.debug(lastDetect, position.detectState)
  })

}

