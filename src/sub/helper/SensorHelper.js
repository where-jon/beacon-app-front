import { DISCOMFORT } from '../constant/Constants'
import { APP, DISP } from '../constant/config'
import * as Util from '../util/Util'
import Chart from 'chart.js'
import _ from 'lodash'

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

export const showThermoHumidityChart = (id, data, i18n) => {

  // This logic is for hour only(TODO: for min or day)
  let range = Util.numberRange(APP.TEMPERATURE_LINE_HOUR_START, APP.TEMPERATURE_LINE_HOUR_END)
  let suffix = ':00'
  data = _.reduce(range, (result, key) => {
    const datum = data.find((val) => val.key == key)
    if (datum) {
      result.push({...datum, key:key + suffix})
    }
    else {
      result.push({key:key + suffix, temperature:null, humidity:null})
    }
    return result
  }, [])

  return new Chart(id, {
    type:'line', 
    data:{
      labels: data.map((val) => val.key),
      datasets: [{
        label: i18n.tnl('label.temperature'), 
        yAxisID: 'temperature',
        spanGaps: true,
        data: data.map((val) => val.temperature),
        fill: false,
        borderColor: DISP.TEMPERATURE_LINE_COLOR
      },
      {
        label: i18n.tnl('label.humidity'), 
        yAxisID: 'humidity',
        spanGaps: true,
        data: data.map((val) => val.humidity),
        fill: false,
        borderColor: DISP.HUMIDITY_LINE_COLOR
      }]
    },
    options:{
      scales:{
        yAxes:[{
          id: 'temperature',
          type: 'linear',
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: i18n.tnl('label.temperature') + ' (℃)'
          },
          ticks:{ min: 0, max: 40 }
        }, {
          id: 'humidity',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: i18n.tnl('label.humidity') + ' (%)',
          },
          ticks: { max: 100, min: 0, stepSize: 25},
        }]
      },
      elements:{
        line:{ tension: 0 }
      }
    }
  })
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
