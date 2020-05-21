/* eslint-disable require-atomic-updates */
/**
 * センサに関するヘルパーモジュール
 * @module helper/domain/SensorHelper
 */

import Chart from 'chart.js'
import _ from 'lodash'
import * as mock from '../../../assets/mock/mock'
import { APP, DISP, DEV } from '../../constant/config'
import { DISCOMFORT, SENSOR, THERMOHUMIDITY, SHAPE } from '../../constant/Constants'
import * as ArrayUtil from '../../util/ArrayUtil'
import * as DateUtil from '../../util/DateUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as Util from '../../util/Util'
import * as AppServiceHelper from '../dataproc/AppServiceHelper'
import * as ChartHelper from '../ui/ChartHelper'
import * as ConfigHelper from '../dataproc/ConfigHelper'
import * as EXCloudHelper from '../dataproc/EXCloudHelper'
import * as StateHelper from '../dataproc/StateHelper'
import * as HeatmapHelper from '../ui/HeatmapHelper'
import * as StyleHelper from '../ui/StyleHelper'
import * as PositionHelper from './PositionHelper'
import { addLabelByKey } from '../ui/ViewHelper'

let chart = null
let subChart = null

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

/**
 * プロットされたデータのうち、最大値を取得する。
 * @method
 * @param {Object} chartData
 * @param {String} column プロパティ名
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Number} cut 累乗の指数値
 * @return {Number}
 */
export const calcChartMax = (chartData, column, by, cut) => {
  const collect = chartData.map(val => {
    if(!val){
      return 0
    }
    if(by == 'day'){
      return val.max? val.max[column]: val.data? val.data[column]: 0
    }
    return val.data? val.data[column]: 0
  })
  const cutUnit = Math.pow(10, cut)
  return Math.ceil(Math.max(...collect) / cutUnit) * cutUnit
}

/**
 * 設定値から温度アイコンのパターン情報を作成する。
 * @method
 * @return {Object[]}
 */
export const getThermoPatternConfig = () => {
  if(Util.hasValue(DISP.THERMOH.PATTERN)){
    return DISP.THERMOH.PATTERN.map(pattern => {
      const patternRet = {}
      pattern.split(' ').forEach(val => {
        const topChar = val.slice(0, 1)
        if(topChar == '#'){
          patternRet.color = val
        }
        else if(!isNaN(Number(topChar))){
          patternRet.base = Number(val)
        }
        else if(topChar == '$'){
          patternRet.flash = DISP.THERMOH.FLASH[val.slice(1)]
        }
        else if(val.toLowerCase() == 'or'){
          patternRet.or = true
        }
      })
      if(!patternRet.color){
        patternRet.color = '#000000'
      }
      return patternRet
    }).sort((a, b) => a.base == null? 1: b.base == null? -1: a.base - b.base)
  }
  return []
}

/**
 * 指定した温湿度からアイコンパターン情報を取得する。
 * @method
 * @param {Object[]} thermohumidityIconConfig
 * @param {Number} temperature
 * @param {Number} humidity
 * @return {Object}
 */
export const getThermohumidityIconInfo = (thermohumidityIconConfig, temperature, humidity) => {
  const point = DISP.THERMOH.CALC == THERMOHUMIDITY.CALC.TEMPERATURE? temperature: calcDiscomfortIndex(temperature, humidity)
  return thermohumidityIconConfig.find((conf, idx) => {
    if(thermohumidityIconConfig.length <= idx + 1){
      return true
    }
    if(conf.base == null){
      return false
    }
    return conf.or? point <= conf.base: point < conf.base
  })
}

/**
 * 設定値から湿度の警告情報テンプレートを作成する。
 * @method
 * @return {{less: Object[], more: Object[]}|Any[]}
 */
export const getHumidityPatternConfig = () => {
  if(Util.hasValue(DISP.THERMOH.HUMIDITY_PATTERN)){
    const ret = {less: [], more: []}
    DISP.THERMOH.HUMIDITY_PATTERN.map(pattern => {
      const patternRet = {}
      pattern.split(' ').forEach(val => {
        const v = val.toLowerCase()
        if(['more', 'less'].includes(v)){
          patternRet.label = v
        }
        else if(!isNaN(Number(v))){
          patternRet.base = Number(v)
        }
      })
      return patternRet
    }).forEach(pattern => {
      if(pattern.label == 'less'){
        ret.less.push(pattern)
      }
      if(pattern.label == 'more'){
        ret.more.push(pattern)
      }
    })
    ret.less.sort((a, b) => a.base == null? 1: b.base == null? -1: a.base - b.base)
    ret.more.sort((a, b) => a.base == null? 1: b.base == null? -1: b.base - a.base)
    return ret
  }
  return []
}

/**
 * 指定した湿度の警告情報を取得する。
 * @method
 * @param {Object} humidityPatternConfig
 * @param {Number} humidity
 * @return {Object}
 */
