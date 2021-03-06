/**
 * 一括登録に関するヘルパーモジュール
 * @module helper/dataproc/BulkHelper
 */

import _ from 'lodash'
import { BULK, ROLE_FEATURE, CHAR_SET, CATEGORY } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as CsvUtil from '../../util/CsvUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as CharSetHelper from '../base/CharSetHelper'
import * as OptionHelper from './OptionHelper'

let i18n

/**
 * vue.jsで使用するオブジェクトを設定する。
 * @method
 * @param {Object} pi18n
 */
export const setApp = pi18n => {
  i18n = pi18n
}

/**
 * 主キーに相当する項目に値を格納する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @param {Number} dummyKey 
 * @return {Object} entityと同値
 */
export const setPrimaryKey = (entity, headerName, val, dummyKey) => {
  if(!Util.hasValue(val)){
    entity[headerName] = entity[BULK.PRIMARY_KEY] = dummyKey--
    return entity
  }
  // roleFeature
  if(/^[0-9]+;[0-9]+$/.test(val)){
    entity[headerName] = entity[BULK.PRIMARY_KEY] = val
    return entity
  }
  if(isNaN(val)){
    entity[headerName] = entity[BULK.PRIMARY_KEY] = dummyKey--
    return addInvalid(entity, headerName, val)
  }
  entity[headerName] = entity[BULK.PRIMARY_KEY] = Number(val)
  return entity
}

/**
 * 数値の項目に値を格納する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @param {Boolean} [nullable = false]
 * @return {Object} entityと同値
 */
export const setNumberKey = (entity, headerName, val, nullable = false) => {
  if(!Util.hasValue(val)){
    entity[headerName] = null
    return nullable? entity: addInvalid(entity, headerName, val)
  }
  const num = Number(val)
  entity[headerName] = num
  return !isNaN(num)? entity: addInvalid(entity, headerName, val)
}

/**
 * 真偽値の項目に値を格納する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @param {Boolean} [nullable = false]
 * @return {Object} entityと同値
 */
export const setBooleanKey = (entity, headerName, val, nullable = false) => {
  if(!Util.hasValue(val)){
    return nullable? entity: addInvalid(entity, headerName, val)
  }
  if(['true', 'false'].includes(val.toLowerCase())){
    entity[headerName] = StringUtil.str2boolean(val)
    return entity
  }
  return addInvalid(entity, headerName, val)
}

/**
 * 16進数を示す文字列の項目に値を格納する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @param {Boolean} [nullable = false]
 * @return {Object} entityと同値
 */
export const setHexKey = (entity, headerName, val, nullable = false) => {
  if(!Util.hasValue(val)){
    entity[headerName] = null
    return nullable? entity: addInvalid(entity, headerName, val)
  }
  entity[headerName] = val
  return !isNaN('0x' + val)? entity: addInvalid(entity, headerName, val)
}

/**
 * 文字列の項目に値を格納する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @param {RegExp} regExp
 * @param {Boolean} [nullable = false]
 * @return {Object} entityと同値
 */
export const setStringKey = (entity, headerName, val, regExp = null, nullable = false) => {
  if(!Util.hasValue(val)){
    entity[headerName] = null
    return nullable? entity: addInvalid(entity, headerName, val)
  }
  entity[headerName] = val
  return regExp && !regExp.test(val)? addInvalid(entity, headerName, val): entity
}

/**
 * 不正値を保管する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @return {Object} entityと同値
 */
export const addInvalid = (entity, headerName, val) => {
  entity[headerName + 'Name'] = val
  return entity
}

/**
 * 不正値を取得する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @return {Any}
 */
export const getInvalid = (entity, headerName) => {
  return entity[headerName + 'Name']
}

/**
 * 不正値を削除する。
 * @method
 * @param {Object} entity 
 * @param {String} headerName 
 * @param {String} val 
 * @return {Object} entityと同値
 */
export const removeInvalid = (entity, headerName) => {
  delete entity[headerName + 'Name']
  return entity
}

