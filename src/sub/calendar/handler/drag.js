import * as util from '../wcutil'
import { domutil } from '../common/domutil'
import { domevent } from '../common/domevent'
import { CustomEvents}  from '../customEvents'

export function Drag(options, container) {
    this.options = util.extend({
        distance: 10,
        exclude: null
    }, options)
    this.container = container
    this._cancelled = false
    this._isMoved = false
    this._distance = 0
    this._dragStartFired = false
    this._dragStartEventData = null
    domevent.on(container, 'mousedown', this._onMouseDown, this)
}

Drag.prototype.destroy = function() {
    domevent.off(this.container, 'mousedown', this._onMouseDown, this)
    this._isMoved = null
    this.container = null
}

Drag.prototype._clearData = function() {
    this._cancelled = false
    this._distance = 0
    this._isMoved = false
    this._dragStartFired = false
    this._dragStartEventData = null
}

Drag.prototype._toggleDragEvent = function(toBind) {
    var container = this.container,
        domMethod,
        method

    if (toBind) {
        domMethod = 'on'
        method = 'disable'
    } else {
        domMethod = 'off'
        method = 'enable'
    }

    domutil[method + 'TextSelection'](container)
    domutil[method + 'ImageDrag'](container)
    domevent[domMethod](global.document, {
        mousemove: this._onMouseMove,
        mouseup: this._onMouseUp
    }, this)
}

Drag.prototype._getEventData = function(mouseEvent) {
    return {
        target: mouseEvent.target || mouseEvent.srcElement,
        originEvent: mouseEvent
    }
}

Drag.prototype._onMouseDown = function(mouseDownEvent) {
    var opt = this.options,
        target = (mouseDownEvent.srcElement || mouseDownEvent.target)

    // only primary button can start drag.
    if (domevent.getMouseButton(mouseDownEvent) !== 0) {
        return
    }

    if (opt.exclude && opt.exclude(target)) {
        this._cancelled = true

        return
    }

    this._clearData()
    this._dragStartEventData = this._getEventData(mouseDownEvent)

    this._toggleDragEvent(true)

    this.fire('mousedown', this._dragStartEventData)
}

Drag.prototype._onMouseMove = function(mouseMoveEvent) {
    var distance

    if (this._cancelled) {
        this._clearData()

        return
    }

    distance = this.options.distance
    // prevent automatic scrolling.
    domevent.preventDefault(mouseMoveEvent)

    if (this._distance < distance) {
        this._distance += 1

        return
    }
    this._isMoved = true

    if (!this._dragStartFired) {
        this._dragStartFired = true

        if (!this.invoke('dragStart', this._dragStartEventData)) {
            this._toggleDragEvent(false)
            this._clearData()

            return
        }
    }

    this.fire('drag', this._getEventData(mouseMoveEvent))
}

Drag.prototype._onMouseUp = function(mouseUpEvent) {
    if (this._cancelled) {
        return
    }

    this._toggleDragEvent(false)

    // emit "click" event when not emitted drag event between mousedown and mouseup.
    if (this._isMoved) {
        this._isMoved = false

        this.fire('dragEnd', this._getEventData(mouseUpEvent))
    } else {
        this.fire('click', this._getEventData(mouseUpEvent))
    }

    this._clearData()
}

CustomEvents.mixin(Drag)