export const getHumidityInfo = (humidityPatternConfig, humidity) => {
  const less = humidityPatternConfig.less.find(conf => {
    if(conf.base == null){
      return false
    }
    return humidity <= conf.base
  })
  if(less){
    return less
  }
  return humidityPatternConfig.more.find(conf => {
    if(conf.base == null){
      return false
    }
    return humidity >= conf.base
  })
}

/**
 * 不快指数に応じたカラーコードを取得する。
 * @method
 * @param {Number} temperature
 * @param {Number} humidity
 * @return {String}
 */
export const getDiscomfortColor = (temperature, humidity) => {
  let discomfort = getDiscomfort(temperature, humidity)
  switch (discomfort) {
  case DISCOMFORT.COLD:
    return DISP.THERMOH.DISCOMFORT_COLD
  case DISCOMFORT.COMFORT:
    return DISP.THERMOH.DISCOMFORT_COMFORT
  case DISCOMFORT.HOT:
    return DISP.THERMOH.DISCOMFORT_HOT
  }
}

/**
 * 有効なセンサIDを全て取得する。
 * @method
 * @return {Number[]}
 */
export const availableSensorAll = () =>  _([...APP.EXB.SENSOR, ...APP.SENSOR.TX_SENSOR]).sort().uniqWith(_.isEqual).value()

/**
 * 有効なセンサグラフIDを全て取得する。
 * @method
 * @return {Number[]}
 */
export const availableSensorGraph = () =>  _(APP.SENSORGRAPH.SENSOR).sort().value()


/**
 * 有効なセンサが1つしかないか確認する。1つしかない場合は、そのIDを取得する。
 * @method
 * @return {Boolean|Number}
 */
export const onlyOne = () => availableSensorAll().length == 1 && availableSensorAll()[0]

/**
 * TXが固定位置に置かれるセンサーを持っているかを返す
 * 
 * @param {*} pos 
 */
export const isFixedSensorTx = (tx) => !!Util.v(tx, 'sensorList', []).find(sensor => ![SENSOR.BUTTON, SENSOR.MEDITAG].includes(sensor.sensorId))

/**
 * 不快指数の状態を示す文字列を取得する。
 * @method
 * @param {Number} temperature
 * @param {Number} humidity
 * @return {String}
 */
export const getDiscomfort = (temperature, humidity) => {
  let di = calcDiscomfortIndex(temperature, humidity)
  if (di <= 60) {
    return DISCOMFORT.COLD
  }
  else if (di < 75) {
    return DISCOMFORT.COMFORT
  }
  else {
    return DISCOMFORT.HOT
  }
}

/**
 * 不快指数を算出する。
 * @method
 * @param {Number} temperature
 * @param {Number} humidity
 * @return {Number}
 */
export const calcDiscomfortIndex = (temperature, humidity) => 0.81 * temperature + 0.01 * humidity * (0.99 * temperature - 14.3) + 46.3

/**
 * チャートグラフのデータ部分を作成する。
 * @method
 * @param {String} yAxisID 縦軸に表示する項目。createChartGraphOptions()で設定したID
 * @param {String} label 縦軸に表示する項目の名称
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} targetId センサ情報から値を取得するプロパティ名
 * @param {String} borderColor 線の色
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @return {Object[]}
 */
export const createChartGraphDatasets = (yAxisID, label, chartData, targetId, borderColor, by) => {
  const immediate = chartData.find(val => val.immediate)? true: false
  const average = chartData.find(val => val.average)? true: false
  const max = chartData.find(val => val.max)? true: false
  const min = chartData.find(val => val.min)? true: false
  return [
    immediate? {
      label: label, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map(val => val.immediate? val.immediate[targetId]: null),
      fill: false, borderColor: borderColor
    }: null,
    average? {
      label: label, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map(val => val.average? val.average[targetId]: null),
      fill: false, borderColor: borderColor
    }: null,
    max? {
      label: `${label}${by == 'day'? i18n.tnl('label.max'): ''}`, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map(val => val.max? val.max[targetId]: null),
      fill: false, borderDash: by == 'day'? [5, 5]: [5, 0], borderColor: borderColor
    }: null,
    min? {
      label: `${label}${by == 'day'? i18n.tnl('label.min'): ''}`, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map(val => val.min? val.min[targetId]: null),
      fill: false, borderDash: by == 'day'? [5, 5]: [5, 0], borderColor: borderColor
    }: null,
  ].filter(val => val)
}

/**
 * チャートグラフの設定を作成する。
 * @method
 * @param {{id: String, label: String, ticks: Object}} scales グラフ表示する項目。詳細はchart.js参照
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object}
 */
export const createChartGraphOptions = (scales, isResponsive = false) => {
  return ChartHelper.createChartGraphOptions(scales, isResponsive)
}

