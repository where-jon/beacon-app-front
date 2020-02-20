import * as util from '../../wcutil'
import moment from 'moment'
import { domevent } from '../../common/domevent'

export function TimeCore() {}

TimeCore.mixin = function(func) {
    Object.assign(func.prototype, TimeCore.prototype)
}

TimeCore.prototype.nearest = function(value, nearest) {
    const diff = nearest.map(v => {
        return Math.abs(value - v)
    })
    const nearestIndex = util.inArray(Math.min.apply(null, diff), diff)
    return nearest[nearestIndex]
}

TimeCore.prototype.calcGridYIndex = function(height, y) {
    const result = y * 24 / height
    const floored = result | 0
    const nearest = this.nearest(result - floored, [0, 1])
    return floored + (nearest ? 0.5 : 0)
}

TimeCore.prototype.retriveScheduleData = function(container, date) {
    const containerHeight = parseInt(window.getComputedStyle(container, null).height.replace('px', ''))

    return (mouseEvent, extend) => {
        const position = domevent.getMousePosition(mouseEvent, container)
        const mouseY = position[1]
        const gridY = 24 * mouseY / containerHeight
        const timeY = moment(date).add(gridY * 60, 'm').toDate()
        const nearestGridY = this.calcGridYIndex(containerHeight, mouseY)
        const nearestGridTimeY = moment(date).add(nearestGridY * 60, 'm').toDate()
        return util.extend({
            target: mouseEvent.target || mouseEvent.srcElement,
            relatedView: container,
            originEvent: mouseEvent,
            mouseY: mouseY,
            gridY: gridY,
            timeY: timeY,
            nearestGridY: nearestGridY,
            nearestGridTimeY: nearestGridTimeY,
            triggerEvent: mouseEvent.type
        }, extend)
    }
}
