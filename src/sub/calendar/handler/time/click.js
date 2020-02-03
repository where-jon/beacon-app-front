/**
 * @fileoverview Allday event click event hander module
 * @author NHN FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

import * as util from '../../wcutil'
var config = require('../../config').config;
var domutil = require('../../common/domutil').domutil;
import { CustomEvents}  from '../../customEvents'

/**
 * @constructor
 * @implements {Handler}
 * @mixes util.CustomEvents
 * @param {Drag} [dragHandler] - Drag handler instance.
 * @param {TimeGrid} [timeGridView] - TimeGrid view instance.
 * @param {Base} [baseController] - Base controller instance.
 */
export function TimeClick(dragHandler, timeLineElmMap, planMap) {
    this.timeLineElmMap = timeLineElmMap;
    this.planMap = planMap;
    /**
     * @type {Drag}
     */
    this.dragHandler = dragHandler;

    dragHandler.on({
        'click': this._onClick
    }, this);
}

/**
 * Destroy method
 */
TimeClick.prototype.destroy = function() {
    this.dragHandler.off(this);
    this.dragHandler = null;
};

/**
 * Check target element is expected condition for activate this plugins.
 * @param {HTMLElement} target - The element to check
 * @returns {string} - model id
 */
TimeClick.prototype.checkExpectCondition = function(target) {
    var container,
        matches;

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

/**
 * Click event hander
 * @param {object} clickEvent - click event from {@link Drag}
 * @emits TimeClick#clickEvent
 */
TimeClick.prototype._onClick = function(clickEvent) {
    var self = this,
        target = clickEvent.target,
        timeView = this.checkExpectCondition(target),
        blockElement = domutil.closest(target, config.classname('.time-date-schedule-block'));

    if (!timeView || !blockElement) {
        return;
    }

    var targetModelID = domutil.getData(blockElement, 'id');
    var targetModel = this.planMap[targetModelID];
    const roomId = domutil.getData(timeView, 'id');
    
    self.fire('clickSchedule', {
        schedule: targetModel,
        event: clickEvent.originEvent,
        roomId: roomId,
    });
};

CustomEvents.mixin(TimeClick);
