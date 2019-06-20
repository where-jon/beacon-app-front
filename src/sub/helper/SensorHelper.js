import { DISCOMFORT, SENSOR, THERMOHUMIDITY } from '../constant/Constants'
import { APP, DISP } from '../constant/config'
import * as Util from '../util/Util'
import * as ArrayUtil from '../util/ArrayUtil'
import * as DateUtil from '../util/DateUtil'
import * as ChartHelper from './ChartHelper'
import { addLabelByKey } from './ViewHelper'
import Chart from 'chart.js'
import _ from 'lodash'

let chart = null
let subChart = null

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

export const getThermoPatternConfig = () => {
  if(Util.hasValue(DISP.THERMOH.PATTERN)){
    return DISP.THERMOH.PATTERN.map((pattern) => {
      const patternRet = {}
      pattern.split(' ').forEach((val) => {
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

export const getHumidityPatternConfig = () => {
  if(Util.hasValue(DISP.THERMOH.HUMIDITY_PATTERN)){
    const ret = {less: [], more: []}
    DISP.THERMOH.HUMIDITY_PATTERN.map((pattern) => {
      const patternRet = {}
      pattern.split(' ').forEach((val) => {
        const v = val.toLowerCase()
        if(['more', 'less'].includes(v)){
          patternRet.label = v
        }
        else if(!isNaN(Number(v))){
          patternRet.base = Number(v)
        }
      })
      return patternRet
    }).forEach((pattern) => {
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

export const getHumidityInfo = (humidityPatternConfig, humidity) => {
  const less = humidityPatternConfig.less.find((conf) => {
    if(conf.base == null){
      return false
    }
    return humidity <= conf.base
  })
  if(less){
    return less
  }
  return humidityPatternConfig.more.find((conf) => {
    if(conf.base == null){
      return false
    }
    return humidity >= conf.base
  })
}

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

export const availableSensorAll = () =>  _([...APP.EXB.SENSOR, ...APP.SENSOR.TX_SENSOR]).sort().uniqWith(_.isEqual).value()

export const onlyOne = () => availableSensorAll().length == 1 && availableSensorAll()[0]

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

export const calcDiscomfortIndex = (temperature, humidity) => 0.81 * temperature + 0.01 * humidity * (0.99 * temperature - 14.3) + 46.3

export const createChartGraphDatasets = (yAxisID, label, chartData, targetId, borderColor, by, i18n) => {
  const immediate = chartData.find((val) => val.immediate)? true: false
  const average = chartData.find((val) => val.average)? true: false
  const max = chartData.find((val) => val.max)? true: false
  const min = chartData.find((val) => val.min)? true: false
  return [
    immediate? {
      label: label, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map((val) => val.immediate? val.immediate[targetId]: null),
      fill: false, borderColor: borderColor
    }: null,
    average? {
      label: label, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map((val) => val.average? val.average[targetId]: null),
      fill: false, borderColor: borderColor
    }: null,
    max? {
      label: `${label}${by == 'day'? i18n.tnl('label.max'): ''}`, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map((val) => val.max? val.max[targetId]: null),
      fill: false, borderDash: by == 'day'? [5, 5]: [5, 0], borderColor: borderColor
    }: null,
    min? {
      label: `${label}${by == 'day'? i18n.tnl('label.min'): ''}`, yAxisID: yAxisID, spanGaps: true,
      data: chartData.map((val) => val.min? val.min[targetId]: null),
      fill: false, borderDash: by == 'day'? [5, 5]: [5, 0], borderColor: borderColor
    }: null,
  ].filter((val) => val)
}

export const createChartGraphOptions = (left, right, isResponsive = false) => {
  return ChartHelper.createChartGraphOptions(left, right, isResponsive)
}

export const createChartThermohumidityOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('temperature', i18n.tnl('label.temperature'), chartData, 'temperature', DISP.TEMPERATURE_LINE_COLOR, by, i18n)
          .concat(createChartGraphDatasets('humidity', i18n.tnl('label.humidity'), chartData, 'humidity', DISP.HUMIDITY_LINE_COLOR, by, i18n))
    },
    options: createChartGraphOptions(
      {
        id: 'temperature',
        label: i18n.tnl('label.temperature') + ' (℃)',
        ticks: { min: 0, max: 40 },
      }, {
        id: 'humidity',
        label: i18n.tnl('label.humidity') + ' (%)',
        ticks: { min: 0, max: 100, stepSize: 25},
      },
      isResponsive
    )
  }
}

export const createChartPirOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('pir', i18n.tnl('label.pir'), chartData, 'count', DISP.PIR.LINE_COLOR, by, i18n)
    },
    options: createChartGraphOptions(
      {
        id: 'pir',
        label: i18n.tnl('label.detectedCount'),
        ticks: {
          min: 0,
          max: calcChartMax(chartData, 'count', by, 2)
        },
      },
      null,
      isResponsive
    )
  }
}

export const createChartThermopileOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('thermopile', i18n.tnl('label.thermopile'), chartData, 'count', DISP.THERMOPILE_LINE_COLOR, by, i18n)
    },
    options: createChartGraphOptions(
      {
        id: 'thermopile',
        label: i18n.tnl('label.detectedCount'),
        ticks: {
          min: 0,
          max: calcChartMax(chartData, 'count', by, 2)
        }
      },
      null,
      isResponsive
    )
  }
}

export const createChartMagnetOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('magnet', i18n.tnl('label.magnet'), chartData, 'magnet', DISP.MAGNET_LINE_COLOR, by, i18n)
    },
    options: createChartGraphOptions(
      {
        id: 'magnet',
        label: '',
        ticks: {
          min: SENSOR.MAGNET_STATUS.OFF,
          max: SENSOR.MAGNET_STATUS.ON,
          callback: function(value, index, values){
            return value == SENSOR.MAGNET_STATUS.ON? i18n.tnl('label.InUse'): value == SENSOR.MAGNET_STATUS.OFF? i18n.tnl('label.notUse'): ''
          }
        }
      },
      null,
      isResponsive
    )
  }
}

