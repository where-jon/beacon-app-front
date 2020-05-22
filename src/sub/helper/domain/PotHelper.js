/**
 * POTに関するヘルパーモジュール
 * @module helper/domain/PotHelper
 */

import { APP } from '../../constant/config'
import * as Util from '../../util/Util'

/**
 * POT設定カテゴリを返す。
 * @method
 * @param {String} potTypeName
 * @return {String}
 */
export const getSettingName = potTypeName => (potTypeName? potTypeName: 'pot').toUpperCase()

/**
 * 適用するPOT設定を返す。
 * @method
 * @param {String} potTypeName
 * @return {Object}
 */
export const getSetting = potTypeName => APP[getSettingName(potTypeName)]

/**
 * POT拡張項目配列を返す。
 * @method
 * @param {String} potTypeName
 * @return {String[]}
 */
export const getPotExt = potTypeName => {
  const settings = getSetting(potTypeName)
  return settings.WITH.filter(e => _.some(settings.EXT_DEF, ext => ext.key == e)).map(e => settings.EXT_DEF.find(ext => ext.key == e))
}

/**
 * POT拡張項目のキー配列を返す。
 * @method
 * @param {String} potTypeName
 * @param {String} addPrefix
 * @return {String[]}
 */
export const getPotExtKeys = (potTypeName, addPrefix) => {
  return getPotExt(potTypeName).map(e => (addPrefix? 'extValue.': '') + e.key)
}

/**
 * POTで使用する値・拡張値についてb-listにわたすオブジェクト配列を作成する
 * 
 * @method
 * @param {String} potTypeName
 * @param {Boolean} isCsv 
 * @return {String[]}
 */
export const createCustomColumn = (potTypeName, isCsv) => {
  const settings = getSetting(potTypeName)
  return settings.WITH.filter(val => val != 'thumbnail').map(val => {
    if (val == 'potType') {
      if (APP.AUTH.USE_AD) {
        return null
      }  
    }
    if('user' == val){
      return {key:'loginId'}
    }
    const ext = _.find(settings.EXT_DEF, e => e.key == val)
    if (ext && !ext.showlist && !isCsv) {
      return null
    }
    if ((ext || val == 'ruby') && isCsv) {
      return {key: val}
    }
    const ret = {key: val, label: val, tdClass: 'thumb-rowdata'}
    // extValue.rubyなど.を含むとソートできないため.は抜きにする
    if (val == 'ruby'){
      ret.sortable = true
    }
    else if (ext) {
      ret.sortable = ext.sort
    }
    else {
      ret.sortable = true
    }
    if(['category', 'group'].includes(val)){
      ret.key = val + 'Name'
    }
    return ret
  }).filter(val => val)
}

/**
 * サムネイルのURLを取得する
 * 
 * @param {*} tx 
 * @param {*} thumbnailUrl 
 */
export const getThumbnailUrl = (tx, thumbnailUrl) => {
  const pot = Util.v(tx, 'pot')
  if (pot && pot.existThumbnail) {
    return thumbnailUrl.replace('{id}', pot.potId) + pot.thumbnailUpdateDt
  }  
  return '/default.png'
}

export const createEntity = (form, minors = [], potTypeOptions = [], groups = [], categories = []) => {
  const entity = {}
  Object.keys(form).forEach(key => {
    entity[key] = form[key]
  })

  entity.updateKey = form.potId || null
  entity.ID = form.potCd
  entity.potType = potTypeOptions.filter(e => e.value == form.potType).map(e => e.text)

  if (form['groupId']) {
    entity.groupCd = form.groupId ? groups.filter(e => e.groupId == form.groupId).map(e => e.groupCd).join(";") : null
  }

  /*
  if (form['categoryId']) {
    entity.categoryCd = form.categoryId ? categories.filter(e => e.categoryId == form.categoryId).map(e => e.categoryCd).join(";") : null
  }
  */

  /*
  if (form['authCategoryIdList']) {
    if(Util.hasValue(form.authCategoryIdList)){
      const list = categories.filter(e => form.authCategoryIdList.includes(e.categoryId)).map(e => e.categoryCd)
      entity.auth = list.length > 0 ? list.join(";") : null
    }
  }
  */

  /*
  if (minors.length > 0) {
    entity.minor = minors.length > 0 ? minors.join(';') : null
  }
  */

  /*
  ['btxId', 'potUserList', 'potCategoryList', 'potTxList', 'potGroupList', 'attendanceList'].forEach(prop => {
    if (form[prop]) {
      entity[prop] = null
    }
  })
  */
  
  return entity
}