import * as util from '../../wcutil'
import moment from 'moment'
import {config} from '../../config'
import {domutil} from '../../common/domutil'
import {TimeCore} from './core'
import {TimeResizeGuide} from './resizeGuide'
import {CustomEvents}  from '../../customEvents'

export function TimeResize(planMode, dragHandler, timeLineElmMap, planMap, day) {
    this.planMode = planMode
    this.planMap = planMap;
    this.timeLineElmMap = timeLineElmMap;
    this.day = day;
    this.dragHandler = dragHandler;
    this._getScheduleDataFunc = null;
    this._dragStart = null;
    this._guide = new TimeResizeGuide(this);

    dragHandler.on('dragStart', this._onDragStart, this);
}

TimeResize.prototype.destroy = function() {
    this._guide.destroy();
    this.dragHandler.off(this);
    this.dragHandler = this._getScheduleDataFunc = this._dragStart = this._guide = null;
};

TimeResize.prototype.checkExpectCondition = function(target) {
    var container,
        matches;

    if (!domutil.hasClass(target, config.classname('time-resize-handle'))) {
        return false;
    }

    container = domutil.closest(target, config.classname('.time-date'));

    if (!container) {
        return false;
    }

    matches = domutil.getClass(container).match(config.time.getViewIDRegExp);

    if (!matches) {
        return false;
    }

    const headerId = domutil.getData(container, 'id')
    return util.pick(this.timeLineElmMap, headerId);
};

TimeResize.prototype._onDragStart = function(dragStartEventData) {
    var target = dragStartEventData.target,
        timeView = this.checkExpectCondition(target),
        blockElement = domutil.closest(target, config.classname('.time-date-schedule-block')),
        getScheduleDataFunc,
        scheduleData;

    if (!timeView || !blockElement) {
        return;
    }
    if (this.planMode == 'normal') {
        const headerId = domutil.getData(timeView, 'id')
        this.day = moment(headerId).toDate()
    }
    var id = domutil.getData(blockElement, 'id');
    var plan = this.planMap[id];

    if (plan.isReadOnly) {
        return;
    }

    getScheduleDataFunc = this._getScheduleDataFunc = this.retriveScheduleData(timeView, this.day);
    scheduleData = this._dragStart = getScheduleDataFunc(
        dragStartEventData.originEvent, {
            plan: plan
        }
    );

    this.dragHandler.on({
        drag: this._onDrag,
        dragEnd: this._onDragEnd,
        click: this._onClick
    }, this);

    this.fire('timeResizeDragstart', scheduleData);
};

TimeResize.prototype._onDrag = function(dragEventData, overrideEventName, revise) {
    var getScheduleDataFunc = this._getScheduleDataFunc,
        startScheduleData = this._dragStart,
        scheduleData;

    if (!getScheduleDataFunc || !startScheduleData) {
        return;
    }

    scheduleData = getScheduleDataFunc(dragEventData.originEvent);

    if (revise) {
        revise(scheduleData);
    }

    this.fire(overrideEventName || 'timeResizeDrag', scheduleData);
};

TimeResize.prototype._updateSchedule = function(scheduleData) {
    var range = scheduleData.nearestRange,
        timeDiff = range[1] - range[0],
        plan = this._dragStart.plan,
        relatedView = scheduleData.relatedView,
        dateEnd,
        newEnds;

    if (!plan) {
        return;
    }

    timeDiff -= 30 * 60 * 1000
    dateEnd = moment(this.day).set({hour:23,minute:59,second:59,millisecond:999}).toDate()
    newEnds = moment(plan.end).add(timeDiff / (60 * 1000), 'm').toDate()

    if (newEnds > dateEnd) {
        newEnds = dateEnd
    }

    if (newEnds - plan.start < 30 * 60 * 1000) {
        newEnds = moment(plan.start).add(30, 'm').toDate()
    }

    const headerId = domutil.getData(relatedView, 'id');

    this.fire('beforeUpdateSchedule', {
        schedule: plan,
        start: plan.start,
        end: newEnds,
        headerId: headerId,
    });
};

TimeResize.prototype._onDragEnd = function(dragEndEventData) {
    var getScheduleDataFunc = this._getScheduleDataFunc,
        dragStart = this._dragStart,
        scheduleData;

    this.dragHandler.off({
        drag: this._onDrag,
        dragEnd: this._onDragEnd,
        click: this._onClick
    }, this);

    if (!getScheduleDataFunc || !dragStart) {
        return;
    }

    scheduleData = getScheduleDataFunc(dragEndEventData.originEvent);

    scheduleData.range = [
        dragStart.timeY,
        moment(scheduleData.timeY).add(30, 'm').toDate()
    ];

    scheduleData.nearestRange = [
        dragStart.nearestGridTimeY,
        moment(scheduleData.nearestGridTimeY).add(30, 'm').toDate()
    ];

    this._updateSchedule(scheduleData);

    this.fire('timeResizeDragend', scheduleData);

    this._getScheduleDataFunc = this._dragStart = null;
};

TimeResize.prototype._onClick = function() {
    this.dragHandler.off({
        drag: this._onDrag,
        dragEnd: this._onDragEnd,
        click: this._onClick
    }, this);

    this.fire('timeResizeClick');
};

TimeCore.mixin(TimeResize);
CustomEvents.mixin(TimeResize);