/**
 * 指定した数値を行数として扱い、「～行目」のメッセージを作成する。
 * @method
 * @param {Number[]} lines 
 * @return {String}
 */
export const formatBulkErrorLine = lines => {
  let errorMessage = i18n.tnl('message.csvLineStart')
  lines.forEach((val, idx) => {
    if(idx != 0){
      errorMessage = errorMessage.concat(',')
    }
    errorMessage = errorMessage.concat(`${i18n.tnl('message.csvLine', {line: val})}`)
  })
  errorMessage = errorMessage.concat(i18n.tnl('message.csvLineEnd'))
  return errorMessage
}

/**
 * csvからオブジェクトに変換する際に発生したエラーメッセージを整形する。
 * @method
 * @param {String[]|Object[]} csvErrors 
 * @return {String}
 */
export const createCsvErrorMessage = csvErrors => {
  if (csvErrors && typeof csvErrors[0] == 'string' && csvErrors[0].startsWith('message.')) {
    return i18n.tnl(csvErrors[0])
  }
  if (csvErrors && typeof csvErrors[0] == 'object' ) {
    const errorLine = csvErrors.filter(val => val.row)
      .map(val => val.row)
      .filter((val, idx, arr) => arr.indexOf(val) === idx)
      .sort((a, b) => a < b? -1: a > b? 1: 0)
    return `${i18n.tnl('message.csvInvalidLine')}${formatBulkErrorLine(errorLine)}`
  }
  return null
}

/**
 * エラーが発生した項目の名称を編集する。
 * @method
 * @param {String} name 
 * @param {String} col 
 * @return {String}
 */
export const getErrorColumnName = (name, col) => {
  if(name == 'tx' && col == 'locationName'){
    return 'locationZoneName'
  }
  if(['areaCd', 'categoryCd', 'groupCd'].includes(col)){
    return 'id'
  }
  if(col == 'categoryName' && /^category.+$/.test(name)){
    return StringUtil.concatCamel(name.replace(/category/, '').toLowerCase(), 'categoryName')
  }
  return col
}

/**
 * 一括登録時のエラーを編集する。複数項目で一意制約を行っている場合などで使用する。
 * @method
 * @param {Object} err 
 * @return {Object}
 */
export const editBulkError = err => {
  if(!Util.hasValue(err.cols) || !Util.hasValue(err.values)){
    return
  }
  if(err.type != 'MultiUnique'){
    return err
  }
  const options = {
    categoryType: CATEGORY.getTypes(),
    locationType: OptionHelper.getLocationTypeOptions(),
  }
  // 場所タイプ選択肢が登録されていない場合は、通常の一意制約エラーに変換
  if(err.cols.some(c => c == 'locationType')){
    const locationTypeVal = err.values[err.cols.findIndex(c => c == 'locationType')]
    if(!Util.hasValue(options.locationType) || !locationTypeVal){
      const newCol = err.cols.find(c => c != 'locationType')
      err.col = newCol
      err.value = err.values[err.cols.findIndex(c => c == newCol)]
      err.type = 'Unique'
      err.cols = null
      err.values = null
      return err
    }
  }
  err.cols.forEach((col, idx) => {
    if(!Object.keys(options).some(key => key == col)){
      return
    }
    const type = options[col].find(t => t.value == err.values[idx])
    err.values[idx] = type? type.text: ''
  })
  return err
}

/**
 * 一括登録時に発生した警告メッセージを整形する。
 * @method
 * @param {Object[]} bulkErrorList
 * @return {String[]}
 */