/**
 * 温湿度用チャートグラフの描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartThermohumidityOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('temperature', i18n.tnl('label.temperature'), chartData, 'temperature', DISP.TEMPERATURE_LINE_COLOR, by)
          .concat(createChartGraphDatasets('humidity', i18n.tnl('label.humidity'), chartData, 'humidity', DISP.HUMIDITY_LINE_COLOR, by))
    },
    options: createChartGraphOptions([
      {
        id: 'temperature',
        label: i18n.tnl('label.temperature') + ' (℃)',
        ticks: { min: 0, max: 40 },
        position: 'left'
      }, {
        id: 'humidity',
        label: i18n.tnl('label.humidity') + ' (%)',
        ticks: { min: 0, max: 100, stepSize: 25},
        position: 'right'
      }],
    isResponsive
    )
  }
}

export const createChartOmrEnvOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map(val => val.key),
      datasets: 
        createChartGraphDatasets('temperature', i18n.tnl('label.temperature'), chartData, 'temperature', DISP.TEMPERATURE_LINE_COLOR, by)
          .concat(createChartGraphDatasets('humidity', i18n.tnl('label.humidity'), chartData, 'humidity', DISP.HUMIDITY_LINE_COLOR, by))
          .concat(createChartGraphDatasets('ambientLight', i18n.tnl('label.ambientLight'), chartData, 'ambientLight', DISP.AMBIENT_LIGHT_COLOR, by))
          .concat(createChartGraphDatasets('soundNoise', i18n.tnl('label.soundNoise'), chartData, 'soundNoise', DISP.SOUND_NOISE_COLOR, by))
    },
    options: createChartGraphOptions([
      {
        id: 'temperature',
        label: i18n.tnl('label.temperature') + ' (℃)',
        ticks: { min: 0, max: 40 },
        position: 'left'
      }, 
      {
        id: 'humidity',
        label: i18n.tnl('label.humidity') + ' (%)',
        ticks: { min: 0, max: 100, stepSize: 25},
        position: 'right'
      },
      {
        id: 'ambientLight',
        label: i18n.tnl('label.ambientLight'),
        ticks: { min: 0, max: 1000, stepSize: 200},
        position: 'left'
      },
      {
        id: 'soundNoise',
        label: i18n.tnl('label.soundNoise'),
        ticks: { min: 0, max: 100, stepSize: 25},
        position: 'right'
      }
    ],
    isResponsive
    )
  }
}

/**
 * 人感センサ用チャートグラフの描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartPirOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('pir', i18n.tnl('label.pir'), chartData, 'count', DISP.PIR_LINE_COLOR, by)
    },
    options: createChartGraphOptions([
      {
        id: 'pir',
        label: i18n.tnl('label.detectedCount'),
        ticks: {
          min: 0,
          max: calcChartMax(chartData, 'count', by, 2)
        },
        position: 'left'
      }],
    null,
    isResponsive
    )
  }
}

/**
 * サーモパイル用チャートグラフの描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartThermopileOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('thermopile', i18n.tnl('label.thermopile'), chartData, 'count', DISP.THERMOPILE_LINE_COLOR, by)
    },
    options: createChartGraphOptions([
      {
        id: 'thermopile',
        label: i18n.tnl('label.detectedCount'),
        ticks: {
          min: 0,
          max: calcChartMax(chartData, 'count', by, 2)
        },
        position: 'left'
      }],
    null,
    isResponsive
    )
  }
}

/**
 * マグネットセンサ用チャートグラフの描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartMagnetOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('magnet', i18n.tnl('label.magnet'), chartData, 'magnet', DISP.MAGNET_LINE_COLOR, by)
    },
    options: createChartGraphOptions([
      {
        id: 'magnet',
        label: '',
        ticks: {
          min: SENSOR.MAGNET_STATUS.OFF,
          max: SENSOR.MAGNET_STATUS.ON,
          callback: function(value, index, values){
            return value == SENSOR.MAGNET_STATUS.ON? i18n.tnl('label.inUse'): value == SENSOR.MAGNET_STATUS.OFF? i18n.tnl('label.notUse'): ''
          }
        },
        position: 'left'
      }],
    null,
    isResponsive
    )
  }
}

/**
 * 圧力センサ用チャートグラフの描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartPressureOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('pressure', i18n.tnl('label.pressure'), chartData, 'pressVol', DISP.PRESSURE_LINE_COLOR, by)
    },
    options: createChartGraphOptions([
      {
        id: 'pressure',
        label: i18n.tnl('label.pressVol'),
        ticks: {
          min: 0,
          max: calcChartMax(chartData, 'pressVol', by, 2)
        },
        position: 'left'
      }],
    null,
    isResponsive
    )
  }
}

/**
 * MEDiTAG用チャートグラフ（一枚目）の描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartMeditagOptions = (chartData, by, isResponsive = false) => {
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('blood_pressure', i18n.tnl('label.h_blood_pressure'), chartData, 'high', DISP.H_BLOOD_PRESSURE_LINE_COLOR, by)
          .concat(createChartGraphDatasets('blood_pressure', i18n.tnl('label.l_blood_pressure'), chartData, 'low', DISP.L_BLOOD_PRESSURE_LINE_COLOR, by))
          .concat(createChartGraphDatasets('heart_rate', i18n.tnl('label.heart_rate'), chartData, 'beat', DISP.HEART_RATE_LINE_COLOR, by))
    },
    options: createChartGraphOptions([
      {
        id: 'blood_pressure',
        label: i18n.tnl('label.blood_pressure'),
        ticks: { min: 0, max: DISP.BLOOD_PRESSURE_MAX, stepSize: DISP.BLOOD_PRESSURE_STEP },
        position: 'left'
      }, {
        id: 'heart_rate',
        label: i18n.tnl('label.heart_rate'),
        ticks: { min: 0, max: DISP.HEART_RATE_MAX, stepSize: DISP.HEART_RATE_STEP },
        position: 'right'
      }],
    isResponsive
    )
  }
}

/**
 * MEDiTAG用チャートグラフ（二枚目）の描画情報を作成する。
 * @method
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの描画情報
 */