export const createChartPressureOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('pressure', i18n.tnl('label.pressure'), chartData, 'pressVol', DISP.PRESSURE.LINE_COLOR, by, i18n)
    },
    options: createChartGraphOptions(
      {
        id: 'pressure',
        label: i18n.tnl('label.pressVol'),
        ticks: {
          min: 0,
          max: calcChartMax(chartData, 'pressVol', by, 2)
        },
      },
      null,
      isResponsive
    )
  }
}

export const createChartMeditagOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('blood_pressure', i18n.tnl('label.h_blood_pressure'), chartData, 'high', DISP.H_BLOOD_PRESSURE_LINE_COLOR, by, i18n)
          .concat(createChartGraphDatasets('blood_pressure', i18n.tnl('label.l_blood_pressure'), chartData, 'low', DISP.L_BLOOD_PRESSURE_LINE_COLOR, by, i18n))
          .concat(createChartGraphDatasets('heart_rate', i18n.tnl('label.heart_rate'), chartData, 'beat', DISP.HEART_RATE_LINE_COLOR, by, i18n))
    },
    options: createChartGraphOptions(
      {
        id: 'blood_pressure',
        label: i18n.tnl('label.blood_pressure'),
        ticks: { min: 0, max: DISP.BLOOD_PRESSURE_MAX, stepSize: DISP.BLOOD_PRESSURE_STEP },
      }, {
        id: 'heart_rate',
        label: i18n.tnl('label.heart_rate'),
        ticks: { min: 0, max: DISP.HEART_RATE_MAX, stepSize: DISP.HEART_RATE_STEP },
      },
      isResponsive
    )
  }
}

export const createChartSubMeditagOptions = (chartData, by, i18n, isResponsive = false) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('step', i18n.tnl('label.step'), chartData, 'step', DISP.STEP_LINE_COLOR, by, i18n)
          .concat(createChartGraphDatasets('down_count', i18n.tnl('label.down_count'), chartData, 'down', DISP.DOWN_COUNT_LINE_COLOR, by, i18n))
    },
    options: createChartGraphOptions(
      {
        id: 'step',
        label: i18n.tnl('label.step'),
        ticks: { min: 0, max: DISP.STEP_MAX, stepSize: DISP.STEP_STEP },
      }, {
        id: 'down_count',
        label: i18n.tnl('label.down_count'),
        ticks: { min: 0, max: DISP.DOWN_COUNT_MAX, stepSize: DISP.DOWN_COUNT_STEP },
      },
      isResponsive
    )
  }
}

export const createChartGraph = (canvasId, sensorId, chartData, by, i18n, isResponsive = false) => {
  if(chart){
    chart.destroy()
  }
  if(subChart){
    subChart.destroy()
  }
  chart = new Chart(canvasId, 
    sensorId == SENSOR.PIR? createChartPirOptions(chartData, by, i18n, isResponsive):
      sensorId == SENSOR.THERMOPILE? createChartThermopileOptions(chartData, by, i18n, isResponsive):
        sensorId == SENSOR.MAGNET? createChartMagnetOptions(chartData, by, i18n, isResponsive):
          sensorId == SENSOR.MEDITAG? createChartMeditagOptions(chartData, by, i18n, isResponsive):
            sensorId == SENSOR.PRESSURE? createChartPressureOptions(chartData, by, i18n, isResponsive):
              createChartThermohumidityOptions(chartData, by, i18n, isResponsive)
  )
  chart.update()
  if(sensorId == SENSOR.MEDITAG){
    subChart = new Chart(`${canvasId}Sub`, 
      createChartSubMeditagOptions(chartData, by, i18n, isResponsive)
    )
    subChart.update()
  }
  return chart
}

