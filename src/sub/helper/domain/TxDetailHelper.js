/**
 * TX詳細ポップアップ表示に関するヘルパーモジュール
 * @module helper/domain/TxDetailHelper
 */

import { APP, DEV, DISP } from '../../constant/config'
import { PRESENCE } from '../../constant/Constants'
import * as StyleHelper from '../ui/StyleHelper'
import * as PositoinHelper from './PositionHelper'
import * as DateUtil from '../../util/DateUtil'
import * as Util from '../../util/Util'


let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pStore
 * @param {Object} pI18n
 */
export const setApp = (pI18n) => {
  i18n = pI18n
}

/**
 * 位置表示のTx詳細に必要な情報を取得する。
 * 
 * @method
 * @param {Number} x
 * @param {Number} y
 * @param {Object} tx
 * @param {Number} canvasScale
 * @param {{x: Number, y: Number}} offset
 * @param {{width: Number, height: Number}} containerRect
 * @param {Object} preloadThumbnail
 * @oaran {Boolean} isList
 * @return {Object}
 */
export const createTxDetailInfo = (x, y, color, bgColor, useDefaultColor, tx, canvasScale, offset, containerRect, preloadThumbnail, isList) => {
  const display = StyleHelper.getPositionDisplay(tx, useDefaultColor)
  if (!color) {
    color = display.color
  }
  if (!bgColor) {
    bgColor = display.bgColor
  }
  const position = PositoinHelper.filterPositions().find(e => e.btxId === tx.btxId)
  const orgLeft = isList ? x - offset.x + APP.POS_STACK.ADJUST_POPUP.X : x * canvasScale + offset.x
  const orgTop = isList ? y - offset.y + APP.POS_STACK.ADJUST_POPUP.Y : y * canvasScale + offset.y
  const ret = {
    btxId: tx.btxId,
    // TX詳細ポップアップ内部で表示座標計算する際に必要
    orgLeft,
    orgTop,
    scale: isList ? null : DISP.TX.R_ABSOLUTE? 1.0 : canvasScale,
    containerWidth: containerRect.width,
    containerHeight: containerRect.height,
    class: !tx.btxId ? '': 'balloon-u', // 上表示のみに固定,
    timestamp: getLabel('txTimestamp') + (position ? DateUtil.formatDate(new Date(position.timestamp)) : ''),
    thumbnail: Util.getValue(preloadThumbnail, 'src', ''),
    bgColor,
    color,
    isDispRight: x + offset.x + 100 < window.innerWidth,
    minor: getLabel('minor') + Util.getValue(tx, 'btxId', ''),
    major: getLabel('major') + Util.getValue(tx, 'major', ''),
    name: getLabel('name') + Util.getValue(tx, 'pot.potName', ''),
    tel: getLabel('tel') + Util.getValue(tx, 'pot.extValue.tel', ''),
    category: getLabel('category') + Util.getValue(tx, 'pot.category.categoryName', ''),
    group: getLabel('group') + Util.getValue(tx, 'pot.group.groupName', ''),
    email: getLabel('email') + Util.getValue(tx, 'pot.user.email', '')
  }
  const extValue = Util.v(tx, 'pot.extValue')
  if(extValue){
    Object.keys(extValue).forEach( key => { 
      if(!ret[key] && extValue[key] ){ // 既にあるキーは書き換えないかつ値が存在する拡張キーのみ表示対象にする
        let label = getLabel(key)
        if (label.length > 0) {
          label = label.substr(0, 1).toUpperCase() + label.substr(1)
        }
        ret[key] = label + extValue[key]
      }
    } )
  }

  addPresenceStatus(position, ret) 
  return ret
}

export const getLabel = key => {
  return APP.TXDETAIL.SHOW_LABEL ? i18n.tnl('label.' + key) + ":" : ""
}

/**
 * プレゼンス情報を追加する
 * 
 * @param {*} pos 
 * @param {*} ret 
 */
const addPresenceStatus = (pos, ret) => {
  if (APP.POS.WITH.PRESENCE) {
    ret.presenceStatus = getLabel('presenceStatus') + i18n.tnl('label.' + getPresenceKey(pos))
  }
}

/**
 * プレゼンス・ステータス（キー文字列）を取得する
 * 
 * @param {*} pos 
 */
export const getPresenceKey = (pos) => {
  let presenceKey
  _.some(PRESENCE.STATUS, (value, key) => {
    if (value == pos.presenceStatus) {
      presenceKey = key
      return true
    }
  })
  return Util.nvl(presenceKey, 'PresenceUnknown')
}


