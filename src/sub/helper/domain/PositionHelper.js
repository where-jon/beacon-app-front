/**
 * 位置情報に関するヘルパーモジュール
 * @module helper/domain/PositionHelper
 */

import * as mock from '../../../assets/mock/mock'
import { APP, DISP, DEV } from '../../constant/config'
import { TX_VIEW_TYPES, DETECT_STATE, SHAPE, TX, SENSOR } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as DateUtil from '../../util/DateUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as Util from '../../util/Util'
import * as EXCloudHelper from '../dataproc/EXCloudHelper'
import * as DetectStateHelper from './DetectStateHelper'
import * as MenuHelper from '../dataproc/MenuHelper'
import * as SensorHelper from './SensorHelper'
import * as StyleHelper from '../ui/StyleHelper'

const iconsUnitNum = 9
const tileLayoutIconsNum = 5
const PIdiv180 = Math.PI / 180
const angle = 45

// ゾーンエリアに表示するTXIDに付加する数値
export const zoneBtxIdAddNumber = 10000

// ゾーンエリアに表示できる最後のTX位置で省略を表示する際に使用する
export const zoneLastTxId = () => { return 100000001 }

export const isZoneLastTxId = (btxId) => { return btxId == zoneLastTxId }

export const zoneLastTxData = () => {
  return { btx_id: zoneLastTxId(), pos_id: 0, label: '・・・', isLost: false, }
}

export const isDoubleTx = (btxId) => { return btxId >= zoneBtxIdAddNumber }

export const getDoubleDefaultTxId = (btxId) => { return btxId - zoneBtxIdAddNumber }

const defaultDisplay = {
  color: DISP.TX.COLOR,
  bgColor: DISP.TX.BGCOLOR,
  shape: SHAPE.CIRCLE,
}

let count = 0
let store // TODO: ここでstoreに直接アクセスするのは望ましくないのでStateHelper経由にする。
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
 * 位置情報を取得する。
 * @method
 * @param {Boolean} [showAllTime = false] 検知されていないデバイスの情報も取得する
 * @param {Boolean} [notFilterByTimestamp = false] 時間による排他制御をされていない情報を取得する
 * @param {Number} [showTxNoOwner]
 * @param {Number} [selectedCategory]
 * @param {Number} [selectedGroup]
 * @param {Number} [selectedDetail]
 * @param {Number} [selectedFreWord]
 * @return {Object[]}
 */
export const getPositions = (showAllTime = false, notFilterByTimestamp = false, 
    showTxNoOwner = APP.POS.SHOW_TX_NO_OWNER,
    selectedCategory = store.state.main.selectedCategory, selectedGroup = store.state.main.selectedGroup,
    selectedDetail = store.state.main.selectedDetail,
    selectedFreeWord = store.state.main.selectedFreeWord) => { // p, position-display, rssimap, position-list, position, ProhibitHelper

  const positionHistores = store.state.main.positionHistores
  const orgPositions = store.state.main.orgPositions

  let positions = []
  if (APP.POS.USE_POSITION_HISTORY) {
    positions = positionHistores
  } else {
    const now = !DEV.USE_MOCK_EXC? new Date().getTime(): mock.positions_conf.start + count++ * mock.positions_conf.interval  // for mock
    positions = correctPosId(orgPositions, now, notFilterByTimestamp)
  }
  positions = positionOwnerFilter(positions, showTxNoOwner)
  return showAllTime ? positions : positionFilter(positions, selectedGroup, selectedCategory, selectedDetail, selectedFreeWord)
}

/**
 * 位置情報に対し、potの所有状態で絞込みを行う。
 * @method
 * @param {Object[]} positions 
 * @param {Boolean} showTxNoOwner 
 * @return {Object[]}
 */
const positionOwnerFilter = (positions, showTxNoOwner) => { //p 
  const txs = store.state.app_service.txs
  const txsMap = {}
  txs.forEach(tx => txsMap[tx.btxId] = tx)

  return _(positions).filter(pos => {
    const tx = txsMap[pos.btx_id]
    if (tx && !showTxNoOwner) {
      return tx.potId? true: false
    }
    return true
  }).value()
}

