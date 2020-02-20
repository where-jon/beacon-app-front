import * as util from '../../wcutil'
import moment from 'moment'
import {config} from '../../config'
import {domutil} from '../../common/domutil'
import {reqAnimFrame} from '../../common/reqAnimFrame'

export function TimeMoveGuide(timeMove) {
    this.plan = null;
    this._lastDrag = null;
    this.guideElement = null;
    this.guideElementt = null;
    this.timeMove = timeMove;
    this._container = null;
    this._startGridY = 0;
    this._startTopPixel = 0;
    this._styleUnit = null
    this._styleStart = null

    timeMove.on({
        'timeMoveDragstart': this._onDragStart,
        'timeMoveDrag': this._onDrag,
        'timeMoveDragend': this._clearGuideElement,
    }, this);
}

/**
 * Destroy method
 */
TimeMoveGuide.prototype.destroy = function() {
    this._clearGuideElement();
    this._showOriginScheduleBlocks();
    this.timeMove.off(this);
    this.guideElement = this.timeMove = this._container = this._lastDrag =
        this._startGridY = this._startTopPixel = null;
};

TimeMoveGuide.prototype._clearGuideElement = function(scheduleData) {
    var guideElement = this.guideElementt
        // timeElement = this.guideTimeElement;

    domutil.remove(guideElement);

    reqAnimFrame.requestAnimFrame(function() {
        if (!guideElement) {
            return
        }
        guideElement.style.display = 'none';
        guideElement.style.top = '';
        guideElement.style.height = '';
        // timeElement.innerHTML = '';
    });
    if (scheduleData && scheduleData.doShow) {
        this._showOriginScheduleBlocks();
    }
};

/**
 * Dim element blocks
 * @param {number} modelID - Schedule model instance ID
 */
TimeMoveGuide.prototype._hideOriginScheduleBlocks = function() {
    var className = config.classname('time-date-schedule-block-dragging-dim');
    if (this.guideElement) {
        domutil.addClass(this.guideElement, className);
    }
};

/**
 * Show element blocks
 */
TimeMoveGuide.prototype._showOriginScheduleBlocks = function() {
    var className = config.classname('time-date-schedule-block-dragging-dim');
    if (this.guideElement) {
        domutil.removeClass(this.guideElement, className);
    }
};

TimeMoveGuide.prototype._onDragStart = function(dragStartEventData) {
    var guideElement = domutil.closest(
        dragStartEventData.target,
        config.classname('.time-date-schedule-block')
    );
    if (!guideElement) {
        return;
    }
    this.guideElement = guideElement;
    this._startTopPixel = parseFloat(guideElement.style.top);
    this._container = dragStartEventData.relatedView;
    this.plan = dragStartEventData.plan
    this._startGridY = dragStartEventData.nearestGridY;
    this._lastDrag = dragStartEventData;
    this.guideElementt = this._aaa();
    var unitData = this._styleUnit = this._getUnitData(this._container);
    var styleData = this._styleStart = [guideElement.style.top, this.plan.start, this.plan.end];  

    var start = styleData[1];
    var end = styleData[2];
    var top = styleData[0];
    var height = parseFloat(this.guideElement.style.height)
    
    var result = this._limitStyleData(
        top,
        height,
        start,
        end
    );

    this._refreshGuideElement.apply(this, result);

    this._container.appendChild(this.guideElementt);
    this._hideOriginScheduleBlocks();
}

TimeMoveGuide.prototype._onDrag = function(dragEventData) {
    var timeView = dragEventData.currentView,
        unitData = this._styleUnit,
        startStyle = this._styleStart,
        refreshGuideElement = this._refreshGuideElement.bind(this),
        heightOfHalfHour,
        endStyle,
        result;

    if (!unitData || !startStyle) {
        this._showOriginScheduleBlocks();
        return;
    }
    
    var gridYOffset = dragEventData.nearestGridY - this._startGridY
    var gridYOffsetPixel = (unitData[0] * gridYOffset) / unitData[1]
    var gridDiff = dragEventData.nearestGridY - this._lastDrag.nearestGridY
    var top = this._startTopPixel + gridYOffsetPixel;
    var height = parseFloat(this.guideElement.style.height)
    var start = moment(this.plan.start).add(gridDiff * 60, 'm').toDate()
    var end = moment(this.plan.end).add(gridDiff * 60, 'm').toDate()
    
    var timeViewChanged = false
    if (this._container !== timeView) {
        this._container = timeView;
        this._clearGuideElement()
        this._container.appendChild(this.guideElementt);
        timeViewChanged = true
    }
    var result = this._limitStyleData(
        top,
        height,
        start,
        end,
        timeViewChanged
    );
    this.plan.start = result[2]
    this.plan.end = result[3]
    this._lastDrag = dragEventData;
    
    reqAnimFrame.requestAnimFrame(function() {
        refreshGuideElement.apply(null, result);
    });
};

