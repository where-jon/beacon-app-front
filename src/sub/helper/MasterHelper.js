import { USER } from '../constant/Constants'
import { APP } from '../../sub/constant/config'
import * as StateHelper from '../helper/StateHelper'

/**
 * マスタ値の仮データを作成する。
 * @method
 * @param {String|Number} prefix 
 * @return {String} 後ろに「現在エポック秒 % 10000」の数値をスネークケースで付与
 */
export const createDefaultName = prefix => prefix + '_' + (new Date().getTime() % 10000)

/**
 * 仮のログインIDを作成する。
 * @method
 * @param {Number[]} ids 
 * @return {String}
 */
export const createDummyLoginId = ids => {
  return `d${ids.join('_')}`
}

/**
 * 仮のユーザを作成する。
 * @method
 * @async
 * @param {String} dummyLoginId 
 * @param {Object[]} roles 
 * @param {Number} noEncrypt 
 * @return {Object}
 */
export const createDummyUser = async (dummyLoginId, roles, noEncrypt = USER.ENCRYPT.ON) => {
  await StateHelper.load('role')
  return {
    userId: -1,
    loginId: dummyLoginId,
    pass: USER.DUMMY.PASS,
    name: null,
    roleId: roles.reduce((a, b) => a.roleId > b.roleId? a: b).roleId,
    email: null,
    noEncrypt: noEncrypt,
  }
}

/**
 * POT拡張項目配列を返す。
 * @method
 * @return {[]}
 */
export const getPotExt = () => {
  return APP.POT.WITH.filter(e => _.some(APP.POT.EXT_DEF, ext => ext.key == e)).map(e => APP.POT.EXT_DEF.find(ext => ext.key == e))
}

/**
 * POT拡張項目のキー配列を返す。
 * @method
 * @return {[]}
 */
export const getPotExtKeys = (addPrefix) => {
  return getPotExt().map(e => (addPrefix? 'extValue.': '') + e.key)
}

