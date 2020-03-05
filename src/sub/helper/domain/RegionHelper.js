/**
 * リージョンに関するヘルパーモジュール
 * @module helper/domain/RegionHelper
 */

import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as AuthHelper from '../base/AuthHelper'
import * as LocaleHelper from '../base/LocaleHelper'
import * as LocalStorageHelper from '../base/LocalStorageHelper'

/**
 * 現在のリージョンが存在しない場合、デフォルトのリージョンに切り替える。
 * @method
 * @async
 * @param {Object[]} regions 
 * @return {Boolean} リージョンを切り替えた
 */
export const autoSwitchRegion = async (regions) => {
  const currentRegionId = Util.getValue(LocalStorageHelper.getLogin(), 'currentRegion.regionId')
  if(regions.find(region => region.regionId == currentRegionId)){
    return false
  }
  const nextRegion = enableRegionOptions(regions).find(region => region)
  if(nextRegion != null){
    await AuthHelper.switchRegion(nextRegion.regionId)
    return true
  }
  const firstRegion = regions.find(region => region)
  if(firstRegion != null){
    await AuthHelper.switchRegion(firstRegion.regionId)
    return true
  }
  return false
}

/**
 * 切替可能なリージョンを取得する。
 * @method
 * @param {Object[]} regions 
 * @return {Object[]}
 */
export const enableRegionOptions = regions => {
  const login = LocalStorageHelper.getLogin()
  if(!login){
    return []
  }
  const ret = login.allRegionMove || login.isProviderUser || login.isTenantAdmin? // TODO: 何をしたいのか要コメントor書き直し
    regions.filter(val => val):
    Util.hasValue(login.userRegionIdList)?
      regions.filter(region => login.userRegionIdList.includes(region.regionId)):
      regions.filter(region => login.currentRegion? region.regionId == login.currentRegion.regionId: false)
  return ret.sort((a, b) => StringUtil.sortByString(a.regionCd, b.regionCd, LocaleHelper.getSystemLocale()))
}
