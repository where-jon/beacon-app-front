import { DISP } from '../constant/config'
import { SHAPE } from '../constant/Constants'
import * as Util from '../util/Util'
import * as ColorUtil from '../util/ColorUtil'
import * as StyleUtil from '../util/StyleUtil'

/**
 * カテゴリ、グループのサンプル矩形スタイルを取得する。
 * @param {Object[]} entity 
 */
export const getStyleDisplay = entity => entity.map(val => ({entity: val, style: getStyleDisplay1(val)}))

/**
 * サンプル矩形スタイルを取得する。
 * @method
 * @param {{shape: Number, color: String, bgColor: String}} val 
 * @param {{reverceColor: Boolean, fixSize: Boolean}} [option = {reverceColor: false, fixSize: true}] 
 * @return {Object}
 */
export const getStyleDisplay1 = (val, option = {reverceColor: false, fixSize: true}) => {
  const style = {
    'color': ColorUtil.colorCd4display(option.reverceColor? val.bgColor: val.color),
    'background-color': ColorUtil.colorCd4display(option.reverceColor? val.color: val.bgColor, '#FFFFFF'),
    'text-align': 'center',
    border: 'solid 1px #ccc',
    'border-radius': val.shape == SHAPE.CIRCLE? '50%': val.shape == SHAPE.ROUND_SQUARE? DISP.TX.ROUNDRECT_RADIUS + 'px': null,
    'justify-content': 'center',
    'display': ['-ms-flexbox', '-webkit-flex', 'flex'],
    '-ms-flex-align': 'center',
    '-webkit-box-align': 'center',
    'align-items': 'center',
    'white-space': 'nowrap',
  }
  const label = Util.getValue(val, 'label', null)
  if(option.fixSize != false){
    const fontSize = label? StyleUtil.getInRectFontSize(label, DISP.TX.FIX_R * 2, DISP.TX.FIX_R * 2): DISP.TX.FIX_R
    style.font = StyleUtil.getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
    style.width = (DISP.TX.FIX_R * 2) + 'px'
    style.height = (DISP.TX.FIX_R * 2) + 'px'
  }
  else{
    const fontSize = label? StyleUtil.getInRectFontSize(label, DISP.TX.R * 2, DISP.TX.R * 2): DISP.TX.R
    style.font = StyleUtil.getAdjustFontSize(() => fontSize * DISP.FONT_ICON_ADJUST_SCALE)
    style.width = (DISP.TX.R * 2) + 'px'
    style.height = (DISP.TX.R * 2) + 'px'
  }
  return style
}