export const createChartSubMeditagOptions = (chartData, by, isResponsive = false) => {
  const stepMax = calcChartMax(chartData, 'step', by, 2)
  const downMax = calcChartMax(chartData, 'down', by, 2)
  return {
    type:'line',
    data:{
      labels: chartData.map(val => val.key),
      datasets:
        createChartGraphDatasets('step', i18n.tnl('label.step'), chartData, 'step', DISP.STEP_LINE_COLOR, by)
          .concat(createChartGraphDatasets('down_count', i18n.tnl('label.down_count'), chartData, 'down', DISP.DOWN_COUNT_LINE_COLOR, by))
    },
    options: createChartGraphOptions([
      {
        id: 'step',
        label: i18n.tnl('label.step'),
        ticks: { min: 0, max: stepMax },
        position: 'left'
      }, {
        id: 'down_count',
        label: i18n.tnl('label.down_count'),
        ticks: { min: 0, max: downMax },
        position: 'right'
      }],
    isResponsive
    )
  }
}

/**
 * 指定したcanvas要素にチャートグラフを描画する。
 * @method
 * @param {String} canvasId canvas要素のid
 * @param {Number} sensorId
 * @param {Object[]} chartData createChartData()で作成したデータ
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @param {Boolean} [isResponsive = false] モバイル用
 * @return {Object} チャートグラフの情報
 */
export const createChartGraph = (canvasId, sensorId, chartData, by, isResponsive = false) => {
  if(chart){
    chart.destroy()
  }
  if(subChart){
    subChart.destroy()
  }
  chart = new Chart(canvasId, // TODO: switchを使う
    sensorId == SENSOR.PIR? createChartPirOptions(chartData, by, isResponsive):
      sensorId == SENSOR.THERMOPILE? createChartThermopileOptions(chartData, by, isResponsive):
        sensorId == SENSOR.MAGNET? createChartMagnetOptions(chartData, by, isResponsive):
          sensorId == SENSOR.MEDITAG? createChartMeditagOptions(chartData, by, isResponsive):
            sensorId == SENSOR.PRESSURE? createChartPressureOptions(chartData, by, isResponsive):
              sensorId == SENSOR.OMR_ENV? createChartOmrEnvOptions(chartData, by, isResponsive):
                createChartThermohumidityOptions(chartData, by, isResponsive)
  )
  chart.update()
  if(sensorId == SENSOR.MEDITAG){
    subChart = new Chart(`${canvasId}Sub`,
      createChartSubMeditagOptions(chartData, by, isResponsive)
    )
    subChart.update()
  }
  return chart
}

/**
 * チャートグラフに必要な時系列ごとのセンサ情報を作成する
 * @method
 * @param {Object[]} range keyプロパティを含む
 * @param {Object[]} data センサ情報リスト
 * @return {Object[]}
 */
export const createChartData = (range, data) => {
  return _.reduce(range, (result, key) => {
    const datum = data.find(val => val.key == key.key)
    if (datum) {
      result.push({...datum, key:key.text? key.text: key.key})
    }
    else {
      result.push({
        key:key.text? key.text: key.key,
        immediate: null, average: null, max: null, min: null, data: null,
      })
    }
    return result
  }, [])
}

/**
 * 指定したcanvas要素に温湿度チャートグラフを描画する。目盛は1時間間隔。
 * @method
 * @param {String} id canvas要素のid
 * @param {Object[]} data 温湿度情報リスト
 * @return {Object} チャートグラフの情報
 */
export const showThermoHumidityChart = (id, data) => {
  const range = ArrayUtil.numberRange(APP.SENSOR.TEMPERATURE.LINE_HOUR_START, APP.SENSOR.TEMPERATURE.LINE_HOUR_END)
  const chartData = createChartData(range, data.map(val => {return {key: val.key, immediate: {...val}}}))
  const suffix = ':00'
  chartData.forEach(val => val.key = val.key + suffix)
  return createChartGraph(id, SENSOR.TEMPERATURE, chartData, 'hour')
}

/**
 * 指定したcanvas要素にチャートグラフを描画する
 * @method
 * @param {String} canvasId canvas要素のid
 * @param {Number} sensorId
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {Object[]} sensorData
 * @param {String} by 'minute'：1分間隔 or 'hour'：1時間間隔 or 'day'：1日間隔
 * @return {Object} チャートグラフの情報
 */
export const showChartDetail = (canvasId, sensorId, dateFrom, dateTo, sensorData, by) => {
  const range = DateUtil.dateRange(dateFrom, dateTo, by)
  const chartData = createChartData(range, sensorData)
  return createChartGraph(canvasId, sensorId, chartData, by, true)
}