export const craeteBulkWarnMessage = bulkErrorList => {
  if(!Util.hasValue(bulkErrorList)){
    return []
  }
  const locationTypeList = OptionHelper.getLocationTypeOptions()
  const retList = []
  bulkErrorList.filter(bulkError => ['Unique', 'MultiUnique'].some(u => u == bulkError.type)).forEach(bulkError => {
    // 場所タイプ選択肢が登録されていない場合は、通常の一意制約警告ーに変換
    if(bulkError.cols && bulkError.cols.some(c => c == 'locationType')){
      const locationTypeVal = bulkError.values[bulkError.cols.findIndex(c => c == 'locationType')]
      if(!Util.hasValue(locationTypeList) || !locationTypeVal){
        const newCol = bulkError.cols.find(c => c != 'locationType')
        bulkError.col = newCol
        bulkError.value = bulkError.values[bulkError.cols.findIndex(c => c == newCol)]
        bulkError.type = 'Unique'
        bulkError.cols = null
        bulkError.values = null
      }
    }
    const cols = bulkError.col? [bulkError.col]: bulkError.cols
    if(!retList.some(ret => ret.type == bulkError.type && ret.cols.every(rc => cols.some(c => c == rc)))){
      retList.push({type: bulkError.type, cols: cols})
    }
  })
  return retList.map(ret => {
    const col = ret.cols.map(c => i18n.tnl('label.' + c)).join(i18n.tnl('message.readingPoint'))
    return i18n.tnl('message.bulk' + ret.type + 'Warn', {col: col})
  })
}

/**
 * 一括登録時に発生したエラーメッセージを整形する。
 * @method
 * @param {Error} e
 * @param {String} name
 * @param {Boolean} showLine 「XX行目」文言を表記する
 * @return {String|String[]}
 */
export const getBulkErrorMessage = (e, name, showLine) => {
  if(e.bulkError) {
    const readingPoint = i18n.tnl(`message.readingPoint`)
    const warnMessageList = craeteBulkWarnMessage(e.bulkError)
    const errorMessageList = _.map(_.orderBy(e.bulkError, ['line'], ['asc']), err => {
      if (err.type == 'SameKeyLine') {
        return `${i18n.tnl('message.csvInvalidLine')}${formatBulkErrorLine(err.values)}`
      }
      if (err.type == 'InsufficientColumns') {
        return `${i18n.tnl('message.csvInsufficientColumnsLine')}${formatBulkErrorLine(err.values)}`
      }

      editBulkError(err)
      const cols = err.cols? err.cols: [err.col]
      const value = err.values? err.values.join(readingPoint) : err.value

      return i18n.tline('message.bulk' + err.type + 'Failed', {
        line: err.line,
        col: cols.map(c => i18n.tnl(`label.${getErrorColumnName(name, c.trim())}`)).join(readingPoint),
        value: StringUtil.sanitize(value, true),
        min: err.min,
        max: err.max,
        candidates: err.candidates,
        num: err.num,
        unit: err.unit? i18n.tnl(`label.${err.unit}Unit`): '',
        target: err.target? i18n.tnl(`label.${err.target}`): ''
      }, showLine)
    }).filter((val, idx, arr) => arr.indexOf(val) == idx)
    return warnMessageList.concat(errorMessageList)
  }
  return i18n.terror('message.bulkRegisterFailed', {target: i18n.tnl('label.' + name), code: e.message})
}

/**
 * 主キーに相当するヘッダ名称が存在するか確認する。
 * @method
 * @param {String[]} header csvデータのヘッダ名称配列
 * @throws {Exception} エラーメッセージ
 */
export const csvHeaderCheck = header => {
  if (!header.includes(BULK.PRIMARY_KEY)) {
    throw Error(i18n.tnl('message.csvHeaderRequired'))
  }
}

/**
 * 主キーが存在するか確認する。
 * @method
 * @param {String} masterName
 * @param {String[]} headers
 * @throws {Exception} エラーメッセージ
 */
export const entityKeyCheck = (masterName, pMasterName, headers) => {
  if (pMasterName && Util.getValue(BULK.REQUIRE, StringUtil.camel2snake(pMasterName).toUpperCase() + '.ALLOW')) {
    masterName = pMasterName
  }
  let requireNames = StringUtil.camel2snake(masterName).toUpperCase()
  
  const arrowHeaders = Util.getValue(BULK.REQUIRE, requireNames + '.ALLOW', [])
  if(!arrowHeaders.every(allowName => headers.includes(allowName))) {
    throw Error(i18n.tnl('message.invalidFile'))
  }
  const disArrowHeaders = Util.getValue(BULK.REQUIRE, requireNames + '.DISALLOW', [])
  if(disArrowHeaders.some(disAllowName => headers.includes(disAllowName))) {
    throw Error(i18n.tnl('message.invalidFile'))
  }
}

