/**
 * ツールチップに関するヘルパーモジュール
 * @module helper/domain/TooltipHelper
 */

import { DISP } from '../../constant/config'
import * as DateUtil from '../../util/DateUtil'
import * as NumberUtil from '../../util/NumberUtil'
import * as StringUtil from '../../util/StringUtil'
import * as Util from '../../util/Util'
import * as StyleHelper from '../ui/StyleHelper'

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
 * 温湿度ツールチップで使用する情報を作成する。
 * @method
 * @param {Event} nativeEvent
 * @param {Object} container
 * @param {Object} stage
 * @return {Object}
 */
export const createThermoTooltipInfo = (nativeEvent, container, stage) => {
  const device = container.device
  const pageElement = document.getElementById('bd-page')
  return {
    fontSize: StyleHelper.getFont2Size(DISP.THERMOH.TOOLTIP_FONT),
    sensorName: DISP.THERMOH.TOOLTIP_ITEMS.TXNAME? device.potName? device.potName: device.locationName: '',
    temperature: DISP.THERMOH.TOOLTIP_ITEMS.TEMPERATURE? NumberUtil.formatTemperature(device.temperature) + i18n.tnl('label.temperatureUnit'): '',
    humidity: DISP.THERMOH.TOOLTIP_ITEMS.HUMIDITY? NumberUtil.formatHumidity(device.humidity) + i18n.tnl('label.humidityUnit'): '',
    description: DISP.THERMOH.TOOLTIP_ITEMS.DESCRIPTION? StringUtil.cutOnLong(device.description, 10): '',
    date: DISP.THERMOH.TOOLTIP_ITEMS.DATE? DateUtil.formatDate(device.timestamp || device.updatetime): '',
    baseX: window.pageXOffset + nativeEvent.clientX - Util.getValue(pageElement, 'offsetLeft', 0),
    baseY: window.pageYOffset + nativeEvent.clientY - Util.getValue(pageElement, 'offsetTop', 0),
    isDispRight: container.x * 2 <= stage.canvas.width,
  }
}