/**
 * 指定したストレスレベルに応じた背景色を取得する。
 * @method
 * @param {Number} stress
 * @return {String}
 */
export const getStressBg = stress => {
  let idx = stress < 8? 0: stress < 20? 1: 2
  return DISP.MEDITAG.STRESS_BG[idx]
}

/**
 * ストレスレベルに応じた背景色を設定する。
 * @method
 * @param {Object[]} positions
 * @param {Object[]} sensors
 * @return {Object[]}
 */
export const setStress = (positions, sensors) => {
  return positions.map(position => {
    let sensor = sensors.find(sensor => sensor.btxId == position.btxId)
    return sensor? {...position, bg: getStressBg(sensor.stress)}: position
  })
}

/**
 * マグネットセンサの状態を言語化する。
 * @method
 * @param {Number} magnetState
 * @return {String}
 */
export const getMagnetStateKey = (magnetState) => i18n.tnl(`label.${magnetState === SENSOR.MAGNET_STATUS.ON? 'using': 'notUse'}`)

/**
 * 温湿度センサの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields1 = (addColumnList = []) => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    {key: 'potName', sortable: true, label:'potName'},
    ArrayUtil.includesIgnoreCase(APP.SENSOR_LIST.WITH, 'deviceId') && ConfigHelper.includesDeviceType('deviceId')? {key: 'deviceId', sortable: true }: null,
    ArrayUtil.includesIgnoreCase(APP.SENSOR_LIST.WITH, 'deviceIdX') && ConfigHelper.includesDeviceType('deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
  ].concat(addColumnList.map(column => {
    const isShow = Util.getValue(column, 'forceShow', false) || ArrayUtil.includesIgnoreCase(APP.SENSOR_LIST.WITH, column)
    return isShow? { key: Util.getValue(column, 'key', column), sortable: true }: null
  })).concat([
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'temperature', sortable: true},
    {key: 'humidity', sortable: true},
  ]))
}

/**
 * 人感センサの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields2 = () =>{
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    ConfigHelper.includesDeviceType('deviceId')? {key: 'deviceId', sortable: true }: null,
    ConfigHelper.includesDeviceType('deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    {key: 'locationName', label:'locationZoneName', sortable: true,},
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'count', label:'numUsers', sortable: true},
  ])
}

/**
 * MEDiTAGの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields5 = () => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    {key: 'potName', sortable: true },
    {key: 'major', sortable: true },
    {key: 'minor', sortable: true },
    {key: 'high', label:'h_blood_pressure', sortable: true},
    {key: 'low', label:'l_blood_pressure', sortable: true},
    {key: 'beat', label:'heart_rate', sortable: true},
    {key: 'step', label:'step', sortable: true},
    {key: 'down', label:'down_count', sortable: true},
  ])
}

/**
 * マグネットセンサの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields6 = () => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    {key: 'potName', sortable: true },
    {key: 'major', sortable: true },
    {key: 'minor', sortable: true },
    {key: 'state', sortable: true},
  ])
}

/**
 * 圧力センサの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields8 = () => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    ConfigHelper.includesDeviceType('deviceId')? {key: 'deviceId', sortable: true }: null,
    ConfigHelper.includesDeviceType('deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    {key: 'locationName', label:'locationZoneName', sortable: true,},
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'pressVol', label:'pressVol', sortable: true},
  ])
}

/**
 * オムロン環境センサの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields9 = () => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    {key: 'potName', sortable: true, label:'potName'},
    ConfigHelper.includesDeviceType('deviceId')? {key: 'deviceId', sortable: true }: null,
    ConfigHelper.includesDeviceType('deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    { key: 'locationName', forceShow: true },
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'temperature', sortable: true},
    {key: 'humidity', sortable: true},
    {key: 'ambientLight', sortable: true},
    {key: 'soundNoise', sortable: true},
  ])
}

/**
 * CO2センサの一覧表示で使用するテーブルの項目を取得する。
 * @method
 * @return {Object[]}
 */
export const getFields14 = () => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    ConfigHelper.includesDeviceType('deviceId')? {key: 'deviceId', sortable: true }: null,
    ConfigHelper.includesDeviceType('deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    {key: 'locationName', label:'locationZoneName', sortable: true,},
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'co2', label:'co2', sortable: true},
  ])
}

/**
 * 指定したセンサで使用するテーブルの項目を取得する。
 * @method
 * @param {Number} sensorId
 * @return {Object[]} 規定値がない場合は温湿度と同値
 */
export const getFields = (sensorId) => {
  console.log('sensorId', sensorId)
  switch(sensorId){
    case SENSOR.TEMPERATURE:
      return getFields1()
    case SENSOR.PIR:
      return getFields2()
    case SENSOR.THERMOPILE:
      return getFields2()
    case SENSOR.MEDITAG:
      return getFields5()
    case SENSOR.MAGNET:
      return getFields6()
    case SENSOR.PRESSURE:
      return getFields8()
    case SENSOR.OMR_ENV:
      return getFields9()
    case SENSOR.CO2:
      return getFields14()
    default:
      return getFields1()
  }
}

