import * as util from './wcutil'

var R_EVENTNAME_SPLIT = /\s+/g;

export function CustomEvents() {
    this.events = null;
    this.contexts = null;
}

CustomEvents.mixin = function(func) {
    Object.assign(func.prototype, CustomEvents.prototype);
};

CustomEvents.prototype._getHandlerItem = function(handler, context) {
    var item = {handler: handler};

    if (context) {
        item.context = context;
    }

    return item;
};

CustomEvents.prototype._safeEvent = function(eventName) {
    var events = this.events;
    var byName;

    if (!events) {
        events = this.events = {};
    }

    if (eventName) {
        byName = events[eventName];

        if (!byName) {
            byName = [];
            events[eventName] = byName;
        }

        events = byName;
    }

    return events;
};

CustomEvents.prototype._safeContext = function() {
    var context = this.contexts;

    if (!context) {
        context = this.contexts = [];
    }

    return context;
};

CustomEvents.prototype._indexOfContext = function(ctx) {
    var context = this._safeContext();
    var index = 0;

    while (context[index]) {
        if (ctx === context[index][0]) {
            return index;
        }

        index += 1;
    }

    return -1;
};

CustomEvents.prototype._memorizeContext = function(ctx) {
    var context, index;

    if (!util.isExisty(ctx)) {
        return;
    }

    context = this._safeContext();
    index = this._indexOfContext(ctx);

    if (index > -1) {
        context[index][1] += 1;
    } else {
        context.push([ctx, 1]);
    }
};

CustomEvents.prototype._forgetContext = function(ctx) {
    var context, contextIndex;

    if (!util.isExisty(ctx)) {
        return;
    }

    context = this._safeContext();
    contextIndex = this._indexOfContext(ctx);

    if (contextIndex > -1) {
        context[contextIndex][1] -= 1;

        if (context[contextIndex][1] <= 0) {
            context.splice(contextIndex, 1);
        }
    }
};

CustomEvents.prototype._bindEvent = function(eventName, handler, context) {
    var events = this._safeEvent(eventName);
    this._memorizeContext(context);
    events.push(this._getHandlerItem(handler, context));
};

CustomEvents.prototype.on = function(eventName, handler, context) {
    var self = this;

    if (util.isString(eventName)) {
        // [syntax 1, 2]
        eventName = eventName.split(R_EVENTNAME_SPLIT);
        util.forEach(eventName, function(name) {
            self._bindEvent(name, handler, context);
        });
    } else if (util.isObject(eventName)) {
        // [syntax 3, 4]
        context = handler;
        util.forEach(eventName, function(func, name) {
            self.on(name, func, context);
        });
    }
};

CustomEvents.prototype.once = function(eventName, handler, context) {
    var self = this;

    if (util.isObject(eventName)) {
        context = handler;
        util.forEach(eventName, function(func, name) {
            self.once(name, func, context);
        });

        return;
    }

    function onceHandler() { // eslint-disable-line require-jsdoc
        handler.apply(context, arguments);
        self.off(eventName, onceHandler, context);
    }

    this.on(eventName, onceHandler, context);
};

CustomEvents.prototype._spliceMatches = function(arr, predicate) {
    var i = 0;
    var len;

    if (!util.isArray(arr)) {
        return;
    }

    for (len = arr.length; i < len; i += 1) {
        if (predicate(arr[i]) === true) {
            arr.splice(i, 1);
            len -= 1;
            i -= 1;
        }
    }
};

CustomEvents.prototype._matchHandler = function(handler) {
    var self = this;

    return function(item) {
        var needRemove = handler === item.handler;

        if (needRemove) {
            self._forgetContext(item.context);
        }

        return needRemove;
    };
};

CustomEvents.prototype._matchContext = function(context) {
    var self = this;

    return function(item) {
        var needRemove = context === item.context;

        if (needRemove) {
            self._forgetContext(item.context);
        }

        return needRemove;
    };
};

CustomEvents.prototype._matchHandlerAndContext = function(handler, context) {
    var self = this;

    return function(item) {
        var matchHandler = (handler === item.handler);
        var matchContext = (context === item.context);
        var needRemove = (matchHandler && matchContext);

        if (needRemove) {
            self._forgetContext(item.context);
        }

        return needRemove;
    };
};

CustomEvents.prototype._offByEventName = function(eventName, handler) {
    var self = this;
    var forEach = util.forEachArray;
    var andByHandler = util.isFunction(handler);
    var matchHandler = self._matchHandler(handler);

    eventName = eventName.split(R_EVENTNAME_SPLIT);

    forEach(eventName, function(name) {
        var handlerItems = self._safeEvent(name);

        if (andByHandler) {
            self._spliceMatches(handlerItems, matchHandler);
        } else {
            forEach(handlerItems, function(item) {
                self._forgetContext(item.context);
            });

            self.events[name] = [];
        }
    });
};

CustomEvents.prototype._offByHandler = function(handler) {
    var self = this;
    var matchHandler = this._matchHandler(handler);

    util.forEach(this._safeEvent(), function(handlerItems) {
        self._spliceMatches(handlerItems, matchHandler);
    });
};

CustomEvents.prototype._offByObject = function(obj, handler) {
    var self = this;
    var matchFunc;

    if (this._indexOfContext(obj) < 0) {
        util.forEach(obj, function(func, name) {
            self.off(name, func);
        });
    } else if (util.isString(handler)) {
        matchFunc = this._matchContext(obj);

        self._spliceMatches(this._safeEvent(handler), matchFunc);
    } else if (util.isFunction(handler)) {
        matchFunc = this._matchHandlerAndContext(handler, obj);

        util.forEach(this._safeEvent(), function(handlerItems) {
            self._spliceMatches(handlerItems, matchFunc);
        });
    } else {
        matchFunc = this._matchContext(obj);

        util.forEach(this._safeEvent(), function(handlerItems) {
            self._spliceMatches(handlerItems, matchFunc);
        });
    }
};

CustomEvents.prototype.off = function(eventName, handler) {
    if (util.isString(eventName)) {
        // [syntax 1, 2]
        this._offByEventName(eventName, handler);
    } else if (!arguments.length) {
        // [syntax 8]
        this.events = {};
        this.contexts = [];
    } else if (util.isFunction(eventName)) {
        // [syntax 3]
        this._offByHandler(eventName);
    } else if (util.isObject(eventName)) {
        // [syntax 4, 5, 6]
        this._offByObject(eventName, handler);
    }
};

CustomEvents.prototype.fire = function(eventName) {  // eslint-disable-line
    this.invoke.apply(this, arguments);
};

CustomEvents.prototype.invoke = function(eventName) {
    var events, args, index, item;

    if (!this.hasListener(eventName)) {
        return true;
    }

    events = this._safeEvent(eventName);
    args = Array.prototype.slice.call(arguments, 1);
    index = 0;

    while (events[index]) {
        item = events[index];

        if (item.handler.apply(item.context, args) === false) {
            return false;
        }

        index += 1;
    }

    return true;
};

CustomEvents.prototype.hasListener = function(eventName) {
    return this.getListenerLength(eventName) > 0;
};

CustomEvents.prototype.getListenerLength = function(eventName) {
    var events = this._safeEvent(eventName);

    return events.length;
};