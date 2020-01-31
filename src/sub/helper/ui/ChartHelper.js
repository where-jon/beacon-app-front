/**
 * チャートグラフに関するヘルパーモジュール
 * @module helper/ui/ChartHelper
 */

import Chart from 'chart.js'
import { DISP } from '../../constant/config'
import * as Util from '../../util/Util'

let chart = null

/**
 * 積上げ棒グラフを表示する
 * @method
 * @param {String} canvasId 任意のID文字列
 * @param {String[]} labels 横軸のラベル配列
 * @param {String[]} stackLabels 縦軸のラベル配列
 * @param {Object[]} chartData チャートデータ2次元数値配列[縦軸][横軸]
 * @param {Boolean} [responsive = false]
 * @return {Object}
 */
export const showBarChart = (canvasId, labels, stackLabels, chartData, labelString, responsive = false) => {
  if(chart){
    chart.destroy()
  }

  let datasets = chartData.map((stack, idx) => {
    return {
      label: stackLabels[idx],
      data: stack,
      borderColor: DISP.SUM_STACK_BORDER_COLOR,
      backgroundColor: DISP.SUM_STACK_COLOR[idx % DISP.SUM_STACK_COLOR.length],
    }
  })
  Util.debug(datasets)

  chart = new Chart(canvasId, {
    type:'bar', 
    data: {
      labels,
      datasets
    },
    options: {
      responsive,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            min: 0
          },
          scaleLabel: {
            display: labelString != null,
            labelString,
          }
        }]
      }
    }
  })
  chart.update()
  return chart
}

/**
 * チャートグラフの設定を作成する。
 * @method
 * @param {Object} scales
 * @param {Boolean} [isResponsive = false]
 * @return {Object}
 */
export const createChartGraphOptions = (scales, isResponsive = false) => {
  const ret = {
    scales:{
      yAxes: scales.map(s => {
          return {
            id: s.id, type: 'linear', position: s.position,
            scaleLabel: { display: true, labelString: s.label },
            ticks: s.ticks,
          }
        }).filter((val) => val),
    },
    elements:{ line:{ tension: 0 } }
  }
  if(isResponsive){
    ret.responsive = true
    ret.maintainAspectRatio = false
  }
  return ret
}
