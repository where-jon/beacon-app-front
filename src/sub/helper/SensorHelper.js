import { DISCOMFORT, SENSOR } from '../constant/Constants'
import { APP, DISP } from '../constant/config'
import * as Util from '../util/Util'
import Chart from 'chart.js'
import _ from 'lodash'

let chart = null
let subChart = null

export const getDiscomfortColor = (temperature, humidity) => {
  let discomfort = getDiscomfort(temperature, humidity)
  switch (discomfort) {
  case DISCOMFORT.COLD:
    return DISP.DISCOMFORT_COLD
  case DISCOMFORT.COMFORT:
    return DISP.DISCOMFORT_COMFORT
  case DISCOMFORT.HOT:
    return DISP.DISCOMFORT_HOT
  }
}

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

export const createChartGraphOptions = (left, right) => {
  return {
    scales:{
      yAxes:[
        left? {
          id: left.id, type: 'linear', position: 'left',
          scaleLabel: { display: true, labelString: left.label },
          ticks: left.ticks,
        }: null,
        right? {
          id: right.id, type: 'linear', position: 'right',
          scaleLabel: { display: true, labelString: right.label },
          ticks: right.ticks,
        }: null
      ].filter((val) => val)
    },
    responsive: true,
    maintainAspectRatio: false,
    elements:{ line:{ tension: 0 } }
  }
}

export const createChartThermohumidityOptions = (chartData, by, i18n) => {
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
      }
    )
  }
}

export const createChartPirOptions = (chartData, by, i18n) => {
  return {
    type:'line', 
    data:{
      labels: chartData.map((val) => val.key),
      datasets: 
        createChartGraphDatasets('pir', i18n.tnl('label.pir'), chartData, 'count', DISP.PIR_LINE_COLOR, by, i18n)
    },
    options: createChartGraphOptions(
      {
        id: 'pir',
        label: i18n.tnl('label.detectedCount'),
        ticks: {
          min: 0,
          max: Math.ceil(Math.max(...chartData.map((val) => val && val.data? val.data.count: 0)) / 10 ) * 10
        },
      }
    )
  }
}

export const createChartThermopileOptions = (chartData, by, i18n) => {
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
          max: Math.ceil(Math.max(...chartData.map((val) => val && val.data? val.data.count: 0)) / 10 ) * 10
        }
      }
    )
  }
}

export const createChartMagnetOptions = (chartData, by, i18n) => {
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
      }
    )
  }
}

export const createChartMeditagOptions = (chartData, by, i18n) => {
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
      }
    )
  }
}

export const createChartSubMeditagOptions = (chartData, by, i18n) => {
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
      }
    )
  }
}

export const createChartGraph = (canvasId, sensorId, chartData, by, i18n) => {
  if(chart){
    chart.destroy()
  }
  if(subChart){
    subChart.destroy()
  }
  chart = new Chart(canvasId, 
    sensorId == SENSOR.PIR? createChartPirOptions(chartData, by, i18n):
      sensorId == SENSOR.THERMOPILE? createChartThermopileOptions(chartData, by, i18n):
        sensorId == SENSOR.MAGNET? createChartMagnetOptions(chartData, by, i18n):
          sensorId == SENSOR.MEDITAG? createChartMeditagOptions(chartData, by, i18n):
            createChartThermohumidityOptions(chartData, by, i18n)
  )
  chart.update()
  if(sensorId == SENSOR.MEDITAG){
    subChart = new Chart(`${canvasId}Sub`, 
      createChartSubMeditagOptions(chartData, by, i18n)
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
  const range = Util.numberRange(APP.TEMPERATURE_LINE_HOUR_START, APP.TEMPERATURE_LINE_HOUR_END)
  const chartData = createChartData(range, data.map((val) => {return {key: val.key, immediate: {...val}}}))
  const suffix = ':00'
  chartData.forEach((val) => val.key = val.key + suffix)
  return createChartGraph(id, SENSOR.TEMPERATURE, chartData, 'hour', i18n)
}

export const showChartDetail = (canvasId, sensorId, dateFrom, dateTo, sensorData, by, i18n) => {
  const range = Util.dateRange(dateFrom, dateTo, by)
  const chartData = createChartData(range, sensorData)
  return createChartGraph(canvasId, sensorId, chartData, by, i18n)
}

export const getStressBg = (stress) => {
  let idx = stress < 8? 0: stress < 20? 1: 2 
  return DISP.STRESS_BG[idx]
} 

export const setStress = (positions, sensors) => {
  return positions.map((position) => {
    let sensor = sensors.find((sensor) => sensor.id == position.btxId)
    return sensor? {...position, bg: getStressBg(sensor.stress)}: position
  })
}