/**
 * 複数センサの情報を取得する。
 * @method
 * @param {Object[]} exbSensorList
 * @return {String[]}
 */
export const getSensors = exbSensorList => {
  if(!Util.hasValue(exbSensorList)){
    return [{ sensorId: null, sensorName: 'normal' }]
  }
  return exbSensorList.map(exbSensor => ({
    sensorId: Util.getValue(exbSensor, 'sensorId'),
    sensorName: Util.getValue(exbSensor, 'sensorName'),
  })).filter(val => val.sensorId)
}

/**
 * 指定したEXBに紐づいているセンサのIDを取得する
 * @method
 * @param {Object} exb
 * @return {Object[]}
 */
export const getSensorIds = exb => {
  const exbSensorList = Util.getValue(exb, 'exbSensorList', []) // TODO: 冗長
  if(Util.hasValue(exbSensorList)){
    return exbSensorList.map(exbSensor => Util.getValue(exbSensor, 'sensor.sensorId')).filter(val => val)
  }
  return [null]
}

/**
 * Txの場所名を自動作成する。
 * @method
 * @param {Object} tx
 * @return {String}
 */
export const createTxLocationDummyName = tx => 'tx' + (APP.TX.BTX_MINOR == 'minor'? tx.minor * -1: tx.btxId * -1)

/**
 * 指定したbtxIdを持つセンサの情報を取得する。
 * @method
 * @param {String} type
 * @param {Object[]} meditagSensorList
 * @param {Number} btxId
 * @return {Object}
 */
export const getSensorFromBtxId = (type, sensorList, btxId) => {
  const sensor = sensorList? sensorList.find(sensor => sensor.btxId == btxId || sensor.btxId == btxId || sensor.btxId == btxId): null
  Util.debug(type, sensor)
  return sensor
}

/**
 * マグネットセンサがONの状態になっているか確認する。
 * @method
 * @param {Object} magnet
 * @return {Boolean}
 */
export const isMagnetOn = magnet => magnet && magnet.magnet === SENSOR.MAGNET_STATUS.ON

/**
 * マグネットセンサが属しているカテゴリ一覧を取得する。
 * @method
 * @param {Object[]} txList
 * @return {Number[]}
 */
export const getMagnetCategoryTypes = txList => txList.filter(val => val.categoryId && val.sensorId == SENSOR.MAGNET).map(val => val.categoryId)

/**
 * マグネットセンサが属しているグループ一覧を取得する。
 * @method
 * @param {Object[]} txList
 * @return {Number[]}
 */
export const getMagnetGroupTypes = txList => txList.filter(val => val.groupId && val.sensorId == SENSOR.MAGNET).map(val => val.groupId)

/**
 * 指定したセンサIDを含むか確認する。undefinedとnullは通常として扱う
 * checkIdをつけた場合、targetSensorIdと一致するか確認する
 * @method
 * @param {Number[]} sensorIdList
 * @param {Number} targetSensorId
 * @param {Number} or {Number[]} checkId
 * @return {Boolean}
 */
export const match = (sensorIdList, targetSensorId, checkId) => {
  return sensorIdList.some(sensorId => sensorId == targetSensorId)
    && (!checkId || checkId == targetSensorId || checkId.includes && checkId.includes(targetSensorId))
}

/**
 * サーバからセンサ情報を取得する。
 * @async
 * @method
 * @param {Object} sensorInfo
 * @return {Object[]}
 */
export const fetchSensor = async (sensorInfo) => {
  if (sensorInfo.enable !== false) {
    try {
      sensorInfo.data =  await EXCloudHelper.fetchSensor(sensorInfo.id)      
    } catch (e) {
      console.error(e)      
    }
  }
}

/**
 * 指定したセンサ情報をサーバから取得する。
 * @async
 * @method
 * @param {Number[]} sensorIdList
 * @return {Object[]}
 */
export const fetchAllSensor = async (sensorIdList) => {
  const sensorInfos = [
    { id: SENSOR.TEMPERATURE},
    { id: SENSOR.PIR },
    { id: SENSOR.THERMOPILE, enable: APP.SENSOR.USE_THERMOPILE },
    { id: SENSOR.MEDITAG, enable: APP.SENSOR.USE_MEDITAG},
    { id: SENSOR.MAGNET, enable: APP.SENSOR.USE_MAGNET },
    { id: SENSOR.PRESSURE, enable: APP.SENSOR.USE_PRESSURE }
  ].filter(e => sensorIdList.includes(e.id)).map(e => ({...e, name: SENSOR.STRING[e.id]})) // TODO: NAMEとSTRING紛らわしい
  await Promise.all(sensorInfos.map(fetchSensor))
  return sensorInfos
}


/**
 * ヒートマップで使用するデータを作成する。
 * @method
 * @param {Number} areaId
 * @param {Object[]} temperatureList
 * @param {Number} mapScale
 * @return {Object}
 */