const positionFilterFreeWord = (pos, freeWord) => {
  const columnList = [
    APP.TX.BTX_MINOR == 'minor'? 'minor': 'btx_id',
    APP.TX.BTX_MINOR == 'both'? 'minor': null,
    ArrayUtil.includesIgnoreCase(APP.POT.WITH, 'potCd')? 'tx.potCd': null,
    'tx.potName',
    ArrayUtil.includesIgnoreCase(APP.POS_LIST.WITH, 'tel')? 'tx.extValue.tel': null,
    MenuHelper.useMaster('category') && APP.POS.WITH.CATEGORY? 'tx.categoryName': null,
    MenuHelper.useMaster('group') && APP.POS.WITH.GROUP? 'tx.groupName': null,
    'state',
    APP.POSITION_WITH_AREA? 'location.areaName': null,
    'location.locationName',
    'updatetime',
  ].filter(val => val)
  return columnList.some(column => (new RegExp(freeWord, 'i')).test(Util.getValue(pos, column, null)))
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
  const txs = store.state.app_service.txs

  const txsMap = {}
  txs.forEach(tx => txsMap[tx.btxId] = tx)
  return _(positions).filter(pos => {
    const tx = txsMap[pos.btx_id]
    let grpHit = true
    let catHit = true
    let detailHit = true
    let freeWordHit = true
    if (tx) {
      if (groupId) {
        grpHit = groupId == tx.groupId
      }
      if (categoryId) {
        catHit = categoryId == tx.categoryId
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
 * 位置情報の履歴を取得し、vueステートに保管する。
 * @method
 * @async
 * @param {Number} count mock用
 * @param {Boolean} [allShow = false] 検知されないデバイスの情報も取得する。
 * @param {Boolean} [fixSize = false] 固定サイズ用の幅と高さをcssに適用する。
 * @return {Object[]}
 */
export const storePositionHistory = async (count, allShow = false, fixSize = false) => { // position-display, pir, position-list, position, sensor-list
  const pMock = DEV.USE_MOCK_EXC? mock.positions[count]: null

  const locations = store.state.app_service.locations
  const exbs = store.state.app_service.exbs
  const txs = store.state.app_service.txs
  const positionHistores = store.state.main.positionHistores
  const orgPositions = store.state.main.orgPositions

  let positions = []
  if (APP.POS.USE_POSITION_HISTORY) {
    // Serverで計算された位置情報を得る
    positions = await EXCloudHelper.fetchPositionHistory(locations, exbs, txs, allShow, pMock)
  } else {
    // 移動平均数分のポジションデータを保持する
    positions = await EXCloudHelper.fetchPosition(locations, exbs, txs, pMock, allShow)
  }
  // 検知状態の取得
  setDetectState(positions, APP.POS.USE_POSITION_HISTORY)
  // 在席表示と同じ、表示txを取得する。
  positions = getShowTxPositions(positionHistores, orgPositions, positions, allShow)
  // スタイルをセット
  positions = setPositionStyle(positions, fixSize)
  if (APP.POS.USE_POSITION_HISTORY) {
    // this.replaceMain({positionHistores: positions})
    store.commit('main/replaceMain', {positionHistores: positions})
  } else {
    // this.replaceMain({orgPositions: []})
    store.commit('main/replaceMain', {orgPositions: []})
    pushOrgPositions(orgPositions, positions)
  }
  return positions
}

/**
 * 移動平均情報を整理し、vueステートを更新する。
 * @method
 * @param {Object[]} pOrgPositions
 * @param {Object[]} positions
 */
const pushOrgPositions = (pOrgPositions, positions) => {
  let orgPositions = _.clone(pOrgPositions)
  if (orgPositions.length >= APP.POS.MOVING_AVERAGE) {
    orgPositions.shift()
  }
  orgPositions.push(positions)
  store.commit('main/replaceMain', {orgPositions})
}

/**
 * 位置情報にcssスタイル情報を設定する。
 * @method
 * @param {Object[]} positions
 * @param {Boolean} [fixSize = false] 固定サイズ用の幅と高さをcssに適用する。
 * @return {Object[]}
 */
const setPositionStyle = (positions, fixSize = false) => { // p
  return _.map(positions, pos => {
    // 設定により、カテゴリとグループのどちらの設定で表示するかが変わる。
    let display
    if (pos.tx) {
      display = Util.getValue(pos.tx, DISP.TX.DISPLAY_PRIORITY + '.display', null)
    }
    display = display || defaultDisplay
    display = StyleHelper.getStyleDisplay1({...display, label: pos.label}, {fixSize: fixSize})
    if (pos.transparent) {
      display.opacity = 0.6
    }
    return {
      ...pos,
      display,
    }
  })
}

/**
 * Txの表示フラグに従い、位置情報を整理する。
 * @method
 * @param {Object[]} positionHistores
 * @param {Object[]} orgPositions
 * @param {Object[]} positions
 * @param {Boolean} [allShow = false]
 * @return {Object[]}
 */
const getShowTxPositions = (positionHistores, orgPositions, positions, allShow = false) => { // p
  const now = !DEV.USE_MOCK_EXC ? new Date().getTime(): mock.positions_conf.start + count++ * mock.positions_conf.interval
  //const correctPositions = APP.POS.USE_POSITION_HISTORY? positionHistores: correctPosId(orgPositions, now)
  const correctPositions = positions // ここでpositionHistoresを使う必要はない
  const cPosMap = {}
  correctPositions.forEach(c => cPosMap[c.btx_id] = c)
  return _(positions)
    .filter(pos => allShow || (pos.tx && NumberUtil.bitON(pos.tx.disp, TX.DISP.POS)))
    .map(pos => {
      let cPos = cPosMap[pos.btx_id]
      if (cPos || allShow) {
        return {
          ...pos,
          transparent: !cPos? true: cPos.transparent? cPos.transparent: isTransparent(cPos.timestamp, now),
          isLost: !cPos? true: isLost(cPos.timestamp, now)
        }
      }
      return null
    }).compact().value()
}

/**
 * EXBの配置位置情報を取得する。
 * @method
 * @param {Number} selectedArea
 * @return {Object[]}
 */
export const getPositionedExb = selectedArea => { // pir, position
  const exbs = store.state.app_service.exbs

  Util.debug('Raw exb', exbs, selectedArea)
  let positionedExb = _(_.cloneDeep(exbs)).filter(exb => {
    return Util.hasValue(exb.location) && exb.location.areaId == selectedArea && exb.location.x && exb.location.y > 0
  }).value()
  Util.debug('positionedExb', positionedExb)
  if (positionedExb.length == 0) {
    console.warn('positionedExb is empty. check if exbs are enabled')
  }

  return positionedExb
}

/**
 * センサ情報を使用し、EXBの配置位置情報を取得する。
 * @method
 * @param {Number} selectedArea
 * @param {Function} sensorFilterFunc
 * @param {Function} findSensorFunc
 * @param {Function} showSensorFunc
 * @param {Boolean} allArea
 * @return {Object[]}
 */
export const getPositionedExbWithSensor = (selectedArea, sensorFilterFunc, findSensorFunc, showSensorFunc, allArea) => { // pir, sensor-list, thermohumidity
  const exbs = store.state.app_service.exbs

  return _(exbs).filter(exb => {
    return exb.location && (allArea || exb.location.areaId == selectedArea) && exb.location.x && exb.location.y > 0
  })
    .filter(exb => sensorFilterFunc? sensorFilterFunc(exb): true)
    .map(exb => {
      const sensor = findSensorFunc? findSensorFunc(exb): null
      return {
        ...exb,
        x: exb.location.x,
        y: exb.location.y,
        humidity: sensor? sensor.humidity: null,
        temperature: sensor? sensor.temperature: null,
        count: sensor? sensor.count: 0,
        pressVol: sensor? sensor.press_vol: 0,
        sensorId: sensor? sensor.id: null,
        updatetime: sensor? sensor.updatetime? sensor.updatetime: sensor.timestamp: null,
        areaName: exb.areaName,
        locationName: exb.locationName,
        posId: exb.posId,
        deviceIdX: exb.deviceIdX,
        areaId: exb.areaId,
        zoneIdList: exb.zoneIdList,
        zoneCategoryIdList: exb.zoneCategoryIdList,
        description: exb.description? exb.description: '',
      }
    })
    .filter(exb => showSensorFunc? showSensorFunc(exb): true)
    .value()
}

/**
 * センサ情報を使用し、Txの配置位置情報を取得する。
 * @method
 * @param {Number} selectedArea
 * @param {Function} sensorFilterFunc
 * @param {Function} findSensorFunc
 * @param {Function} showSensorFunc
 * @param {Boolean} allArea
 * @param {Boolean} allPosition
 * @return {Object[]}
 */
export const getPositionedTx = (selectedArea, sensorFilterFunc, findSensorFunc, showSensorFunc, allArea, allPosition) => { // sensor-list, thermohumidity
  const txs = store.state.app_service.txs
  const locationMap = {}
  store.state.app_service.locations.forEach(l => locationMap[l.locationId] = l)

  return _(txs).filter(tx => {
    return allPosition? true: tx.location && (allArea || tx.location.areaId == selectedArea) && tx.location.x && tx.location.y > 0
  })
    .filter(tx => sensorFilterFunc? sensorFilterFunc(tx): true)
    .map(tx => {
      const sensor = findSensorFunc? findSensorFunc(tx): null
      const location = tx.locationId? locationMap[tx.locationId]: {}
      const zoneIdList = Util.getValue(location, 'zoneIdList', [])
      const zoneCategoryIdList = Util.getValue(location, 'zoneCategoryIdList', [])
      return {
        txId: tx.txId, btxId: tx.btxId,
        x: tx.location? tx.location.x: null, y: tx.location? tx.location.y: null,
        humidity: sensor? sensor.humidity: null,
        temperature: sensor? sensor.temperature: null,
        sensorId: sensor? sensor.id: null,
        updatetime: sensor? sensor.updatetime? sensor.updatetime: sensor.timestamp: null,
        areaName: tx.areaName,
        locationName: tx.locationName,
        posId: tx.posId,
        potName: tx.potName,
        sensorName: tx.sensorName,
        major: tx.major,
        minor: tx.minor,
        description: tx.description? tx.description: '',
        high: sensor? sensor.high: null,
        low: sensor? sensor.low: null,
        beat: sensor? sensor.beat: null,
        step: sensor? sensor.step: null,
        down: sensor? sensor.down: null,
        magnet: sensor? sensor.magnet: null,
        areaId: allPosition? Util.getValue(sensor, 'areaId', tx.areaId): tx.areaId,
        zoneIdList: allPosition? Util.getValue(sensor, 'zoneIdList', zoneIdList): zoneIdList,
        zoneCategoryIdList: allPosition? Util.getValue(sensor, 'zoneCategoryIdList', zoneCategoryIdList): zoneCategoryIdList,
        btx_id: sensor? sensor.btx_id: null,
        label: sensor? sensor.label: null,
        bg: sensor? sensor.bg: null,
      }
    })
    .filter(tx => showSensorFunc? showSensorFunc(tx): true)
    .value()
}

/**
 * 配列をnumで指定された要素数で区切る
 * @method
 * @param {Object[]} array パーティショニング元配列
 * @param {Number} num 1つのパーティションの要素数
 * @return {Object[]}
 */
const partitioningArray = (array, num) => {
  const len = array.length
  const c = []
  for (let i = 0 ; i < len ; i += num) {
    c.push(array.slice(i, (i + num)))
  }
  return c
}

/**
 * 長方形配置時の、原点からの距離(半径)を取得する
 * @method
 * @param {Number} index
 * @param {Number} radius
 * @return {Number}
 */
const getRadiusSquare = (index, radius) => index % 2 === 0 ? radius : Math.sqrt(Math.pow(radius, 2) * 2)

/**
 * ひし形配置時の、原点からの距離(半径)を取得する
 * @method
 * @param {Number} index
 * @param {Number} radius
 * @return {Number}
 */
const getRadiusDiamond = (index, radius) => (index % 2 !== 0 && index % 6 !== 0) ? radius : radius * 1.5

/**
 * 指定した位置情報に紐づくTxが固定表示か確認する。
 * @method
 * @param {Object} pos
 * @return {Boolean}
 */
const hasTxLocation = pos => pos && pos.tx && pos.tx.location && pos.tx.location.x && pos.tx.location.y

/**
 * Tx固定表示座標の情報を取得する。
 * @method
 * @param {Number} ratio
 * @param {Object[]} fixPositions
 * @return {Object[]}
 */
const getCoordinateFix = (ratio, fixPositions) => {
  const ret = []
  fixPositions.forEach(fixPosition => {
    ret.push(hasTxLocation(fixPosition)? {...fixPosition, x: fixPosition.tx.location.x, y: fixPosition.tx.location.y}: null)
  })
  return ret.filter(val => val)
}

/**
 * デフォルトレイアウトのTXアイコン配置座標の配列を取得する
 * @method
 * @param {Object} location 場所オブジェクト
 * @param {Number} ratio ウインドウ縮小割合
 * @param {Object[]} samePos 同じ場所に配置するTXオブジェクトの配列
 * @return {Object[]}
 */
const getCoordinateDefault = (location, ratio, samePos) => {
  let baseX = location.x
  let baseY = location.y
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
 * @method
 * @param {Number} orgX アイコン配置開始X座標値
 * @param {Number} orgY アイコン配置開始Y座標値
 * @param {Object[]} positions 場所の配置座標配列
 * @return {Object[]}
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
 * @method
 * @param {Number} index インデックス
 * @param {Number} x X座標値
 * @param {Number} y Y座標値
 * @param {Boolean} [isDiamond = false] trueの場合、ひし形に配置
 * @return {{x: Number, y: Number}}
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
 * @method
 * @param {Number} index インデックス
 * @param {Number} x X座標値
 * @param {Number} y Y座標値
 * @param {Number} theta 原点からのアイコン配置角
 * @param {Number} radius 原点からのアイコン配置距離(半径)
 * @return {{x: Number, y: Number}}
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
 * @method
 * @param {Number} orgX アイコン配置開始X座標値
 * @param {Number} orgY アイコン配置開始Y座標値
 * @param {Object[]} positions 配置座標配列
 * @param {Object} viewType アイコン配置タイプ
 * @return {Object|Object[]}
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
 * 複数TXアイコンが同じ場所に重複する場合の
 * 配置座標を取得する
 * @method
 * @param {Object} location 場所オブジェクト
 * @param {Number} ratio ブラウザウインドウ縮小割合
 * @param {Object[]} samePos TXアイコン座標配列
 * @return {Object[]}
 */
const getPositionsToOverlap = (location, ratio, samePos) => {
  const viewType = getTxViewType(location.txViewType)
  if (viewType.displayFormat === TX_VIEW_TYPES.DEFAULT ||
    !Object.keys(TX_VIEW_TYPES).find(key => viewType.displayFormat === TX_VIEW_TYPES[key])) {
    return getCoordinateDefault(location, ratio, samePos)
  }
  const maxIcons = viewType.horizon * viewType.vertical
  let baseX = location.x
  let baseY = location.y
  const c = partitioningArray(samePos, viewType.displayFormat !== TX_VIEW_TYPES.TILE ? iconsUnitNum : maxIcons)
  return c.flatMap((e, i, a) => {
    const coordinate = getCoordinate(ratio, baseX, baseY, e, viewType)
    baseX += DISP.TX.R
    baseY += DISP.TX.R
    return coordinate
  })
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
 * 指定ゾーン上のTXアイコン配置座標の配列を取得する
 * 範囲ぴったりの場合は全て表示、超える場合は・・・用データを挿入し、その後のTXは返却しない
 * @param {*} absentDisplayZone 不在表示ゾーンオブジェクト
 * @param {*} ratio ウインドウ縮小割合
 * @param {*} samePos 同じ場所に配置するTXオブジェクトの配列
 */
const getCoordinateZone = (absentDisplayZone, ratio, samePos) => {
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

  return partitioningArray(samePos, widthNum).flatMap((array, i, a) => {
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
 * 過去の位置データの移動平均、RSSIによるフィルタリング、時間によるフィルタリングで位置を決定
 * @method
 * @param {Object[]} orgPositions
 * @param {Number} now
 * @param {Boolean} [showAllTime = false]
 * @return {Object[]}
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
  orgPositions.forEach(orgPositionList => {
    orgPositionList.forEach(orgPosition => {
      _.forEach(orgPosition, (orgValue, orgKey) => {
        positions.forEach(position => {
          if(orgPosition.btx_id == position.btx_id && position[orgKey] == null){
            position[orgKey] = orgValue
          }
        })
      })
    })
  })
  return positions
}

/**
 * nearestから位置情報を作成する。
 * @method
 * @param {Object[]} orgPositions
 * @param {Number} now
 * @param {Boolean} [showAllTime = false]
 * @return {Object[]}
 */
export const correctNearestPositions = (orgPositions, now, showAllTime = false) => {
  return _.chain(orgPositions).reduce((result, positions, idx) => { // MOVING_AVERAGE回の測位データを集約し、nearestをフラットにして１階層のオブジェエクト配列にする
    _.forEach(positions, pos => {
      _.forEach(pos.nearest, val => {
        result.push({btx_id:pos.btx_id, pos_id:val.place_id, label:pos.label, rssi:val.rssi, timestamp:val.timestamp})
      })
    })
    return result
  }, [])
    .uniqWith(_.isEqual) // 重複除去
    .filter(val => {
      if (DEV.DEBUG) {
        const method = now - val.timestamp > APP.POS.LOST_TIME || val.rssi < APP.POS.RSSI_MIN? 'warn': 'log'
        console[method]('btxId', val.btx_id, DateUtil.formatDate(val.timestamp), (now - val.timestamp) / 1000 + '秒前', 'RSSI: ' + Math.round(val.rssi * 100)/ 100)
      }
      return true
    })
    .filter(val => val.rssi >= APP.POS.RSSI_MIN && (showAllTime || val.timestamp >= now - APP.POS.LOST_TIME)) // RSSI値、指定時刻でフィルタ
    .orderBy(['btx_id', 'pos_id', 'timestamp']) // btx_id, pos_id, timestampでソート
    .value()
}

/**
 * btx_id,pos_idグループでsum(rssi), countを集計する。
 * @method
 * @param {Object[]} orgPositions
 * @return {Object[]}
 */
export const correctSumCount = orgPositions => {
  return _.chain(orgPositions).reduce((result, pos) => { // btx_id,pos_idグループでsum(rssi), countを集計（lodashのgroupByは複数には対応していない）
    const prev = _.find(result, val => val.btx_id == pos.btx_id && val.pos_id == pos.pos_id)
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
    .map((val => ({...val, count: val.count > 1? 2: 1}))) // count 2以上は2とみなす（1回のみとは区別）
    .orderBy(['count', 'rssiAvg', 'pos_id', 'btx_id'], ['desc','desc','asc','asc']) // 記録回数（多）、RSSI（強）、pos_id、btx_idでソート
    .value()
}

/**
 * 回数とRSSI値の強い順にpos_idとbtx_idのペアを作成する。
 * @method
 * @param {Object[]} orgPositions
 * @param {Number} now
 * @return {Object[]}
 */
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

/**
 * 位置情報の補正を行う。
 * @method
 * @param {Object[]} positions
 * @param {Number} ratio
 * @param {Object[]} [locations = []]
 * @param {Number} [selectedMapId = null]
 * @return {Object[]}
 */
export const adjustPosition = (positions, ratio, locations = [], selectedMapId = null) => {
  const records = locations.filter(location => location.areaId != null && (selectedMapId == null || selectedMapId == location.areaId)).map(location => {
    const samePos = []
    const fixPos = []

    positions.forEach(pos => {
      const isFixPosition = hasTxLocation(pos) && selectedMapId && pos.tx.location.areaId == selectedMapId
      if (!isFixPosition) {
        if (pos.location && pos.location.locationId == location.locationId && pos.timestamp
          &&(new Date(pos.timestamp) > new Date().getTime() - APP.POS.LOST_TIME)) {
          samePos.push(pos)
        }
      } else {
        fixPos.push(pos)
      }
    })

    const same = (!samePos || samePos.length == 0) ? [] : getPositionsToOverlap(location, ratio, samePos)
    const fix = (!fixPos || fixPos.length == 0) ? [] : getCoordinateFix(ratio, fixPos)
    return [...same, ...fix]
  })

  return records.filter(e => e).flatMap(e => e).filter(function (x, i, self) {
    return (self.findIndex(function(val) {
      return (x.btx_id === val.btx_id)
    }) === i)
  }).filter(e => selectedMapId === null || (e.location && e.location.areaId == selectedMapId))
}

/**
 * 三点測位を行う場合の座標補正を行う。
 * @method
 * @param {Object[]} positions
 * @param {Number} ratio
 * @return {Object[]}
 */
export const adjustMultiPosition = (positions, selectedArea) => {
  const ret = []
  positions.filter(pos => pos.location && pos.location.areaId == selectedArea).map(pos => {
    ret.push( {...pos, x: pos.x, y: pos.y} )
  })
  return ret
}

export const adjustZonePosition = (positions, ratio, locations = [], absentDisplayZone) => {
  return locations.map(location => {
    // 不在表示用ゾーンへ表示するTXを抽出する
    const samePos = _.sortBy(positions, position => position.label)
      .filter(position => {
        return (hasDisplayType('lost') && position.detectState == DETECT_STATE.LOST) ||
        (hasDisplayType('absent') && position.location && position.location.isAbsentZone) ||
        (hasDisplayType('undetected') && DetectStateHelper.isUndetect(position.detectState))
      })
    const same = (!samePos || samePos.length == 0) ? [] : getCoordinateZone(absentDisplayZone, ratio, samePos)
    return [...same]
  }).filter(e => e).flatMap(e => e).filter(function (x, i, self) {
    return (self.findIndex(function(val) {
      return (x.btx_id === val.btx_id)
    }) === i)
  })
}

export const hasDisplayType = (typeKey) => {
  return _.some(DISP.TX.ABSENT_ZONE_DISPLAY_TYPES, type => type == typeKey)
}

/**
 * 検知情報を設定する。
 * @method
 * @param {Object[]} positions
 * @param {Boolean} [usePositionHistory = false]
 */
export const setDetectState = (positions, usePositionHistory = false) => {

  _.forEach(positions, position => {
    let updatetime = null
    let rssi = null
    if (Util.hasValue(position.nearest)) {
      const nearest = _(position.nearest).map(val => ({timestamp: val.timestamp, rssi: val.rssi}))
        .sort((a, b) => a.timestamp < b.timestamp? -1: a.timestamp > b.timestamp? 1: 0).last()
      updatetime = nearest.timestamp
      rssi = nearest.rssi
    }else if(usePositionHistory){
      updatetime = position.timestamp
    }

    position.detectState = DetectStateHelper.getState('tx', updatetime, rssi) // nearestのtimestampを使用
    position.state = DetectStateHelper.getLabel(position.detectState)
    position.noSelectedTx = (position.detectState != DETECT_STATE.DETECTED)
  })

}

/**
 * 透過状態にするか判定する。
 * @method
 * @param {Number} timestamp
 * @param {Number} now
 * @return {Boolean}
 */
export const isTransparent = (timestamp, now) => {
  const date = new Date(timestamp)
  return date.getTime() < now - APP.POS.TRANSPARENT_TIME
}

/**
 * 消失状態にするか判定する。
 * @method
 * @param {Number} timestamp
 * @param {Number} now
 * @return {Boolean}
 */
export const isLost = (timestamp, now) => {
  const date = new Date(timestamp)
  return date.getTime() < now - APP.POS.LOST_TIME
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
  Util.debug('showTx', pos, tx && tx.sensor)
  if (!tx) {
    console.warn('tx not found. btx_id=' + pos.btx_id)
    return false
  }
  if(isAbsent){
    return true
  }
  if (!NumberUtil.bitON(tx.disp, TX.DISP.POS)) {
    Util.debug('tx is not allowed to show', tx)
    return false
  }
  if ((pos.noSelectedTx || onlyFixPos) && !isFixTx(tx, areaId)) {
    Util.debug('tx is not allowed to show', tx)
    return false
  }
  return true
}

/**
 * 無効な場所の情報をデバッグログに表示する。
 * @method
 * @param {Object[]} locationList
 */
export const disableLocationsCheck = locationList => {
  // for debug
  const disabledLocations = {}
  _.filter(locationList, location => Util.hasValue(location.posId) && (!location.x || location.y <= 0)).forEach(l => disabledLocations[l.posId] = l)
  getPositions().forEach(pos => {
    const location = disabledLocations[pos.pos_id]
    if(location){
      Util.debug('Found at disabled location', pos, location)
    }
  })
}

/**
 * 指定したエリアにTxが固定配置されているか確認する。
 * @method
 * @param {Object} tx
 * @param {Number} areaId
 * @return {Boolean}
 */
export const isFixTx = (tx, areaId) => tx && tx.location && tx.location.areaId == areaId && tx.location.x * tx.location.y > 0

/**
 * 指定したEXBと同じエリアにTxが固定配置されているか確認する。
 * @method
 * @param {Object} tx
 * @param {Object} location
 * @return {Boolean}
 */
export const isOtherFloorFixTx = (tx, location) => tx && tx.location && location && tx.location.areaId != location.areaId && tx.location.x * tx.location.y > 0

/**
 * 位置表示のTx詳細に必要な情報を取得する。
 * @method
 * @param {Number} x
 * @param {Number} y
 * @param {Object} tx
 * @param {Number} canvasScale
 * @param {{x: Number, y: Number}} offset
 * @param {{width: Number, height: Number}} containerRect
 * @param {Object} preloadThumbnail
 * @return {Object}
 */
export const createTxDetailInfo = (x, y, tx, canvasScale, offset, containerRect, preloadThumbnail) => {
  const display = StyleHelper.getPositionDisplay(tx)
  const position = getPositions().find(e => e.btx_id === tx.btxId)
  const ret = {
    btxId: tx.btxId,
    minor: i18n.tnl('label.minor') + ':' + tx.btxId,
    major: tx.major? i18n.tnl('label.major') + ':' + tx.major : '',
    // TX詳細ポップアップ内部で表示座標計算する際に必要
    orgLeft: x * canvasScale + offset.x,
    orgTop: y * canvasScale + offset.y,
    scale: DISP.TX.R_ABSOLUTE? 1.0 : canvasScale,
    containerWidth: containerRect.width,
    containerHeight: containerRect.height,
    class: !tx.btxId ? '': 'balloon-u', // 上表示のみに固定,
    name: Util.getValue(tx, 'potName', ''),
    tel: Util.getValue(tx, 'extValue.tel', ''),
    timestamp: position ? DateUtil.formatDate(new Date(position.timestamp)) : '',
    thumbnail: Util.getValue(preloadThumbnail, 'src', ''),
    category: Util.getValue(tx, 'categoryName', ''),
    group: Util.getValue(tx, 'groupName', ''),
    bgColor: display.bgColor,
    color: display.color,
    isDispRight: x + offset.x + 100 < window.innerWidth,
  }
  if(tx.extValue){
    Object.keys(tx.extValue).forEach( key => { ret[key] = i18n.tnl('label.' + key) + ':' + tx.extValue[key] } )
  }
  return ret
}

/**
 * 位置表示Txアイコンの文字色を取得する。
 * @method
 * @param {Object} display
 * @param {Object} meditag
 * @param {Object} magnet
 * @return {String}
 */
export const getTxIconColor = (display, meditag, magnet) => meditag? '#000': SensorHelper.isMagnetOn(magnet)? display.bgColor : display.color

/**
 * 位置表示Txアイコンの背景色を取得する。
 * @method
 * @param {Object} display
 * @param {Object} meditag
 * @param {Object} magnet
 * @return {String}
 */
export const getTxIconBgColor = (display, meditag, magnet) => meditag? meditag.bg: SensorHelper.isMagnetOn(magnet)? display.color: display.bgColor

/**
 * 位置情報を含む、Txセンサの情報を取得する。
 * @method
 * @param {Number} areaId
 * @param {Object} [sensorMap = {}]
 * @param {Number[]} [showSensorIds = []]
 * @param {Number[]} [mergeSensorIds = []]
 * @return {Object}
 */
export const fetchPositionWithTxSensor = (areaId, sensorMap = {}, showSensorIds = [], mergeSensorIds = []) => {
  const positionedTx = getPositionedTx(areaId,
    null,
    tx => {
      const targetSensor = {}
      targetSensor.temperature = sensorMap.temperature.find(val => (val.btxid == tx.btxId || val.btx_id == tx.btxId) && (val.timestamp || val.updatetime))
      targetSensor.meditag = sensorMap.meditag.find(val => val.btxid == tx.btxId || val.btx_id == tx.btxId)
      targetSensor.magnet = sensorMap.magnet.find(val => (val.btxid == tx.btxId || val.btx_id == tx.btxId) && (val.timestamp || val.updatetime))
      return SensorHelper.getPrimarySensor(targetSensor, showSensorIds)
    },
    tx => tx == null || !SensorHelper.includesSensorId(mergeSensorIds, tx.sensorId)? false: tx.sensorId == SENSOR.TEMPERATURE && tx.temperature == null? false: true,
    true,
    true,
  )
  const positionedTxMap = {}
  positionedTx.forEach(tx => {
    const keyName = tx.sensorId == SENSOR.TEMPERATURE? 'temperature': tx.sensorId == SENSOR.MEDITAG? 'meditag': tx.sensorId == SENSOR.MAGNET? 'magnet': 'normal'
    if(!positionedTxMap[keyName]){
      positionedTxMap[keyName] = []
    }
    positionedTxMap[keyName].push(tx)
  })
  return positionedTxMap
}

/**
 * 位置情報を含む、EXBセンサの情報を取得する。
 * @method
 * @param {Number} areaId
 * @param {Object} [sensorMap = {}]
 * @param {Number[]} [showSensorIds = []]
 * @param {Number[]} [mergeSensorIds = []]
 * @return {Object}
 */
export const fetchPositionWithExbSensor = (areaId, sensorMap = {}, showSensorIds = [], mergeSensorIds = []) => {
  if(!Util.hasValue(showSensorIds)){
    return {}
  }
  const positionedExb = getPositionedExbWithSensor(areaId,
    null,
    exb => {
      const targetSensor = {}
      targetSensor.temperature = sensorMap.temperature.find(val => val.deviceid == exb.deviceId  && (val.timestamp || val.updatetime))
      targetSensor.pir = sensorMap.pir.find(val => val.deviceid == exb.deviceId && val.count >= DISP.PIR.MIN_COUNT)
      targetSensor.thermopile = sensorMap.thermopile.find(val => val.deviceid == exb.deviceId)
      targetSensor.pressure = sensorMap.pressure.find(val => val.deviceid == exb.deviceId && val.press_vol != null)
      Util.debug({exb, targetSensor})
      return SensorHelper.getPrimarySensor(targetSensor, showSensorIds)
    },
    exb => exb == null || !SensorHelper.includesSensorId(mergeSensorIds, exb.sensorId)? false: exb.sensorId == SENSOR.TEMPERATURE? exb.temperature != null: exb.sensorId == SENSOR.PRESSURE? exb.pressVol <= DISP.PRESSURE.VOL_MIN || DISP.PRESSURE.EMPTY_SHOW: exb.count > 0 || DISP.PIR.EMPTY_SHOW
  )
  const positionedExbMap = {}
  positionedExb.forEach(exb => {
    const keyName = exb.sensorId == SENSOR.TEMPERATURE? 'temperature': exb.sensorId == SENSOR.PIR? 'pir': exb.sensorId == SENSOR.THERMOPILE? 'thermopile': exb.sensorId == SENSOR.PRESSURE? 'pressure': 'normal'
    if(!positionedExbMap[keyName]){
      positionedExbMap[keyName] = []
    }
    positionedExbMap[keyName].push(exb)
  })
  if(SensorHelper.includesSensorId(showSensorIds, SENSOR.MAGNET) && APP.SENSOR.SHOW_MAGNET_ON_PIR) {
    positionedExbMap.magnet = sensorMap.magnet
  }
  return positionedExbMap
}

/**
 * 位置表示を含む、センサ情報を取得する。
 * @method
 * @param {Number} areaId
 * @param {Number[]} [showTxSensorIds = []]
 * @param {Number[]} [showExbSensorIds = []]
 * @param {Number[]} [mergeSensorIds = []]
 * @return {Object}
 */
export const fetchPositionWithSensor = async (areaId, showTxSensorIds = [], showExbSensorIds = [], mergeSensorIds = []) => {
  const txs = store.state.app_service.txs
  const txsMap = {}
  txs.forEach(t => txsMap[t.btxId] = t)

  const sensorMap = {}
  const sensorInfos = await SensorHelper.fetchAllSensor(mergeSensorIds)
  sensorInfos.forEach(sensor => sensorMap[sensor.name] = sensor.data)

  sensorMap.meditag = _(sensorMap.meditag)
    .filter(val => txs.some(tx => tx.btxId == val.btx_id))
    .map(val => {
      const label = Util.getValue(txsMap[val.btx_id], 'displayName', val.btx_id)
      return {...val, label, bg: SensorHelper.getStressBg(val.stress), down: val.down? val.down: 0}
    })
    .sortBy(val => (new Date().getTime() - val.downLatest < APP.SENSOR.MEDITAG.DOWN_RED_TIME)? val.downLatest * -1: val.btx_id)
    .value()

  return {
    sensorMap,
    positionedTxMap: fetchPositionWithTxSensor(areaId, sensorMap, showTxSensorIds, mergeSensorIds),
    positionedExbMap: fetchPositionWithExbSensor(areaId, sensorMap, showExbSensorIds, mergeSensorIds),
  }
}

/**
 * 補正済み位置情報を取得する。
 * @method
 * @param {Number} areaId
 * @param {Number} ratio
 * @param {Boolean} [disabledFilter = false]
 * @return {Object}
 */
export const getPositionsWithAdjust = (areaId, ratio, disabledFilter = false) => {
  const locations = store.state.app_service.locations

  const position = disabledFilter? getPositions(false, false, null, null, null): getPositions()
  if(APP.POS.USE_MULTI_POSITIONING){
    // ３点測位はUSE_POSITION_HISTORYには非対応
    return adjustMultiPosition(position, areaId)
  }
  return adjustPosition(position, ratio, locations, areaId)
}
