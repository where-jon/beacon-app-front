/**
 * 機能に関するヘルパーモジュール
 * @module helper/domain/FeatureHelper
 */

import { FEATURE } from '../../constant/Constants'
import * as Util from '../../util/Util'
import * as LocalStorageHelper from '../base/LocalStorageHelper'

/**
 * ローカルストレージからテナント機能を取得する。
 * @method
 * @return {Object[]}
 */
export const getTenantFeatureList = () => {
  return LocalStorageHelper.getLogin().currentTenant.tenantFeatureList
}

/**
 * 指定した機能がテナントで使用可能か確認する。
 * @method
 * @param {Object} feature 
 * @return {Bookean}
 */
export const isShowFeature = feature => {
  return feature.featureType == 0 && getTenantFeatureList().find(tenantFeature => tenantFeature.feature.featureId == feature.featureId)
}

/**
 * 指定した機能がシステム専用か確認する。
 * @method
 * @param {Object} feature 
 * @return {Boolean}
 */
export const isSystemFeature = feature => {
  return feature.featureType == 1
}

/**
 * 指定した機能IDを親IDと子IDに分割する。
 * @method
 * @param {Number} featureId 
 * @return {{parentId: Number, subId: Number}}
 */
export const getFeatureIds = featureId => {
  const featureIdStr = String(featureId)
  const featureIdDigit = featureIdStr.length % 2 == 0? 2: 1
  return {
    parentId: featureIdStr.length <= 6? Number(featureIdStr.slice(0, featureIdDigit)): featureId,
    subId: featureIdStr.length <= 6? Number(featureIdStr.substring(featureIdDigit)): 0,
  }
}

/**
 * 指定した機能が、使用可能な親カテゴリに含まれているか確認する。
 * @method
 * @param {Object} feature 
 * @return {Boolean}
 */
export const isShowRelationFeature = feature => {
  if(isShowFeature(feature)){
    return true
  }
  const tenantFeatureList = getTenantFeatureList()
  const featureIds = getFeatureIds(feature.featureId)
  const relation = tenantFeatureList.find(tenantFeature => {
    const tenantFeatureIds = getFeatureIds(tenantFeature.feature.featureId)
    if(tenantFeatureIds.subId == 0){
      return tenantFeatureIds.parentId == featureIds.parentId 
    }
    return false
  })
  return relation? true: false
}

/**
 * 指定した機能リストからテナントで使用可能な機能のみ抽出する。
 * @method
 * @param {Object[]} roleFeatureList 
 * @return {Object[]}
 */
export const getFilterRoleFeatureList = roleFeatureList => {
  const ret = roleFeatureList.filter(roleFeature => {
    if(FEATURE.HIDE_LIST.includes(Util.getValue(roleFeature, 'feature.featureName', ''))){
      return false
    }
    return isSystemFeature(roleFeature.feature) || isShowRelationFeature(roleFeature.feature)
  })
  return ret? ret: []
}

/**
 * 表示用の機能一覧データを作成する。
 * @method
 * @param {Object[]} masterFeatureList 
 * @param {Object[]} currentFeatureList 
 * @param {Boolean} hasId 
 * @param {String[]} defaultCheckFeatureNames 
 * @return {Object[]}
 */
export const createFeatureTable = (masterFeatureList, currentFeatureList, hasId = null, defaultCheckFeatureNames = []) => {
  return masterFeatureList.map(feature => {
    const featureIds = getFeatureIds(feature.featureId)
    const tenantFeature = currentFeatureList.find(val => val.tenantFeaturePK.featureId == feature.featureId)
    const parentFeature = featureIds.subId != 0 && currentFeatureList.find(val => {
      const ids = getFeatureIds(val.tenantFeaturePK.featureId)
      return ids.parentId == featureIds.parentId && ids.subId == 0
    })
    return {
      ...feature,
      parentShow: featureIds.subId == 0,
      parentId: featureIds.parentId,
      subShow: featureIds.subId != 0,
      subId: featureIds.subId,
      checked: hasId == false && defaultCheckFeatureNames.includes(feature.featureName.toLowerCase())? true: tenantFeature? true: false,
      disabled: parentFeature? true: false,
    }
  })
    .sort((a, b) => {
      if(a.featureType != b.featureType){
        return a.featureType < b.featureType? -1: 1
      }
      if(a.parentId != b.parentId){
        return a.parentId < b.parentId? -1: 1
      }
      if(a.subId != b.subId){
        return a.subId < b.subId? -1: 1
      }
      return 0
    })
}
