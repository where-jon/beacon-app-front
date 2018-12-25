import { APP, DISP, DEV } from '../constant/config'
import { TX_VIEW_TYPES, DETECT_STATE } from '../constant/Constants'
import * as DetectStateHelper from '../helper/DetectStateHelper'
import * as Util from '../util/Util'
import * as mock from '../../assets/mock/mock.js'

const iconsUnitNum = 9
const tileLayoutIconsNum = 5
const PIdiv180 = Math.PI / 180
const diameter = DISP.TX_R * 2
const angle = 45

/**
 * 配列をnumで指定された要素数で区切る
 * @param {*} array パーティショニング元配列
 * @param {*} num 1つのパーティションの要素数
 */
const partitioningArray = (array, num) => {
  const len = array.length
  const c = []
  for (let i = 0 ; i < len ; i += num) {
    c.push(array.slice(i, (i+num)))
  }
  return c
}

// 長方形配置時の、原点からの距離(半径)を取得する
const getRadiusSquare = (index, radius) => index % 2 === 0 ? radius : Math.sqrt(Math.pow(radius, 2) * 2)
// ひし形配置時の、原点からの距離(半径)を取得する
const getRadiusDiamond = (index, radius) => (index % 2 !== 0 && index % 6 !== 0) ? radius : radius * 1.5

/**
 * デフォルトレイアウトのTXアイコン配置座標の配列を取得する
 * @param {*} exb EXBオブジェクト
 * @param {*} ratio ウインドウ縮小割合
 * @param {*} samePos 同じEXBの位置に配置するTXオブジェクトの配列
 */
const getCoordinateDefault = (exb, ratio, samePos) => {
  let baseX = exb.location.x * ratio
  let baseY = exb.location.y * ratio
  const ret = []
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
  return ret
}

/**
 * TXアイコンタイル形配置時、個々のTXアイコン配置座標を取得する
 * @param {*} orgX アイコン配置開始X座標値
 * @param {*} orgY アイコン配置開始Y座標値
 * @param {*} positions EXBの配置座標配列
 */
const getCoordinateTile = (orgX, orgY, positions, viewType) => {
  return partitioningArray(positions, viewType.horizon).flatMap((array, i, a) => {
    return array.map((b, j, c) => {
      return {...b, x: orgX + diameter * j, y: orgY + diameter * i }
    })
  })
}

/**
 * TXアイコン長方形配置時、個々のTXアイコン配置座標を取得する
 * @param {*} index インデックス
 * @param {*} x EXB X座標値
 * @param {*} y EXB Y座標値
 * @param {*} isDiamond trueの場合、ひし形に配置
 */
const getCoordinateSquare = (index, x, y, isDiamond = false) => {
  const i = index % iconsUnitNum
  if (i < 1) {
    return {x: x, y: y}
  }
  const r = isDiamond ? getRadiusDiamond(index, diameter) : getRadiusSquare(index, diameter)
  const radian = angle * i * PIdiv180
  return {x: x + r * Math.cos(radian), y: y + r * Math.sin(radian)}
}

/**
 * TXアイコンをスパイラル状に配置時、個々のTXアイコン配置座標を取得する
 * @param {*} index インデックス
 * @param {*} x  EXB X座標値
 * @param {*} y  EXB Y座標値
 * @param {*} theta 原点からのアイコン配置角
 * @param {*} radius 原点からのアイコン配置距離(半径)
 */
const getCoordinateSpiral = (index, x, y, theta, radius) => {
  const radian = theta * PIdiv180
  return {
    x: index > 0 ? x + radius * Math.cos(radian) : x,
    y: index > 0 ? y + radius * Math.sin(radian) : y
  }
}

/**
 * TXアイコンを配置する座標を取得
 * @param {*} orgX アイコン配置開始X座標値
 * @param {*} orgY アイコン配置開始Y座標値
 * @param {*} positions EXBの配置座標配列
 * @param {*} viewType アイコン配置タイプ
 */
const getCoordinate = (orgX, orgY, positions, viewType) => {
  if (viewType.displayFormat === TX_VIEW_TYPES.TILE) {
    return getCoordinateTile(orgX, orgY, positions, viewType)
  }
  return positions.length > 1 ? positions.map((e, i, a) => {
    const xy = (() => {
      switch (viewType.displayFormat) {
      case TX_VIEW_TYPES.SQUARE :
        return getCoordinateSquare(i, orgX, orgY)
      case TX_VIEW_TYPES.DIAMOND :
        return getCoordinateSquare(i, orgX, orgY, true)
      case TX_VIEW_TYPES.SPIRAL :
        return getCoordinateSpiral(i, orgX, orgY, 360 / positions.length * i, diameter)
      default :
        return {x: orgX, y: orgY}
      }
    })()
    return {...e, x: xy.x, y: xy.y}
  }) : {...positions[0], x: orgX, y: orgY}
}

