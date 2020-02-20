var lastId = 0;

export function stamp(obj) {
  if (!obj.__fe_id) {
      lastId += 1;
      obj.__fe_id = lastId; // eslint-disable-line camelcase
  }

  return obj.__fe_id;
}

export function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

export function forEach(obj, iteratee, context) {
  if (Array.isArray(obj)) {
      forEachArray(obj, iteratee, context);
  } else {
      forEachOwnProperties(obj, iteratee, context);
  }
}

export function forEachArray(arr, iteratee, context) {
  var index = 0;
  var len = arr.length;

  context = context || null;

  for (; index < len; index += 1) {
      if (iteratee.call(context, arr[index], index, arr) === false) {
          break;
      }
  }
}

export function forEachOwnProperties(obj, iteratee, context) {
  var key;

  context = context || null;

  for (key in obj) {
      if (obj.hasOwnProperty(key)) {
          if (iteratee.call(context, obj[key], key, obj) === false) {
              break;
          }
      }
  }
}

export function keys(obj) {
  var keyArray = [];
  var key;

  for (key in obj) {
      if (obj.hasOwnProperty(key)) {
          keyArray.push(key);
      }
  }

  return keyArray;
}

export function isObject(obj) {
  return obj === Object(obj);
}

export function isUndefined(obj) {
  return obj === undefined; // eslint-disable-line no-undefined
}

export function extend(target, objects) { // eslint-disable-line no-unused-vars
  var hasOwnProp = Object.prototype.hasOwnProperty;
  var source, prop, i, len;

  for (i = 1, len = arguments.length; i < len; i += 1) {
      source = arguments[i];
      for (prop in source) {
          if (hasOwnProp.call(source, prop)) {
              target[prop] = source[prop];
          }
      }
  }

  return target;
}

export 	function isFunction(obj) {
  return obj instanceof Function;
}

export function isNumber(obj) {
  return typeof obj === 'number' || obj instanceof Number;
}

export function isNull(obj) {
  return obj === null;
}

export function isExisty(param) {
  return !isUndefined(param) && !isNull(param);
}

export function inArray(searchElement, array, startIndex) {
  var i;
  var length;
  startIndex = startIndex || 0;

  if (!Array.isArray(array)) {
      return -1;
  }

  if (Array.prototype.indexOf) {
      return Array.prototype.indexOf.call(array, searchElement, startIndex);
  }

  length = array.length;
  for (i = startIndex; startIndex >= 0 && i < length; i += 1) {
      if (array[i] === searchElement) {
          return i;
      }
  }

  return -1;
};

export function map(obj, iteratee, context) {
  var resultArray = [];

  context = context || null;

  forEach(obj, function() {
      resultArray.push(iteratee.apply(context, arguments));
  });

  return resultArray;
}

export function pick(obj, paths) { // eslint-disable-line no-unused-vars
  var args = arguments;
  var target = args[0];
  var i = 1;
  var length = args.length;

  for (; i < length; i += 1) {
      if (isUndefined(target) ||
          isNull(target)) {
          return;
      }

      target = target[args[i]];
  }

  return target; // eslint-disable-line consistent-return
}

export function isArray(obj) {
  return obj instanceof Array;
}

export function bind(fn, obj) {
  var slice = Array.prototype.slice;
  var args;

  if (fn.bind) {
      return fn.bind.apply(fn, slice.call(arguments, 1));
  }

  /* istanbul ignore next */
  args = slice.call(arguments, 2);

  /* istanbul ignore next */
  return function() {
      /* istanbul ignore next */
      return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
  };
}

export function limitDate(date, min, max) {
  if (date < min) {
      return min;
  }
  if (date > max) {
      return max;
  }

  return date;
}

export function limit(value, minArr, maxArr) {
  var v = Math.max.apply(null, [value].concat(minArr));
  v = Math.min.apply(null, [v].concat(maxArr));

  return v;
}