import * as mock from '../../assets/mock/mock'
import { APP, DISP, DEV } from '../constant/config'
import { TX_VIEW_TYPES, DETECT_STATE } from '../constant/Constants'
import * as DateUtil from '../util/DateUtil'
import * as Util from '../util/Util'
import * as DetectStateHelper from '../helper/DetectStateHelper'

const iconsUnitNum = 9
const tileLayoutIconsNum = 5
const PIdiv180 = Math.PI / 180
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

const hasTxLocation = (pos) => pos && pos.tx && pos.tx.location && pos.tx.location.x && pos.tx.location.y

const getCoordinateFix = (ratio, fixPositions) => {
  const ret = []
  fixPositions.forEach((fixPosition) => {
    ret.push(hasTxLocation(fixPosition)? {...fixPosition, x: fixPosition.tx.location.x, y: fixPosition.tx.location.y}: null)
  })
  return ret.filter((val) => val)
}

/**
 * デフォルトレイアウトのTXアイコン配置座標の配列を取得する
 * @param {*} exb EXBオブジェクト
 * @param {*} ratio ウインドウ縮小割合
 * @param {*} samePos 同じEXBの位置に配置するTXオブジェクトの配列
 */
const getCoordinateDefault = (exb, ratio, samePos) => {
  let baseX = exb.location.x
  let baseY = exb.location.y
  let txR = DISP.TX.R * ratio
  const ret = []
  switch (samePos.length) {
  case 1:
    ret.push({...samePos[0], x: baseX, y: baseY})
    break
  case 2:
    ret.push({...samePos[0], x: baseX - txR / DISP.TX.DIV_2, y: baseY})
    ret.push({...samePos[1], x: baseX + txR / DISP.TX.DIV_2, y: baseY})
    break
  case 3:
    ret.push({...samePos[0], x: baseX - txR / DISP.TX.DIV_3, y: baseY})
    ret.push({...samePos[1], x: baseX, y: baseY})
    ret.push({...samePos[2], x: baseX + txR / DISP.TX.DIV_3, y: baseY})
    break
  case 4:
    ret.push({...samePos[0], x: baseX - txR / DISP.TX.DIV_2, y: baseY - txR / DISP.TX.DIV_2})
    ret.push({...samePos[1], x: baseX + txR / DISP.TX.DIV_2, y: baseY - txR / DISP.TX.DIV_2})
    ret.push({...samePos[2], x: baseX - txR / DISP.TX.DIV_2, y: baseY + txR / DISP.TX.DIV_2})
    ret.push({...samePos[3], x: baseX + txR / DISP.TX.DIV_2, y: baseY + txR / DISP.TX.DIV_2})
    break
  default:
    ret.push({...samePos[0], x: baseX - txR / DISP.TX.DIV_3, y: baseY - txR / DISP.TX.DIV_2})
    ret.push({...samePos[1], x: baseX, y: baseY - txR / DISP.TX.DIV_2})
    ret.push({...samePos[2], x: baseX + txR / DISP.TX.DIV_3, y: baseY - txR / DISP.TX.DIV_2})
    ret.push({...samePos[3], x: baseX - txR / DISP.TX.DIV_3, y: baseY + txR / DISP.TX.DIV_2})
    if (samePos.length <= 6) {
      ret.push({...samePos[4], x: baseX, y: baseY + txR / DISP.TX.DIV_2})
    }
    if (samePos.length == 6) {
      ret.push({...samePos[5], x: baseX + txR / DISP.TX.DIV_3, y: baseY + txR / DISP.TX.DIV_2})
    }
    if (samePos.length > 6) { // 6超の場合、2段目を分割して重ねて表示
      for (let i=4; i < samePos.length; i++) {
        ret.push({...samePos[i], x: baseX - txR / DISP.TX.DIV_3 + txR * 5 / (samePos.length - 3) * (i - 3), y: baseY + txR / DISP.TX.DIV_2})
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
const getCoordinateTile = (ratio, orgX, orgY, positions, viewType) => {
  return partitioningArray(positions, viewType.horizon).flatMap((array, i, a) => {
    return array.map((b, j, c) => {
      return {...b, x: orgX + DISP.TX.R * 2 * ratio * j, y: orgY + DISP.TX.R * 2 * ratio * i }
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
const getCoordinateSquare = (ratio, index, x, y, isDiamond = false) => {
  const i = index % iconsUnitNum
  if (i < 1) {
    return {x: x, y: y}
  }
  const r = isDiamond ? getRadiusDiamond(index, DISP.TX.R * 2) : getRadiusSquare(index, DISP.TX.R * 2)
  const radian = angle * i * PIdiv180
  return {x: x + r * ratio * Math.cos(radian), y: y + r * ratio * Math.sin(radian)}
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
const getCoordinate = (ratio, orgX, orgY, positions, viewType) => {
  if (viewType.displayFormat === TX_VIEW_TYPES.TILE) {
    return getCoordinateTile(ratio, orgX, orgY, positions, viewType)
  }
  return positions.length > 1 ? positions.map((e, i, a) => {
    const xy = (() => {
      switch (viewType.displayFormat) {
      case TX_VIEW_TYPES.SQUARE :
        return getCoordinateSquare(ratio, i, orgX, orgY)
      case TX_VIEW_TYPES.DIAMOND :
        return getCoordinateSquare(ratio, i, orgX, orgY, true)
      case TX_VIEW_TYPES.SPIRAL :
        return getCoordinateSpiral(i, orgX, orgY, 360 / positions.length * i, DISP.TX.R * 2 * ratio)
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
  let baseX = exb.location.x
  let baseY = exb.location.y
  const c = partitioningArray(samePos, viewType.displayFormat !== TX_VIEW_TYPES.TILE ? iconsUnitNum : maxIcons)
  return c.flatMap((e, i, a) => {
    const coordinate = getCoordinate(ratio, baseX, baseY, e, viewType)
    baseX += DISP.TX.R
    baseY += DISP.TX.R
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
export const correctPosId = (orgPositions, now, showAllTime = false) => {
  Util.debug(now, orgPositions)
  let positions = correctNearestPositions(orgPositions, now, showAllTime)

  Util.table('足切り＆単純ソート後', positions)
  positions = correctSumCount(positions)

  Util.table('btxId&posIdグルーピング後', positions)

  // 上記の順番で取り出す
  positions = correctPair(positions, now)

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
  orgPositions.forEach((orgPositionList) => {
    orgPositionList.forEach((orgPosition) => {
      _.forEach(orgPosition, (orgValue, orgKey) => {
        positions.forEach((position) => {
          if(orgPosition.btx_id == position.btx_id && position[orgKey] == null){
            position[orgKey] = orgValue
          }
        })
      })
    })
  })
  return positions
}

export const correctNearestPositions = (orgPositions, now, showAllTime = false) => {
  return _.chain(orgPositions).reduce((result, positions, idx) => { // MOVING_AVERAGE回の測位データを集約し、nearestをフラットにして１階層のオブジェエクト配列にする
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
        const method = now - val.timestamp > APP.POS.LOST_TIME || val.rssi < APP.POS.RSSI_MIN? 'warn': 'log'
        console[method]('btxId', val.btx_id, DateUtil.formatDate(val.timestamp), (now - val.timestamp) / 1000 + '秒前', 'RSSI: ' + Math.round(val.rssi * 100)/ 100)
      }
      return true
    })
    .filter((val) => val.rssi >= APP.POS.RSSI_MIN && (showAllTime || val.timestamp >= now - APP.POS.LOST_TIME)) // RSSI値、指定時刻でフィルタ
    .orderBy(['btx_id', 'pos_id', 'timestamp']) // btx_id, pos_id, timestampでソート
    .value()
}

export const correctSumCount = (orgPositions) => {
  return _.chain(orgPositions).reduce((result, pos) => { // btx_id,pos_idグループでsum(rssi), countを集計（lodashのgroupByは複数には対応していない）
    const prev = _.find(result, (val) => val.btx_id == pos.btx_id && val.pos_id == pos.pos_id)
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
}

export const correctPair = (orgPositions, now) => {
  const usedTx = []
  const usedPos = []  // １つの場所に１TXの場合
  return _.reduce(orgPositions, (result, val) => { // 回数とRSSI値の強い順にpos_idとbtx_idのペアを決めていく
    if (!usedTx.includes(val.btx_id) && (!APP.POS.TX_POS_ONE_TO_ONE || !usedPos.includes(val.pos_id))) {
      usedTx.push(val.btx_id)
      if (APP.POS.TX_POS_ONE_TO_ONE) {
        usedPos.push(val.pos_id)
      }
      result.push({...val, rssi:val.rssiAvg, transparent: isTransparent(val.timestamp, now), isLost: isLost(val.timestamp, now)})
    }
    return result
  }, [])
}

export const adjustPosition = (positions, ratio, exbs = [], selectedMapId = null) => {
  return exbs.map((exb) => {

    const samePos = []
    const fixPos = []

    positions.forEach((pos) => {
      const isFixPosition = hasTxLocation(pos) && selectedMapId && pos.tx.location.areaId == selectedMapId
      if (!isFixPosition) {
        if (pos.pos_id == exb.location.posId && pos.timestamp
          &&(new Date(pos.timestamp) > new Date().getTime() - APP.POS.LOST_TIME)) {
          samePos.push(pos)
        }
      } else {
        fixPos.push(pos)
      }
    })

    const same = (!samePos || samePos.length == 0) ? [] : getPositionsToOverlap(exb, ratio, samePos)
    const fix = (!fixPos || fixPos.length == 0) ? [] : getCoordinateFix(ratio, fixPos)

    return [...same, ...fix]
  }).filter(e => e).flatMap(e => e).filter(function (x, i, self) {
    return (self.findIndex(function(val) {
      return (x.btx_id === val.btx_id)
    }) === i)
  })
}

export const adjustMultiPosition = (positions, ratio) => {
  const ret = []
  positions.map((pos) => {
    ret.push( {...pos, x: pos.x * ratio, y: pos.y * ratio} )
  })
  return ret
}

export const setDetectState = (positions, usePositionHistory = false) => {

  _.forEach(positions, (position) => {
    let updatetime = null
    if (Util.hasValue(position.nearest)) {
      updatetime = _(position.nearest)
        .map((val) => val.timestamp)
        .sort().last()
    }else if(usePositionHistory){
      updatetime = position.timestamp
    }

    position.detectState = DetectStateHelper.getState('tx', updatetime) // nearestのtimestampを使用
    position.state = DetectStateHelper.getLabel(position.detectState)
    position.noSelectedTx = (position.detectState != DETECT_STATE.DETECTED)
  })

}

export const isTransparent = (timestamp, now) => {
  const date = new Date(timestamp)
  return date.getTime() < now - APP.POS.TRANSPARENT_TIME
}

export const isLost = (timestamp, now) => {
  const date = new Date(timestamp)
  return date.getTime() < now - APP.POS.LOST_TIME
}

export const hasZoneDisplay = () => {
  return false
}