TimeMoveGuide.prototype._getUnitData = function(relatedView) {
    var viewHeight,
    hourLength = 24,
    todayStart = this.timeMove.day,
    todayEnd = moment(new Date(todayStart)).add(1, 'd').add(-1, 's').toDate();
    
    viewHeight = relatedView.style.height;
    if (!viewHeight) {
        viewHeight = parseInt(document.defaultView.getComputedStyle(relatedView, null)['height'].replace('px', ''));
    }

    // [0] height of view
    // [1] hour length of view
    // [2] start time of view
    // [3] end time of view
    // [4] height of view for one hour
    return [
        viewHeight,
        hourLength,
        todayStart,
        todayEnd,
        viewHeight / hourLength
    ];
};

TimeMoveGuide.prototype._limitStyleData = function(top, height, start, end, timeViewChanged = false) {
    var unitData = this._styleUnit;
    var duration = end - start;
    top = util.limit(top, [0], [unitData[0]]);
    height = util.limit(top + height, [0], [unitData[0]]) - top;
    var oldStart = moment(this.plan.start).set({hour:0,minute:0,second:0,millisecond:0})
    var newStart = moment(start).set({hour:0,minute:0,second:0,millisecond:0})
    var newEnd = moment(end).set({hour:0,minute:0,second:0,millisecond:0})
    if (!timeViewChanged) {
        if (!oldStart.isSame(newStart) || !oldStart.isSame(newEnd)) {
            if (newStart.isBefore(oldStart)) {
                start = oldStart.toDate()
                end = moment(start).add(duration / (60 * 1000), 'm').toDate()
            } else {
                end = moment(oldStart).set({hour:23,minute:59,second:59,millisecond:999})
                start = moment(end).add((-duration + 1) / (60 * 1000), 'm').toDate()
            }
        }
    } else {
        if (!newStart.isSame(newEnd)) {
            start = this.plan.start
            end = this.plan.end
        }
    }
    return [top, height, start, end];
};

TimeMoveGuide.prototype._refreshGuideElement = function(top, height) {
    var guideElement = this.guideElementt;
    guideElement.style.top = top + 'px';
    guideElement.style.height = height + 'px';
    guideElement.style.display = 'block';
};

TimeMoveGuide.prototype._aaa = function() {
    const w = this._container.getBoundingClientRect().width
    const h = this.guideElement.style.height
    const d = document.createElement('div');
    d.style.width = util.isNumber(w) ? w + 'px' : w
    d.style.height = util.isNumber(h) ? h + 'px' : h
    d.style.position = 'absolute';
    const d1 = document.createElement('div');
    domutil.addClass(d1, config.classname('time-date-schedule-block'));
    domutil.setData(d1, 'id', this.plan.id);
    d1.style.width = '100%';
    d1.style.height = '100%';
    const d2 = document.createElement('div');
    domutil.addClass(d2, config.classname('time-schedule'));
    domutil.addClass(d2, config.classname('time-date-schedule-block-focused'));
    d2.style.fontSize = '1rem';
    d2.style.color = this.plan.color;
    d2.style['background-color'] = this.plan.dragBgColor;
    const d3 = document.createElement('div');
    domutil.addClass(d3, config.classname('time-schedule-content'));
    d3.style.height = '100%';
    d3.innerHTML = this.plan.title;
    const d5 = document.createElement('div');
    domutil.addClass(d5, config.classname('time-date-schedule-block-cover'));
    d2.appendChild(d5);
    d2.appendChild(d3);
    d1.appendChild(d2);
    d.appendChild(d1);
    return d
}