export const createChartData = (range, data) => {
  return _.reduce(range, (result, key) => {
    const datum = data.find((val) => val.key == key.key)
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

export const showThermoHumidityChart = (id, data, i18n) => {
  const range = ArrayUtil.numberRange(APP.SENSOR.TEMPERATURE.LINE_HOUR_START, APP.SENSOR.TEMPERATURE.LINE_HOUR_END)
  const chartData = createChartData(range, data.map((val) => {return {key: val.key, immediate: {...val}}}))
  const suffix = ':00'
  chartData.forEach((val) => val.key = val.key + suffix)
  return createChartGraph(id, SENSOR.TEMPERATURE, chartData, 'hour', i18n)
}

export const showChartDetail = (canvasId, sensorId, dateFrom, dateTo, sensorData, by, i18n) => {
  const range = DateUtil.dateRange(dateFrom, dateTo, by)
  const chartData = createChartData(range, sensorData)
  return createChartGraph(canvasId, sensorId, chartData, by, i18n, true)
}

export const getStressBg = (stress) => {
  let idx = stress < 8? 0: stress < 20? 1: 2 
  return DISP.MEDITAG.STRESS_BG[idx]
} 

export const setStress = (positions, sensors) => {
  return positions.map((position) => {
    let sensor = sensors.find((sensor) => sensor.btx_id == position.btx_id)
    return sensor? {...position, bg: getStressBg(sensor.stress)}: position
  })
}

export const getMagnetStateKey = (i18n, magnetState) => i18n.tnl(`label.${magnetState === SENSOR.MAGNET_STATUS.ON? 'using': 'notUse'}`)

export const getFields1 = (i18n) => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    {key: 'potName', sortable: true },
    ArrayUtil.includesIgnoreCase(APP.SENSOR_LIST.WITH, 'deviceId') && ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceId')? {key: 'deviceId', sortable: true }: null,
    ArrayUtil.includesIgnoreCase(APP.SENSOR_LIST.WITH, 'deviceIdX') && ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    {key: 'locationName', label:'locationZoneName', sortable: true,},
    ArrayUtil.includesIgnoreCase(APP.SENSOR_LIST.WITH, 'posId')? {key: 'posId', label:'posId', sortable: true,}: null,
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'temperature', sortable: true},
    {key: 'humidity', sortable: true},
  ])
}

export const getFields2 = (i18n) =>{
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceId')? {key: 'deviceId', sortable: true }: null,
    ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    {key: 'locationName', label:'locationZoneName', sortable: true,},
    {key: 'posId', label:'posId', sortable: true,},
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'count', label:'numUsers', sortable: true},
  ])
}

export const getFields5 = (i18n) => {
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

export const getFields6 = (i18n) => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    {key: 'potName', sortable: true },
    {key: 'major', sortable: true },
    {key: 'minor', sortable: true },
    {key: 'state', sortable: true},
  ])
}

export const getFields8 = (i18n) => {
  return addLabelByKey(i18n, [
    {key: 'sensorDt', sortable: true, label:'dt'},
    ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceId')? {key: 'deviceId', sortable: true }: null,
    ArrayUtil.includesIgnoreCase(APP.EXB.WITH, 'deviceIdX')? {key: 'deviceIdX', sortable: true }: null,
    {key: 'locationName', label:'locationZoneName', sortable: true,},
    {key: 'posId', label:'posId', sortable: true,},
    {key: 'areaName', label:'area', sortable: true,},
    {key: 'pressVol', label:'pressVol', sortable: true},
  ])
}

export const getFields = (sensorId, i18n) => {
  if(sensorId == SENSOR.TEMPERATURE){
    return getFields1(i18n)
  }
  if(sensorId == SENSOR.PIR){
    return getFields2(i18n)
  }
  if(sensorId == SENSOR.THERMOPILE){
    return getFields2(i18n)
  }
  if(sensorId == SENSOR.MEDITAG){
    return getFields5(i18n)
  }
  if(sensorId == SENSOR.MAGNET){
    return getFields6(i18n)
  }
  if(sensorId == SENSOR.PRESSURE){
    return getFields8(i18n)
  }
  return getFields1(i18n)
}
