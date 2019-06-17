import * as Util from '../util/Util'
import * as SortUtil from '../util/SortUtil'
import * as AuthHelper from './AuthHelper'

export const autoSwitchRegion = async (regions) => {
  const currentRegionId = Util.getValue(Util.getLogin(), 'currentRegion.regionId', null)
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

export const enableRegionOptions = regions => {
  const login = Util.getLogin()
  if(!login){
    return []
  }
  const ret = login.allRegionMove || login.isProvider || login.tenantAdmin?
    regions.filter(val => val):
    Util.hasValue(login.userRegionIdList)?
      regions.filter(region => login.userRegionIdList.includes(region.regionId)):
      regions.filter(region => login.currentRegion? region.regionId == login.currentRegion.regionId: false)
  return ret.sort((a, b) => SortUtil.sortByString(a.regionName, b.regionName))
}
