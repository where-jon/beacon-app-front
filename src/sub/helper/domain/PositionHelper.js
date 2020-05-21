/**
 * 位置情報に関するヘルパーモジュール
 * @module helper/domain/PositionHelper
 */

import * as mock from '../../../assets/mock/mock'
import { APP, DEV, DISP } from '../../constant/config'
import { DETECT_STATE, PRESENCE, TX, TX_VIEW_TYPES } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as DateUtil from '../../util/DateUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as Util from '../../util/Util'
import * as EXCloudHelper from '../dataproc/EXCloudHelper'
import * as MenuHelper from '../dataproc/MenuHelper'
import * as StateHelper from '../dataproc/StateHelper'
import * as StyleHelper from '../ui/StyleHelper'
import * as DetectStateHelper from './DetectStateHelper'
import * as SensorHelper from './SensorHelper'

const iconsUnitNum = 9
const tileLayoutIconsNum = 5
const PIdiv180 = Math.PI / 180
const angle = 45

// ゾーンエリアに表示するTXIDに付加する数値
export const zoneBtxIdAddNumber = 10000

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

// ----------　基本的な位置情報取得 ------------


/**
 * 位置情報を取得し、vueステートに保管する。
 * @method
 * @async
 * @param {Number} count mock用
 * @param {Boolean} [allShow = false] 検知されないデバイスの情報も取得する。
 * @param {Boolean} [fixSize = false] 固定サイズ用の幅と高さをcssに適用する。
 * @param {Boolean} [showMRoom = false] 会議室状況を表示する。
 * @return {Object[]}
 */
export const loadPosition = async (count, allShow = false, fixSize = false, showMRoom = false) => { // position-display, pir, position-list, position, sensor-list
  const pMock = DEV.USE_MOCK_EXC? mock.positions[count]: null
  let positions = await EXCloudHelper.fetchPositionHistory(allShow, pMock)
  Util.debug('fetchPositionHistory', positions)
  const now = !DEV.USE_MOCK_EXC ? new Date().getTime(): mock.positions_conf.start + count++ * mock.positions_conf.interval

  const txIdMap = StateHelper.getMaster().txIdMap
  const exbIdMap = StateHelper.getMaster().exbIdMap
  const locationIdMap = StateHelper.getMaster().locationIdMap
  const mRoomPlans = showMRoom ? store.state.main.mRoomPlans : null

  positions = _(positions).filter(pos => shoudTxShow(pos, allShow, txIdMap, locationIdMap))
    .map(pos => {
      // if (pos.minor == 603) { // 開発目的：矯正ポジション設定
      //   console.log(pos)
      //   pos.locationId = 2
      //   pos.exbId = 2
      // }
      let tx = txIdMap[pos.txId]
      // 固定位置の場合,txのlocation、そうではない場合exbのlocation TODO:要検討
      let location = tx.location && 0 < tx.location.x * tx.location.y? tx.location: locationIdMap[pos.locationId]
      let exb = exbIdMap[pos.exbId]
      let label = Util.firstValue(Util.v(tx, 'pot.displayName', tx.minor), tx.btxId)

      // 検知状態の設定
      setDetectState(pos)

      // スタイルをセット
      let display = Util.getValue(tx.pot, DISP.TX.DISPLAY_PRIORITY + '.display', StyleHelper.defaultDisplay)
      display = StyleHelper.getStyleDisplay1({...display, label}, {fixSize})
  
      return { ...pos, btxId: tx.btxId, deviceId: Util.v(exb, 'deviceId'), posx: pos.x, posy: pos.y,
        label, location, exb, tx, updatetime: DateUtil.dateform(pos.positionDt), timestamp: DateUtil.dateform(pos.positionDt), // TODO: updatetimeかtimestampかどちらかに統一
        isTransparent: isTransparent(pos.positionDt, now),
        isLost: isLost(pos.positionDt, now),
        display
      }
    }).compact().value()

  if (showMRoom) {
    const locationIds = mRoomPlans.reduce((arr, e) => {
      arr = arr.concat(e.locationIds)
      return arr
    }, [])
    positions = positions.filter(pos => {
      const locationId = Util.v(pos, 'location.locationId')
      return locationId && locationIds.includes(locationId)
    })
  }

  StateHelper.setPositions(positions)
  return positions
}



// ----------　フィルタリング ------------