export const createHeatmapData = (areaId, temperatureList, mapScale) => {
  const dataList = temperatureList.filter(data => data.areaId == areaId && Util.hasValue(data.x) && Util.hasValue(data.y))
  return HeatmapHelper.collect(dataList,
    { max: DISP.THERMOH.TEMPERATURE_MAX, min: DISP.THERMOH.TEMPERATURE_MIN },
    data => `${data.x}-${data.y}`,
    (result, data) => data.temperature,
    data => ({x: data.x * mapScale, y: data.y * mapScale})
  )
}

/**
 * ヒートマップを作成描画する。
 * @method
 * @param {Object} vueComponent
 * @param {Object} mapInfo
 * @param {Object[]} temperatureList
 * @param {Function} onLoad
 * @return {Object}
 */
export const createHeatmap = (vueComponent, mapInfo, temperatureList, onLoad, onFinally) => {
  let ret = null
  HeatmapHelper.create(vueComponent, 'heatmap', mapInfo.src, (evt, mapElement, map) => {
    map.width = mapInfo.element.width
    map.height = mapInfo.element.height
    HeatmapHelper.draw(
      mapElement,
      {
        radius: DISP.THERMOH.TEMPERATURE_RADIUS,
        gradient: HeatmapHelper.createGradient(),
        // ヒートマップは座標系が異なるので注意
        width: mapInfo.element.width * mapInfo.scale,
        height: mapInfo.element.height * mapInfo.scale,
      },
      createHeatmapData(mapInfo.areaId, temperatureList, mapInfo.scale)
    )
    map.style.width = String(mapInfo.element.width * mapInfo.scale) + 'px'
    map.style.height = String(mapInfo.element.height * mapInfo.scale) + 'px'
    onLoad && onLoad()
    ret = mapElement
  }, onFinally)
  return ret
}

/**
 * 温湿度の凡例を作成する。
 * @method
 * @return {Object[]}
 */
export const createThermoLegends = () => {
  const thermoPatternConfig = getThermoPatternConfig()
  var index = 1
  var lastBase = null
  var styleBase = null
  return _.map(thermoPatternConfig, config => {
    const style = { shape: SHAPE.CIRCLE, bgColor: config.color, color: DISP.TX.COLOR }
    const msg = config.base? config.base + i18n.tnl('message.underDegree'): lastBase + i18n.tnl('message.overDegree')
    lastBase = config.base
    styleBase = StyleHelper.getStyleDisplay1(style)
    styleBase['animation'] = 'legend-flash ' + config.flash + 'ms linear infinite'
    return {
      id: index++,
      items: [
        { id: 1, text: '', style: styleBase },
        { id: 2, text: msg, style: {} },
      ]
    }
  })
}

/**
 * 本日の温湿度情報を取得する。
 * @method
 * @param {Number} id
 * @param {Boolean} isExb
 * @return {Object}
 */
export const getTodayThermoHumidityInfo = async (id, isExb) => {
  const pMock = DEV.USE_MOCK_EXC? mock['basic_sensorHistory_1_1_today_hour']: null
  const sensorData = await AppServiceHelper.fetchList(`/basic/sensorHistory/1/${isExb? 1: 0}/${id}/today/hour`, null, null, pMock)
  sensorData.data.forEach(val => {
    val.key = DateUtil.formatDate(val.sensor_dt, 'HH')
    if(val.temperature){
      val.temperature = NumberUtil.formatTemperature(val.temperature)
    }
    if(val.humidity){
      val.humidity = NumberUtil.formatHumidity(val.humidity)
    }
  })
  return sensorData
}

/**
 * センサ情報を取得し、TXやEXB等の情報を付加する。
 * @method
 * @param {Number[]} [targetSensorIds = []]
 * @return {Object[]}
 */
export const fetchSensorInfo = async (targetSensorIds = []) => {
  const deviceIdMap = StateHelper.getMaster().deviceIdMap
  const btxIdMap = StateHelper.getMaster().btxIdMap
  const sensorInfos = await fetchAllSensor(targetSensorIds)

  const sensorMap = {}
  sensorInfos.forEach(sensorInfo => {
    let sensorData = _(sensorInfo.data).filter(sensor => {      
      const tx = btxIdMap[sensor.btxId]
      const exb = deviceIdMap[sensor.deviceId]
      const hasTime = sensor.timestamp || sensor.updatetime // 日時がないのは除外
      // const fixedPos = tx.location && tx.location.x && tx.location.y > 0 // TODO: ここで固定位置かどうかの条件は不要と思われる
      return (tx || exb) && hasTime
    }
    ).map(sensor => addSensorInfo(sensor))
    // pir: val.count >= DISP.PIR.MIN_COUNT // TODO: 元のソースにあったfilter条件。多分不要。
    // exb.sensorId == SENSOR.PRESSURE? exb.pressVol <= DISP.PRESSURE.VOL_MIN || DISP.PRESSURE.EMPTY_SHOW: exb.count > 0 || DISP.PIR.EMPTY_SHOW
    // APP.SENSOR.SHOW_MAGNET_ON_PIR) 
    sensorMap[sensorInfo.name] = sensorData.sortBy(sensor => // MEDiTAGの場合、指定時間以内に転倒したものを先頭にソートする
      sensor.sensorId == SENSOR.MEDITAG && (new Date().getTime() - sensor.downLatest < APP.SENSOR.MEDITAG.DOWN_RED_TIME)?
        sensor.downLatest * -1
        : sensor.btxId
    ).value()
  })

  return sensorMap

}