/**
 * 文字セットが正しいか確認する。
 * @method
 * @param {String} csvString 
 * @param {String} bulkCharset 
 * @throws {Exception} エラーメッセージ
 */
export const csvCharsetCheck = (csvString, bulkCharset) => {
  const charSetResult = StringUtil.analyseEncode(csvString, bulkCharset)
  if(charSetResult.match){
    return
  }
  const charset = CHAR_SET.find(val => val.name == charSetResult.charset)
  throw new Error(
    i18n.tnl('message.csvNotMatchCharset') + (
      charset? i18n.tnl('message.csvForMatchCharset', {charset: i18n.tnl('label.' + charset.name)}): ''
    )
  )
}

/**
 * 一括登録用のcsvオブジェクトを作成する
 * @method
 * @param {String} loginId 
 * @param {ArrayBuffer} arrayBuffer 
 * @return {Object}
 * @throws {Exception} エラーメッセージ
 */
export const convertBulkCsvObj = (loginId, arrayBuffer) => {
  try{
    const bulkCharset = CharSetHelper.detectBulkCharSet(loginId)
    return CsvUtil.csv2Obj(arrayBuffer, bulkCharset)
  }
  catch(e){
    throw e
  }
}

/**
 * csvデータからエンティティを作成する。
 * @method
 * @param {String} masterIdName 
 * @param {String[]} headers 
 * @param {Any[]} line 一行分のcsvデータ
 * @param {Number} dummyKey 
 * @param {Object} entity 作成されたエンティティ
 * @param {{numberList: String[], booleanList: String[], hexList: String[], 'nullableList': String[]}} [option = {}] 
 * @return {Number} 次回のdummyKey
 */
export const setCsvParam = (masterIdName, headers, line, dummyKey, entity, option = {}) => {
  line.forEach((val, idx) => {
    const headerName = headers[idx]
    if (!headerName) {
      return
    }

    if (headerName == BULK.PRIMARY_KEY){
      setPrimaryKey(entity, masterIdName, val, dummyKey--)
      return
    }
    const nullable = Util.getValue(option, 'nullableList', []).find(nullableData => nullableData == headerName)? true: false
    if(ArrayUtil.equalsAny(headerName, Util.getValue(option, 'numberList', []))){
      setNumberKey(entity, headerName, val, nullable)
      return
    }
    if(ArrayUtil.equalsAny(headerName, Util.getValue(option, 'hexList', []))){
      setHexKey(entity, headerName, val, nullable)
      return
    }
    if(ArrayUtil.equalsAny(headerName, Util.getValue(option, 'booleanList', []))){
      setBooleanKey(entity, headerName, val, nullable)
      return
    }
    entity[headerName] = val
  })
  return dummyKey
}

/**
 * csvデータからエンティティリストを作成する。
 * @method
 * @param {Object} vueComponent 
 * @param {String} masterIdName 
 * @param {Object} readerParam 
 * @param {Object[]} csvLineList 
 * @param {Object} option 
 * @return {Object} readerParamと同値
 * @throws {Exception} エラーメッセージ
 */
export const setCsvParamList = (vueComponent, masterIdName, readerParam, csvLineList, option = {}) => {
  let header
  let dummyKey = -1
  try{
    csvLineList.forEach((csvLine, lineIdx) => {
      if (lineIdx == 0) {
        header = csvLine
        csvHeaderCheck(header)
        readerParam.headers = header
        return
      }
      const entity = {}
      dummyKey = setCsvParam(masterIdName, header, csvLine, dummyKey, entity, option)
      if(vueComponent.$parent.$options.methods && vueComponent.$parent.$options.methods.onRestruct) {
        dummyKey = vueComponent.$parent.$options.methods.onRestruct.call(vueComponent.$parent, entity, dummyKey)
      }
      sameDataCheck(readerParam.sameLine, lineIdx, readerParam.entities, entity)
      readerParam.entities.push(entity)
    })
    return readerParam
  }
  catch(e){
    throw e
  }
}