/**
 * TXを位置表示（地図）画面に表示するか
 * 
 * @param {*} pos 
 * @param {*} allShow 
 * @param {*} txIdMap 
 * @param {*} locationIdMap 
 */
export const shoudTxShow = (pos, allShow, txIdMap, locationIdMap) => {
  if (allShow) return true

  return txIdMap[pos.txId]
    && pos.locationId
    && locationIdMap[pos.locationId]
    && NumberUtil.bitON(txIdMap[pos.txId].disp, TX.DISP.POS)
}


/**
 * 位置情報を絞り込んで返す。
 * @method
 * @param {Boolean} [showAllTime = false] 検知されていないデバイスの情報も取得する
 * @param {Number} [showTxNoOwner]
 * @param {Number} [selectedCategoryId]
 * @param {Number} [selectedGroupId]
 * @param {Number} [selectedTxIdList]
 * @param {Number} [selectedFreWord]
 * @return {Object[]}
 */
export const filterPositions = (positions = StateHelper.getPositions(),
  showAllTime = false, 
  showTxNoOwner = APP.POS.SHOW_TX_NO_OWNER,
  selectedCategoryId = store.state.main.selectedCategoryId,
  selectedGroupId = store.state.main.selectedGroupId,
  selectedTxIdList = store.state.main.selectedTxIdList,
  selectedFreeWord = store.state.main.selectedFreeWord) => { // p, position-display, rssimap, position-list, position, ProhibitHelper
  const txIdMap = StateHelper.getMaster().txIdMap

  if (!showTxNoOwner) { // potの所有状態で絞込み(TX未登録やPotと紐付いていない場合は表示しない)
    positions = positions.filter(pos => {
      const tx = txIdMap[pos.txId]
      return tx && tx.pot && tx.pot.potId
    })
  }
  return showAllTime ? positions : positionFilter(positions, selectedGroupId, selectedCategoryId, selectedTxIdList, selectedFreeWord)
}


const positionFilterFreeWord = (pos, freeWord) => {
  const columnList = [
    APP.TX.BTX_MINOR == 'minor'? 'minor': 'btxId',
    APP.TX.BTX_MINOR == 'both'? 'minor': null,
    ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'potCd')? 'tx.pot.potCd': null,
    'tx.pot.potName',
    ArrayUtil.includesIgnoreCase(APP.POS_LIST.WITH, 'tel')? 'tx.pot.extValue.tel': null,
    MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY? 'tx.pot.category.categoryName': null,
    MenuHelper.useMaster('group') && APP.POS.WITH.GROUP? 'tx.pot.group.groupName': null,
    'state',
    APP.POSITION_WITH_AREA? 'location.area.areaName': null,
    'location.locationName',
  ].filter(val => val)
  return columnList.some(column => (new RegExp(freeWord, 'i')).test(Util.getValue(pos, column)))
}

/**
 * 位置情報に対し、カテゴリとグループで絞込みを行う。
 * @method
 * @param {Object[]} positions
 * @param {Number} groupId
 * @param {Number} categoryId
 * @param {Number[]} txIdList
 * @param {String} freeWord
 * @return {Object[]}
 */
const positionFilter = (positions, groupId, categoryId, txIdList, freeWord) => { //p
  const txIdMap = StateHelper.getMaster().txIdMap
  return _(positions).filter(pos => {
    const tx = txIdMap[pos.txId]
    let grpHit = true
    let catHit = true
    let detailHit = true
    let freeWordHit = true
    if (tx) {
      if (groupId) {
        grpHit = groupId == Util.getValue(tx, 'pot.group.groupId')
      }
      if (categoryId) {
        catHit = categoryId == Util.getValue(tx, 'pot.category.categoryId')
      }
      if (txIdList != null) {
        detailHit = txIdList.includes(tx.txId)
      }
      if (freeWord != null) {
        freeWordHit = positionFilterFreeWord(pos, freeWord)
      }
    }
    return grpHit && catHit && detailHit && freeWordHit
  }).value()
}

/**
 * ゲスト指定されているグループのみに絞り込む
 * 
 * @param {} positions 
 */
export const filterPositionsOnlyGuest = (positions) => {
  return positions.filter(pos => {
    const tx = StateHelper.getMaster().txIdMap[pos.txId]
    const groupCd = Util.getValue(tx, 'pot.group.groupCd')
    return APP.POS.GUEST_GROUP_CD_LIST.includes(groupCd)
  })
}



// ---- 小メソッド