/**
 * センサ情報にTX,EXB,POS情報を付加する
 * TODO: これは混乱を招くため、極力付加情報はなくす。exbやtxを展開しているのはセンサー情報とごちゃまぜになるので良くない。
 * 
 * @param {}} sensor 
 * @param {*} txMap 
 * @param {*} exbMap 
 * @param {*} pos 
 */
const addSensorInfo = (sensor, pos) => {
  const deviceIdMap = StateHelper.getMaster().deviceIdMap
  const btxIdMap = StateHelper.getMaster().btxIdMap

  const exb = deviceIdMap[sensor.deviceId]
  let tx = btxIdMap[sensor.btxId]
  let location, areaId, areaName, zoneIdList, zoneCategoryIdList
  if (tx && pos && !PositionHelper.hasTxLocation(pos.tx)) { // MEDiTAGのように固定TXではない場合、現在いるエリア、ゾーン、ゾーンカテゴリ
    areaId = pos.exb.areaId
    areaName = Util.getValue(pos, 'exb.location.area.areaName')
    location = pos.exb.location
    zoneIdList = pos.exb.location.zoneIdList
    zoneCategoryIdList = pos.exb.location.zoneCategoryIdList
  }
  else {
    location = sensor.btxId? (tx? tx.location: {}): exb? exb.location: {}
    if (!location) location = {}
    // location = StateHelper.getMaster().locations.find(e => e.locationId == location.locationId)
    areaId = location.areaId
    areaName = Util.getValue(location, 'area.areaName')
    zoneIdList = Util.hasValue(location.zoneIdList)? location.zoneIdList: []
    zoneCategoryIdList = Util.hasValue(location.zoneCategoryIdList)? location.zoneCategoryIdList: []      
  }
  let potName = tx? Util.firstValue(tx.pot.potName, ConfigHelper.includesBtxMinor('btxId')? tx.btxId: tx.minor): null
  const updatetime = Util.firstValue(sensor.updatetime, sensor.timestamp)

  return {
    // id: sensor.sensorId,
    ...sensor,
    // sensorId: sensor? sensor.id: null,
    label: Util.v(tx, 'pot.displayName', sensor.btxId), 
    ...tx,
    ...exb,
    deviceId: Util.v(exb,'deviceId', ''),
    x: location.x,
    y: location.y,
    updatetime,
    sensorDt: DateUtil.formatDate(updatetime),
    bg: getStressBg(sensor.stress), 
    down: Util.v(sensor, 'down', 0),
    count: Util.v(sensor, 'count', 0),
    pressVol: Util.v(sensor, 'press_vol', 0),
    ambientLight: sensor.ambient_light,
    soundNoise: sensor.sound_noise,
    state: getMagnetStateKey(sensor.magnet),
    potName,
    areaId,
    areaName,
    zoneIdList,
    zoneCategoryIdList,
  }
}


/**
 * EXB情報にセンサ情報を付加する。
 * 
 * @method
 * @param {Number} selectedSensorId
 * @param {Object} exCluodSensors
 * @return {Object[]}
 */
export const mergeExbWithSensor = (selectedSensorId, exCluodSensors) => {
  const exbs = StateHelper.getMaster().exbs
  return _(exbs)
    .filter(exb => {
      return exb.location && exb.location.x && exb.location.y > 0
      && exb.sensorIdList.includes(selectedSensorId)
    })
    .map(exb => {
      const sensor = {id: selectedSensorId, ...exCluodSensors.find(sensor => sensor.deviceId == exb.deviceId && (sensor.timestamp || sensor.updatetime))}
      return addSensorInfo(sensor)
    })
    .value()
}

/**
 * TX情報にセンサ情報を付加する。
 * @method
 * @param {Number} selectedSensor
 * @param {Boolean} exCluodSensors
 * @param {Boolean} positionHistory
 * @return {Object[]}
 */
export const mergeTxWithSensorAndPosition = (selectedSensor, exCluodSensors, positions) => {
  const txs = StateHelper.getMaster().txs
  const allPosition = selectedSensor == SENSOR.MEDITAG
  return _(txs)
    .filter(tx => allPosition || tx.location && tx.location.x && tx.location.y > 0) // MEDiTAG以外は固定位置のTXのみ
    .filter(tx => selectedSensor == null || tx.sensorId == selectedSensor)
    .map(tx => {
      const pos = positions.find(pos => pos.txId == tx.txId)
      const sensor = exCluodSensors.find(sensor => sensor.btxId == tx.btxId && (sensor.timestamp || sensor.updatetime))
      return sensor? addSensorInfo(sensor, pos): null
    })
    .compact().value()
}