/**
 * 重複データが存在するか確認する
 * @method
 * @param {Number[]} sameLine 重複行の管理配列
 * @param {Number} lineIdx 何行目
 * @param {Object[]} entities 
 * @param {Object} entity 
 */
export const sameDataCheck = (sameLine, lineIdx, entities, entity) => {
  if(entities.find(val => val[BULK.PRIMARY_KEY] == entity[BULK.PRIMARY_KEY])){
    sameLine.push(lineIdx)
  }
}

/**
 * 一括登録用の文字セット設定を取得する。
 * @method
 * @param {String} loginId 
 * @return {String}
 */
export const getInitCharSets = loginId => {
  const initSelect = CharSetHelper.detectBulkCharSet(loginId)
  const selected = CHAR_SET.find(item => item.name === initSelect)
  return selected != null ? selected.id : CHAR_SET[0].id
}

/**
 * 機能モードのテキストからフラグ値を算出する
 * @method
 * @param {String} pModeText 
 * @return {Number}
 */
export const getModeValue = pModeText => {
  if(!Util.hasValue(pModeText)){
    return ROLE_FEATURE.MODE.DENY
  }
  const modeOptions = ROLE_FEATURE.getModeOptions()
  const modeTexts = pModeText.split(',')
  let modeValue = 0
  modeTexts.forEach(modeText => {
    const all = ROLE_FEATURE.getAllAuthorizationOption()
    if(all.text == modeText.trim()){
      modeOptions.forEach(modeOption => modeValue = modeValue | modeOption.value)
      return modeValue
    }
    const mode = modeOptions.find(modeOption => modeOption.text == modeText.trim())
    modeValue = modeValue | (mode? mode.value: 0)
  })
  return modeValue
}

/**
 * 一括登録エンティティ（センサ情報）を作成する
 * @method
 * @param {String} masterType 'tx' or 'exb'
 * @param {String[]} sensorNames 
 * @param {Number} dummyKey 
 * @return {{sensorList: Object[], dummyKey: Number}}
 */
export const createParamSensor = (masterType, sensorNames, dummyKey) => {
  const sensorNameList = sensorNames.split(';').map(val => val.trim())
  const sensorList = []
  sensorNameList.forEach(sensorName => {
    const sensor = OptionHelper.getSensorOptions(masterType).find(option => option.text == sensorName)
    if(sensor && sensor.value != null){
      sensorList.push({[masterType + 'SensorPK']: {sensorId: sensor.value}, sensorName: sensorName})
    }
    else if(!sensor){
      sensorList.push({[masterType + 'SensorPK']: {sensorId: dummyKey--}, sensorName: sensorName})
    }
  })
  return { sensorList: sensorList, dummyKey: dummyKey }
}

/**
 * 一括登録エンティティ（位置情報）を作成する。
 * @method
 * @param {Object} entity
 * @param {Number} dummyKey 
 * @return {{location: Object, dummyKey: Number}}
 */
export const createParamLocation = (entity, dummyKey) => {
  const ret = {}
  Util.setValue(ret, 'locationId', dummyKey--)
  Util.setValue(ret, 'locationCd', entity.locationCd)
  Util.setValue(ret, 'areaName', entity.areaName)
  Util.setValue(ret, 'locationName', entity.locationName)
  Util.setValue(ret, 'txViewType', entity.txViewType)
  Util.setValue(ret, 'x', entity.x)
  Util.setValue(ret, 'locXName', entity.xName)
  Util.setValue(ret, 'y', entity.y)
  Util.setValue(ret, 'locYName', entity.yName)

  if(Util.hasValue(entity.zoneName)){
    Util.setValue(ret, 'locationZoneList', [{
      locationZonePK: { locationId: dummyKey--, zoneId: dummyKey-- },
      zone: { zoneId: dummyKey--, zoneName: entity.zoneName, areaId: dummyKey-- },
    }])
  }
  return { location: ret, dummyKey: dummyKey }
}