/**
 * 指定した位置情報に紐づくTxが固定表示か確認する。
 * @method
 * @param {Object} pos
 * @return {Boolean}
 */
export const hasTxLocation = tx => tx && tx.location && tx.location.x && tx.location.y && tx.location.x * tx.location.y > 0

/**
 * 指定したエリアにTxが固定配置されているか確認する。
 * @method
 * @param {Object} tx
 * @param {Number} areaId
 * @return {Boolean}
 */
export const isFixedPosOnArea = (tx, areaId) => hasTxLocation(tx) && tx.location.areaId == areaId

/**
 * 今いる場所が、TXの固定場所の属する固定ゾーンと一致するか
 * 
 * @param {*} pos 
 */
export const isInFixedPosZone = (pos) => {
  const zoneList = Util.v(pos, 'tx.location.fixedPosZoneList') // TX所属の固定ゾーン
  if (!zoneList) return false

  const locationId = Util.v(pos, 'exb.location.locationId') // 現在の場所
  if (!locationId) return false

  return zoneList.some(zone => zone.locationList.some(location => location.locationId == locationId))
}

/**
 * エリア内にいるかを返す
 * 
 * @param {*} pos 
 * @param {*} locations 
 * @param {*} selectedMapId 
 */
export const isInTheArea = (pos, locations, selectedMapId) => {
  const targetLocations = locations.filter(location => location.areaId != null && (selectedMapId == null || selectedMapId == location.areaId))
  return pos.exb.location && _.some(targetLocations, location => pos.exb.location.locationId == location.locationId)
    && pos.timestamp && (new Date(pos.timestamp).getTime() > new Date().getTime() - APP.POS.LOST_TIME)
}

/**
 * Tx表示設定を取得する。
 * @method
 * @param {Object} txViewType
 * @return {Object}
 */
