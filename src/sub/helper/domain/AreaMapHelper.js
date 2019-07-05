//import * as StateHelper from '../StateHelper'
import { DISP } from '../../constant/config'
import * as Util from '../../util/Util'
import * as BrowserUtil from '../../util/BrowserUtil'

export const calcFitSize = (target, parent, tempMapFitMobile, callback, top = 82) => { // p, heatmap-
  let parentHeight = document.documentElement.clientHeight - parent.offsetTop - top
  if(parentHeight < DISP.CONTROL.MAP.MIN_HEIGHT){
    parentHeight = DISP.CONTROL.MAP.MIN_HEIGHT
  }
  const isMapWidthLarger = parentHeight / parent.clientWidth > target.height / target.width
  let fitWidth
  if (BrowserUtil.isMobile()) {
    fitWidth = (tempMapFitMobile == 'both' && isMapWidthLarger) || tempMapFitMobile == 'width'
  } else {
    fitWidth = (DISP.MAP_FIT == 'both' && isMapWidthLarger) || DISP.MAP_FIT == 'width'
  }
  const result = {}

  if (fitWidth) {
    result.width = parent.clientWidth
    result.height = parent.clientWidth * target.height / target.width
  } else {
    result.width = parentHeight * target.width / target.height
    result.height = parentHeight
  }

  if (callback) {
    callback()
  }
  return result
}

export const getDblTapListener = (callback) => { // p
  let dblTap = false
  return (evt) => {
    if (dblTap) {
      Util.debug('second tap!')
      Util.debug(evt)
      callback && callback()
    } else {
      Util.debug('first tap!')
      dblTap = true
      setTimeout(() => {dblTap = false}, 500)
    }
  }
}

export const addDblTapListener = (map, callback) => { // p
  Util.debug('add listener')
  const listener = getDblTapListener(callback)
  map && map.addEventListener('touchstart', (evt) => listener(evt))
}

