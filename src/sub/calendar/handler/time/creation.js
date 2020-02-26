import * as util from '../../wcutil'
import moment from 'moment'
import { CustomEvents}  from '../../customEvents'
import { config } from '../../config'
import { domutil } from '../../common/domutil'
import { TimeCreationGuide } from './creationGuide'
import { TimeCore } from './core'

export function TimeCreation(planMode, dragHandler, timeLineElmMap, date) { 
    this.planMode = planMode
    this.date = date   
    this.timeLineElmMap = timeLineElmMap
    this.dragHandler = dragHandler
    this.guide = new TimeCreationGuide(this)
    this._getScheduleDataFunc = null
    this._dragStart = null
    this._requestOnClick = false
    this._disableDblClick = true
    this._disableClick = false

    dragHandler.on('dragStart', this._onDragStart, this)
    dragHandler.on('click', this._onClick, this)
}

TimeCreation.prototype.CLICK_DELAY = 0

TimeCreation.prototype.destroy = function() {
    this.guide.destroy()
    this.dragHandler.off(this)
    this.dragHandler = this._getScheduleDataFunc = this._dragStart = this.guide = null
}

TimeCreation.prototype.checkExpectedCondition = function(target) {
    let cssClass = domutil.getClass(target),
        matches

    if (cssClass === config.classname('time-date-schedule-block-wrap')) {
        target = target.parentNode
        cssClass = domutil.getClass(target)
    }

    matches = cssClass.match(config.time.getViewIDRegExp)

    if (!matches) {
        return false
    }
    
    const headerId = domutil.getData(target, 'id')
    return util.pick(this.timeLineElmMap, headerId)
}

TimeCreation.prototype._onDragStart = function(dragStartEventData, overrideEventName, revise) {
    var target = dragStartEventData.target,
        result = this.checkExpectedCondition(target),
        getScheduleDataFunc,
        eventData

    if (!result) {
        return
    }
    if (this.planMode == 'normal') {
        const headerId = domutil.getData(result, 'id')
        this.date = moment(headerId).toDate()
    }
    getScheduleDataFunc = this._getScheduleDataFunc = this.retriveScheduleData(result, this.date)
    eventData = this._dragStart = getScheduleDataFunc(dragStartEventData.originEvent)

    if (revise) {
        revise(eventData)
    }

    this.dragHandler.on({
        drag: this._onDrag,
        dragEnd: this._onDragEnd
    }, this)

    this.fire(overrideEventName || 'timeCreationDragstart', eventData)
}

TimeCreation.prototype._onDrag = function(dragEventData, overrideEventName, revise) {
    var getScheduleDataFunc = this._getScheduleDataFunc,
        eventData

    if (!getScheduleDataFunc) {
        return
    }

    eventData = getScheduleDataFunc(dragEventData.originEvent)

    if (revise) {
        revise(eventData)
    }

    this.fire(overrideEventName || 'timeCreationDrag', eventData)
}

TimeCreation.prototype._createSchedule = function(eventData) {
    var createRange = eventData.createRange,
        dateStart,
        dateEnd,
        start,
        end
    
    if (!createRange) {
        createRange = [
            eventData.nearestGridTimeY,
            moment(eventData.nearestGridTimeY).add(30, 'm').toDate()
        ]
    }
    dateStart = this.date
    dateEnd = moment(new Date(this.date)).add(1, 'd').add(-1, 's').toDate()
    start = util.limitDate(createRange[0], dateStart, dateEnd)
    end = util.limitDate(createRange[1], dateStart, dateEnd)
    const headerId = domutil.getData(eventData.relatedView, 'id')

    this.fire('beforeCreateSchedule', {
        isAllDay: false,
        start: start,
        end: end,
        guide: this.guide,
        triggerEventName: eventData.triggerEvent,
        headerId: headerId,
    })
}

TimeCreation.prototype._onDragEnd = function(dragEndEventData) {
    var self = this,
        dragStart = this._dragStart

    this.dragHandler.off({
        drag: this._onDrag,
        dragEnd: this._onDragEnd
    }, this)

    function reviseFunc(eventData) {
        var range = [
            dragStart.nearestGridTimeY,
            eventData.nearestGridTimeY
        ].sort((_a, _b) => _a.getTime() - _b.getTime())
        range[1] = moment(range[1]).add(30, 'm').toDate()
        eventData.createRange = range

        self._createSchedule(eventData)
    }
    this._onDrag(dragEndEventData, 'timeCreationDragend', reviseFunc)

    this._dragStart = this._getScheduleDataFunc = null
}

TimeCreation.prototype._onClick = function(clickEventData) {
    var self = this
    var condResult, getScheduleDataFunc, eventData

    this.dragHandler.off({
        drag: this._onDrag,
        dragEnd: this._onDragEnd
    }, this)

    condResult = this.checkExpectedCondition(clickEventData.target)
    if (!condResult || this._disableClick) {
        return
    }
    if (this.planMode == 'normal') {
        const headerId = domutil.getData(condResult, 'id')
        this.date = moment(headerId).toDate()
    }
    getScheduleDataFunc = this.retriveScheduleData(condResult, this.date)
    eventData = getScheduleDataFunc(clickEventData.originEvent)
    
    this._requestOnClick = true
    setTimeout(function() {
        if (self._requestOnClick) {
            self.fire('timeCreationClick', eventData)
            self._createSchedule(eventData)
        }
        self._requestOnClick = false
    }, this.CLICK_DELAY)
    this._dragStart = this._getScheduleDataFunc = null
}


TimeCore.mixin(TimeCreation)
CustomEvents.mixin(TimeCreation)