const getTxViewType = txViewType => {
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
 * 検知数を返す
 * 
 * @param {*} positions 
 * @param {*} areaId 
 */
export const getDetectCount = (positions, areaId) => {
  return positions.filter(pos => (pos.detectState == DETECT_STATE.LOST || pos.detectState == DETECT_STATE.DETECTED)
    && Util.getValue(pos, 'exb.location.areaId') == areaId
  ).length
}

/**
 * 検知情報を設定する。
 * @method
 * @param {Object[]} pos
 */
export const setDetectState = (pos) => {
  pos.detectState = DetectStateHelper.getState('tx', pos.positionDt)
  // pos.detectState = pos.txId % 5; if (pos.detectState == 3) pos.detectState =1 // For test
  pos.state = DetectStateHelper.getLabel(pos.detectState)
  pos.isUnDetect = DetectStateHelper.isUndetect(pos.detectState)
  pos.noSelectedTx = (pos.detectState != DETECT_STATE.DETECTED)
}

/**
 * 透過状態か判定する。
 * @method
 * @param {Number} timestamp
 * @param {Number} now
 * @return {Boolean}
 */
export const isTransparent = (timestamp, now) => {
  return new Date(timestamp).getTime() < now - APP.POS.TRANSPARENT_TIME
}

/**
 * 消失状態（未検知含む）か判定する。
 * @method
 * @param {Number} timestamp
 * @param {Number} now
 * @return {Boolean}
 */
export const isLost = (timestamp, now) => {
  return new Date(timestamp).getTime() < now - APP.POS.LOST_TIME
}

/**
 * 表示可能なTxか確認する。
 * @method
 * @param {Object} pos
 * @param {Object} tx
 * @param {Number} areaId
 * @param {Boolean} [isAbsent = false]
 * @return {Boolean}
 */
export const checkTxAllow = (pos, tx, areaId, isAbsent = false, onlyFixPos = false) => {
  if (!tx) {
    console.warn('tx not found. btxId=' + pos.btxId)
    return false
  }
  if(isAbsent){
    return true
  }
  if (!NumberUtil.bitON(tx.disp, TX.DISP.POS)) {
    Util.debug('tx is not allowed to show', tx)
    return false
  }
  if ((pos.noSelectedTx || onlyFixPos) && !isFixedPosOnArea(tx, areaId)) {
    Util.debug('tx is not allowed to show', tx)
    return false
  }
  return true
}

// ゾーンエリアに表示できる最後のTX位置で省略を表示する際に使用する
export const zoneLastTxId = () => 100000001

export const isZoneLastTxId = (btxId) => btxId == zoneLastTxId

export const zoneLastTxData = () => { // TODO: pos_idは何に使っている？
  return { btxId: zoneLastTxId(), pos_id: 0, label: '・・・', isLost: false, }
}

export const isDoubleTx = (btxId) => btxId >= zoneBtxIdAddNumber

export const getDoubleDefaultTxId = (btxId) => btxId - zoneBtxIdAddNumber

/**
 * posオブジェクトについて変更が必要な部分のみシャローコピーしたオブジェクトを作成
 * @param {*} pos 
 */
const copyPos = (pos) => {
  const newPos = Object.assign({}, pos)
  newPos.tx = Object.assign({}, pos.tx)
  if (pos.tx.display) {
    newPos.tx.display = Object.assign({}, pos.tx.display)
  }
  return newPos
}

// ------- 固定表示 -------


/**
 * 固定座席の場合、フリー位置を追加して返す
 * 
 * @param {*} orgPositions 
 * @param {*} locations 
 * @param {*} selectedMapId 
 */
export const addFixedPosition = (orgPositions, locations = [], selectedMapId = null) => {
  let positions = orgPositions.map(pos => copyPos(pos))
  // エリア上の場所を抽出
  const additionalPos = []
  // 表示対象となるTxのposを抽出
  positions.forEach(pos => {
    pos.isFixedPosition = hasTxLocation(pos.tx)

    if (pos.isFixedPosition) { // txが場所固定されている場合
      // 今いる場所のゾーンとTXの固定場所の固定ゾーンが一致するか
      pos.inFixedZone = isInFixedPosZone(pos)
      // 固定場所ゾーンにいず、かつ検知状態の場合、フリーアドレスとしても表示
      if (!pos.inFixedZone && pos.detectState == DETECT_STATE.DETECTED && !SensorHelper.isFixedSensorTx(pos.tx)) {
        const addPos = copyPos(pos)
        addPos.isFixedPosition = false
        addPos.location = Object.assign({}, pos.exb.location)
        // addPos.isAddtional = true
        additionalPos.push(addPos)
        pos.hasAnother = true
      }
      pos.location = pos.tx.location
      if (DISP.TX.FIXED_POS.APPLY_COLOR) { // 固定表示で色を別に変える場合
        let bgColor = DISP.TX.FIXED_POS.UNDETECT_BGCOLOR
        switch (pos.detectState) {
        case DETECT_STATE.DETECTED:
          bgColor = pos.inFixedZone? DISP.TX.FIXED_POS.IN_ZONE_BGCOLOR: DISP.TX.FIXED_POS.OUT_ZONE_BGCOLOR
          break
        case DETECT_STATE.LOST:
          bgColor = DISP.TX.FIXED_POS.LOST_BGCOLOR
          break
        }
        pos.tx.display = {
          color: DISP.TX.FIXED_POS.COLOR,
          bgColor,
          shape: DISP.TX.FIXED_POS.SHAPE,        
        }
      }
      else {
        pos.isTransparent = !pos.inFixedZone
      }
    }
  })

  if (additionalPos.length > 0) positions.push(...additionalPos)

  return positions
}


// -------- 座標決定 -------

/**
 * 画面上の表示位置の設定を行う。
 * @method
 * @param {Object[]} positions
 * @param {Number} ratio
 * @param {Object[]} [locations = []]
 * @param {Number} [selectedMapId = null]
 * @return {Object[]}
 */
export const calcScreenCoordinates = (positions, ratio, locations = [], selectedMapId = null, includeFixedPos = false) => {
  const targetPos = positions.filter(pos => isInTheArea(pos, locations, selectedMapId) || includeFixedPos && pos.isFixedPosition)
  const targetLocations = locations.filter(location => location.areaId != null && (selectedMapId == null || selectedMapId == location.areaId))

  // 各Txの表示座標位置を設定
  return _(targetLocations).map(location => {
    const samePos = targetPos.filter(pos => pos.location.locationId == location.locationId)
    // console.error('samePos', samePos.map(e => e.minor))
    const txR = (location.isFixedPosZone && DISP.TX.FIXED_POS.APPLY_COLOR)? DISP.TX.FIXED_POS.R: DISP.TX.R
    samePos.forEach(pos => {
      pos.txR = txR
      pos.isFixedPosZone = location.isFixedPosZone
    })
    return calcCoordinatesWhenOverlap(location, ratio, samePos, txR)
  }).compact().flatMap(e => e).tap(Util.debug).value()
}

/**
 * 複数TXアイコンが同じ場所に重複する場合の
 * 配置座標を取得する
 * @method
 * @param {Object} location 場所オブジェクト
 * @param {Number} ratio ブラウザウインドウ縮小割合
 * @param {Object[]} samePos TXアイコン座標配列
 * @return {Object[]}
 */
const calcCoordinatesWhenOverlap = (location, ratio, samePos, txR) => {
  if (!samePos || samePos.length == 0) return []
  const viewType = getTxViewType(location.txViewType)
  if (viewType.displayFormat === TX_VIEW_TYPES.DEFAULT ||
    !Object.keys(TX_VIEW_TYPES).find(key => viewType.displayFormat === TX_VIEW_TYPES[key])) {
    return calcCoordinatesDefault(location, ratio, samePos, txR)
  }
  const maxIcons = viewType.horizon * viewType.vertical
  let baseX = location.x
  let baseY = location.y
  const c = ArrayUtil.partitioningArray(samePos, viewType.displayFormat !== TX_VIEW_TYPES.TILE ? iconsUnitNum : maxIcons)
  return c.flatMap((e, i, a) => {
    const coordinate = calcCoordinates(ratio, baseX, baseY, e, viewType, txR)
    baseX += txR
    baseY += txR
    return coordinate
  })
}


/**
 * デフォルトレイアウトのTXアイコン配置座標の配列を取得する
 * @method
 * @param {Object} location 場所オブジェクト
 * @param {Number} ratio ウインドウ縮小割合
 * @param {Object[]} samePos 同じ場所に配置するTXオブジェクトの配列
 * @return {Object[]}
 */
const calcCoordinatesDefault = (location, ratio, samePos, txR) => {
  let baseX = location.x
  let baseY = location.y
  txR = txR * ratio
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
 * @method
 * @param {Number} orgX アイコン配置開始X座標値
 * @param {Number} orgY アイコン配置開始Y座標値
 * @param {Object[]} positions 場所の配置座標配列
 * @return {Object[]}
 */
const calcCoordinatesTile = (ratio, orgX, orgY, positions, viewType, txR) => {
  return ArrayUtil.partitioningArray(positions, viewType.horizon).flatMap((array, i, a) => {
    return array.map((b, j, c) => {
      return {...b, x: orgX + txR * 2 * ratio * j, y: orgY + txR * 2 * ratio * i }
    })
  })
}

/**
 * TXアイコン長方形配置時、個々のTXアイコン配置座標を取得する
 * @method
 * @param {Number} index インデックス
 * @param {Number} x X座標値
 * @param {Number} y Y座標値
 * @param {Boolean} [isDiamond = false] trueの場合、ひし形に配置
 * @return {{x: Number, y: Number}}
 */
const calcCoordinatesSquare = (ratio, index, x, y, txR, isDiamond = false) => {
  const i = index % iconsUnitNum
  if (i < 1) {
    return {x: x, y: y}
  }
  const r = isDiamond ? StyleHelper.getRadiusDiamond(index, txR * 2) : StyleHelper.getRadiusSquare(index, DISP.TX.R * 2)
  const radian = angle * i * PIdiv180
  return {x: x + r * ratio * Math.cos(radian), y: y + r * ratio * Math.sin(radian)}
}

/**
 * TXアイコンをスパイラル状に配置時、個々のTXアイコン配置座標を取得する
 * @method
 * @param {Number} index インデックス
 * @param {Number} x X座標値
 * @param {Number} y Y座標値
 * @param {Number} theta 原点からのアイコン配置角
 * @param {Number} radius 原点からのアイコン配置距離(半径)
 * @return {{x: Number, y: Number}}
 */
const calcCoordinatesSpiral = (index, x, y, theta, radius) => {
  const radian = theta * PIdiv180
  return {
    x: index > 0 ? x + radius * Math.cos(radian) : x,
    y: index > 0 ? y + radius * Math.sin(radian) : y
  }
}

/**
 * TXアイコンを配置する座標を取得
 * @method
 * @param {Number} orgX アイコン配置開始X座標値
 * @param {Number} orgY アイコン配置開始Y座標値
 * @param {Object[]} positions 配置座標配列
 * @param {Object} viewType アイコン配置タイプ
 * @return {Object|Object[]}
 */
const calcCoordinates = (ratio, orgX, orgY, positions, viewType, txR) => {
  if (viewType.displayFormat === TX_VIEW_TYPES.TILE) {
    return calcCoordinatesTile(ratio, orgX, orgY, positions, viewType, txR)
  }
  return positions.length > 1 ? positions.map((e, i, a) => {
    const xy = (() => {
      switch (viewType.displayFormat) {
      case TX_VIEW_TYPES.SQUARE :
        return calcCoordinatesSquare(ratio, i, orgX, orgY, txR)
      case TX_VIEW_TYPES.DIAMOND :
        return calcCoordinatesSquare(ratio, i, orgX, orgY, txR, true)
      case TX_VIEW_TYPES.SPIRAL :
        return calcCoordinatesSpiral(i, orgX, orgY, 360 / positions.length * i, txR * 2 * ratio)
      default :
        return {x: orgX, y: orgY}
      }
    })()
    return {...e, x: xy.x, y: xy.y}
  }) : {...positions[0], x: orgX, y: orgY}
}


/**
 * 不在表示用ゾーンでのTX表示位置設定
 * 
 * @param {*} positions 
 * @param {*} ratio 
 * @param {*} locations 
 * @param {*} absentDisplayZone 
 */
export const calcCoordinatesForZone = (positions, ratio, locations = [], absentDisplayZone) => {
  return _(locations).map(location => { // TODO: location使っていない？ 過去のソース要比較・確認
    // 不在表示用ゾーンへ表示するTXを抽出する
    const samePos = _.sortBy(positions, position => position.label)
      .filter(position => {
        return (hasDisplayType('lost') && position.detectState == DETECT_STATE.LOST) ||
        (hasDisplayType('absent') && position.location && position.location.isAbsentZone) ||
        (hasDisplayType('undetected') && DetectStateHelper.isUndetect(position.detectState))
      })
    return (!samePos || samePos.length == 0) ? [] : calcCoordinatesZone(absentDisplayZone, ratio, samePos)
  }).flatMap(e => e).compact().uniqWith(_.isEqual).value()
}

export const hasDisplayType = (typeKey) => {
  return _.some(DISP.TX.ABSENT_ZONE_DISPLAY_TYPES, type => type == typeKey)
}

/**
 * 指定ゾーン上のTXアイコン配置座標の配列を取得する
 * 範囲ぴったりの場合は全て表示、超える場合は・・・用データを挿入し、その後のTXは返却しない
 * @param {*} absentDisplayZone 不在表示ゾーンオブジェクト
 * @param {*} ratio ウインドウ縮小割合
 * @param {*} samePos 同じ場所に配置するTXオブジェクトの配列
 */
const calcCoordinatesZone = (absentDisplayZone, ratio, samePos) => {
  const txSize = DISP.TX.R * 2
  // ゾーン開始位置が１つ目のTX中央にくるのでずらしておく
  const orgX = absentDisplayZone.x + (DISP.TX.R * ratio)
  const orgY = absentDisplayZone.y + (DISP.TX.R * ratio)
  const widthNum = Math.floor((absentDisplayZone.w + DISP.TX.R) / (txSize * ratio))

  if (widthNum == 0) {
    return [{...zoneLastTxData(), x: orgX, y: orgY}]
  }

  const heightNum = Math.floor((absentDisplayZone.h + DISP.TX.R) / (txSize * ratio))
  const hasOverTx = samePos.length > (widthNum * heightNum)
  const hasNotEnoughArea = heightNum <= 0

  return ArrayUtil.partitioningArray(samePos, widthNum).flatMap((array, i, a) => {
    return array.map((b, j, c) => {
      const isLast = i == heightNum -1 && j == widthNum -1
      const isOver = (hasOverTx && isLast) || i >= heightNum
      if (hasNotEnoughArea || (hasOverTx && isLast)) {
        return {...zoneLastTxData(), x: orgX + txSize * ratio * j, y: orgY + txSize * ratio * i, isOver: false }
      } else {
        return {...b, x: orgX + txSize * ratio * j, y: orgY + txSize * ratio * i, isOver }
      }
    }).filter((b) => !b.isOver )
  })
}


/**
 * 三点測位を行う場合の座標補正を行う。
 * FIXME: 要確認
 * 
 * @method
 * @param {Object[]} positions
 * @param {Number} ratio
 * @return {Object[]}
 */
export const calcCoordinatesForMultiPosition = (positions, selectedAreaId) => {
  return positions.filter(pos => pos.location && pos.location.areaId == selectedAreaId).map(pos => ({...pos, x: pos.x, y: pos.y}))
}
