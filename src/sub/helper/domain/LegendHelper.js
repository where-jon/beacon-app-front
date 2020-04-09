/* eslint-disable require-atomic-updates */
/**
 * 凡例に関するヘルパーモジュール
 * @module helper/domain/LegendHelper
 */

import _ from 'lodash'
import { DISP } from '../../constant/config'
import { SHAPE, CATEGORY } from '../../constant/Constants'
import * as StyleHelper from '../ui/StyleHelper'
import * as SensorHelper from './SensorHelper'

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
 * カテゴリの汎用を表示するための情報を取得する。
 * @method
 * @param {Object[]} categoryList
 * @return {Object[]}
 */
export const getCategoryLegendElements = categoryList => categoryList.filter(category => !category.systemUse && category.categoryType != CATEGORY.AUTH).map(val => ({ id: val.categoryId, name: val.categoryName, ...val,}))

/**
 * グループの汎用を表示するための情報を取得する。
 * @method
 * @param {Object[]} groupList
 * @return {Object[]}
 */
export const getGroupLegendElements = groupList => groupList.map(val => ({id: val.groupId, name: val.groupName, ...val, }))

/**
 * 凡例データを作成する。TODO:これはセンサの処理ではない
 * @method
 * @param {Object[]} txList
 * @param {Object[]} categoryList
 * @param {IObject[]} groupList
 * @return {Object[]}
 */
export const createTxLegends = (txList, categoryList, groupList) => {
  const txs = txList.filter(tx => tx.disp)
  const loadCategory = DISP.TX.DISPLAY_PRIORITY == 'category'
  const magnetCategoryTypes = loadCategory? SensorHelper.getMagnetCategoryTypes(txs): SensorHelper.getMagnetGroupTypes(txs)
  const legendElements = loadCategory? getCategoryLegendElements(categoryList): getGroupLegendElements(groupList)

  const ret = legendElements.map(legendElement => ({
    id: legendElement.id,
    items: magnetCategoryTypes.includes(legendElement.id)? [
      { id: 1, text: 'A', style: StyleHelper.getStyleDisplay1(legendElement) },
      { id: 2, text: `${legendElement.name} : ${i18n.tnl('label.using')}`, style: null },
      { id: 3, text: 'A', style: StyleHelper.getStyleDisplay1(legendElement, {reverceColor: true, fixSize: true}) },
      { id: 4, text: `${i18n.tnl('label.notUse')}`, style: {} },
    ]: [
      { id: 1, text: 'A', style: StyleHelper.getStyleDisplay1(legendElement) },
      { id: 2, text: legendElement.name, style: {} },
    ]
  }))
  // グループ、カテゴリに全てのTXが紐付いている場合は、デフォルトを非表示
  if(!hasAllTxDisplayInfo(txs)){
    const defaultStyle = { shape: SHAPE.CIRCLE, bgColor: DISP.TX.BGCOLOR, color: DISP.TX.COLOR }
    ret.push({
      id: 0,
      items: [
        { id: 5, text: 'A', style: StyleHelper.getStyleDisplay1(defaultStyle) },
        { id: 6, text: i18n.tnl('label.defaultOther'), style: {} },
      ]
    })
  }
  return ret
}

/** 全てのTxが優先設定の表示情報に紐付いているか確認する TODO:これはセンサの処理ではない
 * @method
 * @param {Object[]} txList
 * @return {Boolean}
 */
export const hasAllTxDisplayInfo = txList =>{
  var displayInfo = null
  if (DISP.TX.DISPLAY_PRIORITY == 'category'){
    displayInfo = txList.filter(val => val.pot && val.pot.category )
  }else {
    displayInfo = txList.filter(val => val.pot && val.pot.group )
  }
  return txList.length == displayInfo.length
}
