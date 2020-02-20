
var config = require('../../config').config;
var domutil = require('../../common/domutil').domutil;
var reqAnimFrame = require('../../common/reqAnimFrame').reqAnimFrame;

/**
 * Class for Time.Resize effect.
 * @constructor
 * @param {TimeResize} timeResize - the instance of TimeResize handler.
 */
export function TimeResizeGuide(timeResize) {
    /**
     * @type {HTMLElement}
     */
    this.guideElement = null;

    /**
     * @type {TimeResize}
     */
    this.timeResize = timeResize;

    /**
     * @type {function}
     */
    this._getTopFunc = null;

    /**
     * @type {HTMLElement}
     */
    this._originScheduleElement = null;

    /**
     * @type {number}
     */
    this._startTopPixel = 0;

    /**
     * @type {number}
     */
    this._startHeightPixel = 0;

    /**
     * @type {number}
     */
    this._startGridY = 0;

    /**
     * @type {Schedule}
     */
    this._plan = null;

    timeResize.on({
        'timeResizeDragstart': this._onDragStart,
        'timeResizeDrag': this._onDrag,
        'timeResizeDragend': this._clearGuideElement,
        'timeResizeClick': this._clearGuideElement
    }, this);
}

/**
 * Destroy method
 */
TimeResizeGuide.prototype.destroy = function() {
    this._clearGuideElement();
    this.timeResize.off(this);
    this.guideElement = this.timeResize = this._getTopFunc =
        this._originScheduleElement = this._startHeightPixel =
        this._startGridY = this._startTopPixel = null;
};

/**
 * Clear guide element.
 */
TimeResizeGuide.prototype._clearGuideElement = function() {
    var guideElement = this.guideElement,
        originElement = this._originScheduleElement;

    // if (!util.browser.msie) {
        domutil.removeClass(global.document.body, config.classname('resizing'));
    // }

    if (originElement) {
        originElement.style.display = 'block';
    }

    domutil.remove(guideElement);

    this.guideElement = this._getTopFunc = this._originScheduleElement =
        this._startHeightPixel = this._startGridY = this._startTopPixel = null;
};

/**
 * Refresh guide element
 * @param {number} guideHeight - guide element's style height.
 * @param {number} minTimeHeight - time element's min height
 * @param {number} timeHeight - time element's height.
 */
TimeResizeGuide.prototype._refreshGuideElement = function(guideHeight, minTimeHeight, timeHeight) {
    var guideElement = this.guideElement;
    var timeElement;

    if (!guideElement) {
        return;
    }

    timeElement = domutil.find(config.classname('.time-schedule-content-time'), guideElement);

    reqAnimFrame.requestAnimFrame(function() {
        guideElement.style.height = guideHeight + 'px';
        guideElement.style.display = 'block';

        if (timeElement) {
            timeElement.style.height = timeHeight + 'px';
            timeElement.style.minHeight = minTimeHeight + 'px';
        }
    });
};

/**
 * TimeMove#timeMoveDragstart event handler
 * @param {object} dragStartEventData - dragstart event data
 */
TimeResizeGuide.prototype._onDragStart = function(dragStartEventData) {
    var originElement = domutil.closest(
            dragStartEventData.target,
            config.classname('.time-date-schedule-block')
        ),
        plan = dragStartEventData.plan,
        guideElement;

    // if (!util.browser.msie) {
        domutil.addClass(global.document.body, config.classname('resizing'));
    // }

    if (!originElement || !plan) {
        return;
    }

    this._startGridY = dragStartEventData.nearestGridY;
    this._startHeightPixel = parseFloat(originElement.style.height);
    this._startTopPixel = parseFloat(originElement.style.top);

    this._originScheduleElement = originElement;
    this._plan = plan

    guideElement = this.guideElement = originElement.cloneNode(true);
    domutil.addClass(guideElement, config.classname('time-guide-resize'));

    originElement.style.display = 'none';
    dragStartEventData.relatedView.appendChild(guideElement);
};

/**
 * @param {object} dragEventData - event data from Drag#drag.
 */
TimeResizeGuide.prototype._onDrag = function(dragEventData) {
    var timeView = dragEventData.relatedView,
        viewOptions = timeView.options,
        viewHeight = domutil.getSize(timeView)[1],
        hourLength = 24,
        guideElement = this.guideElement,
        guideTop = parseFloat(guideElement.style.top),
        gridYOffset = dragEventData.nearestGridY - this._startGridY,
        // hourLength : viewHeight = gridYOffset : X;
        gridYOffsetPixel = viewHeight * gridYOffset / hourLength,
        modelDuration = (this._plan.end - this._plan.start) / 60 * 1000,
        minutesLength = hourLength * 60,
        timeHeight,
        timeMinHeight,
        minHeight,
        maxHeight,
        height;

    height = (this._startHeightPixel + gridYOffsetPixel);
    // at least large than 30min from plan start time.
    minHeight = guideTop + viewHeight * 0.5 / hourLength;
    minHeight -= this._startTopPixel;
    timeMinHeight = minHeight;
    // smaller than 24h
    maxHeight = viewHeight - guideTop;

    height = Math.max(height, minHeight);
    height = Math.min(height, maxHeight);

    timeHeight = viewHeight * modelDuration / minutesLength + gridYOffsetPixel;

    this._refreshGuideElement(height, timeMinHeight, timeHeight);
};

// module.exports = TimeResizeGuide;