/**
 * 複数TXアイコンが同じEXBの位置に重複する場合の
 * 配置座標を取得する
 * @param {*} exb EXBオブジェクト 
 * @param {*} ratio ブラウザウインドウ縮小割合
 * @param {*} samePos TXアイコン座標配列
 */
const getPositionsToOverlap = (exb, ratio, samePos) => {
  const viewType = getTxViewType(exb.location.txViewType)
  if (viewType.displayFormat === TX_VIEW_TYPES.DEFAULT ||
    !Object.keys(TX_VIEW_TYPES).find(key => viewType.displayFormat === TX_VIEW_TYPES[key])) {
    return getCoordinateDefault(exb, ratio, samePos)
  }
  const maxIcons = viewType.horizon * viewType.vertical
  let baseX = exb.location.x * ratio
  let baseY = exb.location.y * ratio
  const c = partitioningArray(samePos, viewType.displayFormat !== TX_VIEW_TYPES.TILE ? iconsUnitNum : maxIcons)
  return c.flatMap((e, i, a) => {
    const coordinate = getCoordinate(baseX, baseY, e, viewType)
    baseX += DISP.TX_R
    baseY += DISP.TX_R
    return coordinate
  })
}

const getTxViewType = (txViewType) => {
  return txViewType !== null ?
    {
      displayFormat: txViewType.displayFormat ? txViewType.displayFormat : TX_VIEW_TYPES.DEFAULT,
      horizon: txViewType.horizon ? txViewType.horizon : tileLayoutIconsNum,
      vertical: txViewType.vertical ? txViewType.vertical : tileLayoutIconsNum,
      a: txViewType.displayFormat
    } :
    {
      displayFormat: TX_VIEW_TYPES.DEFAULT,
      horizon: tileLayoutIconsNum,
      vertical: tileLayoutIconsNum,
    }
}

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
    .filter((val) => {
      if (DEV.DEBUG) {
        let method = now - val.timestamp > APP.LOST_TIME || val.rssi < APP.RSSI_MIN? 'warn': 'log'
        console[method]('btxId', val.btx_id, Util.formatDate(val.timestamp), (now - val.timestamp) / 1000 + '秒前', 'RSSI: ' + Math.round(val.rssi * 100)/ 100)
      }
      return true
    })
    .filter((val) => val.rssi >= APP.RSSI_MIN && val.timestamp >= now - APP.LOST_TIME) // RSSI値、指定時刻でフィルタ
    .orderBy(['btx_id', 'pos_id', 'timestamp']) // btx_id, pos_id, timestampでソート
    .value()

  Util.table('足切り＆単純ソート後', positions)

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

  Util.table('btxId&posIdグルーピング後', positions)

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
    console.warn('insert mock position')
    positions = positions.concat(mock.insertPosition)
  }

  // EXB.forEach((exb) => { // EXBのpos_idが配列にない場合（＝空き状態）追加
  //   if (!usedPos.includes(exb.pos_id)) {
  //     positions.push({pos_id: exb.pos_id, btx_id: 0})
  //   }
  // })

  Util.table('各TX単位(最終)', positions)

  return positions
}

export const adjustPosition = (positions, ratio, exbs = []) => {
  return exbs.map((exb) => {
    const samePos = positions.filter((pos) => pos.pos_id == exb.location.posId)
    return (!samePos || samePos.length == 0) ? null : getPositionsToOverlap(exb, ratio, samePos)
  }).filter(e => e).flatMap(e => e)
}

export const setDetectState = (positions) => {

  _.forEach(positions, (position) => {
    let updatetime = null
    if (Util.hasValue(position.nearest)) {
      updatetime = _(position.nearest)
        .map((val) => val.timestamp)
        .sort().last()
    }

    position.detectState = DetectStateHelper.getState('tx', updatetime) // nearestのtimestampを使用
    position.state = DetectStateHelper.getLabel(position.detectState)
    position.noSelectedTx = position.detectState != DETECT_STATE.DETECTED
  })

}

