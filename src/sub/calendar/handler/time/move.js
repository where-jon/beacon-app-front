import * as util from '../../wcutil'
import moment from 'moment'
import {config} from '../../config'
import {domutil} from '../../common/domutil'
import {TimeCore} from './core'
import {TimeMoveGuide} from './moveGuide'
import {CustomEvents}  from '../../customEvents'

export function TimeMove(planMode, dragHandler, timeLineElmMap, day, planMap) {
    this.planMode = planMode
    this.day = day
    this.planMap = planMap
    this.dragHandler = dragHandler
    this.timeLineElmMap = timeLineElmMap
    this._getScheduleDataFunc = null
    this._dragStart = null
    this._guide = new TimeMoveGuide(this)
    dragHandler.on('dragStart', this._onDragStart, this)
}

TimeMove.prototype.destroy = function() {
    this._guide.destroy()
    this.dragHandler.off(this)
    this.dragHandler = this._getScheduleDataFunc = this._dragStart = this._guide = null
}

TimeMove.prototype.checkExpectCondition = function(target) {
    if (!domutil.closest(target, config.classname('.time-schedule'))) {
        return false
    }

    return this._getTimeView(target)
}

TimeMove.prototype._getTimeView = function(target) {
    var container = domutil.closest(target, config.classname('.time-date')),
        matches

    if (!container) {
        return false
    }

    matches = domutil.getClass(container).match(config.time.getViewIDRegExp)

    if (!matches) {
        return false
    }

    const headerId = domutil.getData(container, 'id')
    return util.pick(this.timeLineElmMap, headerId)
}

TimeMove.prototype._onDragStart = function(dragStartEventData) {
    var target = dragStartEventData.target,
        timeView = this.checkExpectCondition(target),
        blockElement = domutil.closest(target, config.classname('.time-date-schedule-block')),
        getScheduleDataFunc,
        scheduleData

    if (!timeView || !blockElement) {
        return
    }
    if (this.planMode == 'normal') {
        const headerId = domutil.getData(timeView, 'id')
        this.day = moment(headerId).toDate()
    }
    var id = domutil.getData(blockElement, 'id')
    var plan = this.planMap[id]

    if (plan.isReadOnly) {
        return;
    }

    getScheduleDataFunc = this._getScheduleDataFunc = this.retriveScheduleData(timeView, this.day)
    scheduleData = this._dragStart = getScheduleDataFunc(
        dragStartEventData.originEvent, {
            plan: plan
        }
    )

    this.dragHandler.on({
        drag: this._onDrag,
        dragEnd: this._onDragEnd
    }, this)

    this.fire('timeMoveDragstart', scheduleData)
}

TimeMove.prototype._onDrag = function(dragEventData, overrideEventName, revise) {
    var getScheduleDataFunc = this._getScheduleDataFunc,
        timeView = this._getTimeView(dragEventData.target),
        dragStart = this._dragStart,
        scheduleData

    if (!timeView || !getScheduleDataFunc || !dragStart) {
        return
    }
    if (this.planMode == 'normal') {
        const headerId = domutil.getData(timeView, 'id')
        this.day = moment(headerId).toDate()
    }
    scheduleData = getScheduleDataFunc(dragEventData.originEvent, {
        currentView: timeView,
    })

    if (revise) {
        revise(scheduleData)
    }

    this.fire(overrideEventName || 'timeMoveDrag', scheduleData)
}

TimeMove.prototype._updateSchedule = function(scheduleData) {
    var plan = this._dragStart.plan,
        currentView = scheduleData.currentView,
        newStarts,
        newEnds

    if (!plan || !currentView) {
        return false
    }

    newStarts = plan.start
    newEnds = plan.end

    if (this.planMode == 'normal') {
        const day = moment(this.day).format('YYYY-MM-DD')
        const start = moment(newStarts).format('HH:mm:ss.SSS')
        const end = moment(newEnds).format('HH:mm:ss.SSS')
        newStarts = moment(`${day}T${start}`).toDate()
        newEnds = moment(`${day}T${end}`).toDate()
    }

    const headerId = domutil.getData(currentView, 'id')
    
    this.fire('beforeUpdateSchedule', {
        schedule: plan,
        start: newStarts,
        end: newEnds,
        headerId: headerId,
    })
    return true
}

TimeMove.prototype._onDragEnd = function(dragEndEventData) {
    var getScheduleDataFunc = this._getScheduleDataFunc,
        currentView = this._getTimeView(dragEndEventData.target),
        dragStart = this._dragStart,
        scheduleData

    this.dragHandler.off({
        drag: this._onDrag,
        dragEnd: this._onDragEnd
    }, this)

    if (!getScheduleDataFunc || !dragStart) {
        return
    }
    if (this.planMode == 'normal') {
        const headerId = domutil.getData(currentView, 'id')
        this.day = moment(headerId).toDate()
    }
    scheduleData = getScheduleDataFunc(dragEndEventData.originEvent, {
        currentView: currentView,
    })

    scheduleData.range = [
        dragStart.timeY,
        scheduleData.timeY
    ]

    scheduleData.nearestRange = [
        dragStart.nearestGridTimeY,
        scheduleData.nearestGridTimeY
    ]

    scheduleData.doShow = !this._updateSchedule(scheduleData)

    this.fire('timeMoveDragend', scheduleData)
}

TimeCore.mixin(TimeMove)
CustomEvents.mixin(TimeMove)

