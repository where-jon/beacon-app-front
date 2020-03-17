import * as normal from './normal'
import * as mr from './meetingRoom'
import * as mrc from './meetingRoomCompare'
import * as util from './wcutil'
import {DISP} from '../constant/config'
import * as chroma from 'chroma-js'

export function loadTimeLine(planMode, data, currentUser, dupMessage, headerOpts, doCompare, currentUserPotIds) {
  const basicColorMap = createBasicColorMap(data, currentUserPotIds)
  let planMap, timeLineMap
  if  (planMode == 'normal') {
    [planMap, timeLineMap] = normal.loadTimeLine(data, currentUser, dupMessage, basicColorMap)
  } else {
    if (doCompare) {
      [planMap, timeLineMap] = mrc.loadTimeLine(data)
    } else {
      [planMap, timeLineMap] = mr.loadTimeLine(data, currentUser, dupMessage, basicColorMap)
    }
  }
  let key = null
  for (key in timeLineMap) {
    const planCards = timeLineMap[key].sort(scheduleASC)
    const collisionGroups = getCollisionGroup(planCards)
    const matrices = getMatrices(planMap, collisionGroups)
    getCollides(matrices)
    timeLineMap[key] = matrices
  }
  const viewModel = {}
  viewModel.timeLineMap = timeLineMap
  viewModel.timeLineLeftAndWidth = getGridLeftAndWidth(headerOpts)
  viewModel.scheduleViewBoundsMap = getScheduleViewBoundsMap(timeLineMap)
  return [planMap, viewModel]
}

function createBasicColorMap(data, currentUserPotIds) {
  return data.reduce((accum, plansOfPot) => {
    const potId = plansOfPot.potId
    if (!potId || currentUserPotIds.includes(potId)) {
      accum.m[potId] = chroma(DISP.PLAN.PLAN_BG_COLOR)
    } else {
      accum.m[potId] = chroma.hsl(accum.hue, 0.95, 0.25)
      accum.hue = (accum.hue + accum.delta) % 360
    }
    return accum
  }, {m: {}, hue: 182, delta: 265}).m
}

export function scheduleASC(a, b) {
  const startsCompare = a.start.getTime() > b.start.getTime()
  if (startsCompare) {
      return startsCompare;
  }

  const durationA = a.end - a.start
  const durationB = b.end - b.start

  if (durationA < durationB) {
      return 1;
  }
  if (durationA > durationB) {
      return -1;
  }

  return 1
}

/**
 * search item index using binary search algorithm.
 *
 * the array must be sorted.
 * @param {array} arr array to search.
 * @param {(string|number|boolean)} search value to search.
 * @param {function} [fn] iteratee for retrieve each element's value to search.
 * @param {function} [compare] compare function for specific sort status. default is string ascending.
 * @returns {number} The number of item index searched. return negative number when no exist that item.
 * It can use insert index after Math.abs()
 * @example
 *
 * var arr = [1, 3, 7, 11, 15, 23];
 *
 * function sortNumber(a, b) {
 *     return a - b;
 * }
 *
 * bsearch(arr, 15, null, sortNumber);    // 4
 * bsearch(arr, 21, null, sortNumber);    // -5
 *
 * arr.splice(Math.abs(bsearch(arr, 21, null, sortNumber)), 0, 21);
 * // [1, 2, 7, 11, 15, 21, 23]
 */
export function bsearch(arr, search, fn, compare) {
  var minIndex = 0,
      maxIndex = arr.length - 1,
      currentIndex,
      value,
      comp;

  compare = compare || stringASC;

  while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0; // Math.floor
      value = fn ? fn(arr[currentIndex]) : arr[currentIndex];
      comp = compare(value, search);

      if (comp < 0) {
          minIndex = currentIndex + 1;
      } else if (comp > 0) {
          maxIndex = currentIndex - 1;
      } else {
          return currentIndex;
      }
  }

  return ~maxIndex;
}

export function numberASC(_a, _b) {
  var a = Number(_a),
      b = Number(_b);

  return a - b;
}

export function generateTimeArrayInRow(matrix) {
  var row,
      col,
      schedule,
      start,
      end,
      map = [],
      cursor = [],
      maxColLen = Math.max.apply(null, util.map(matrix, function(col) {
          return col.length;
      }));

  for (col = 1; col < maxColLen; col += 1) {
      row = 0;
      schedule = util.pick(matrix, row, col);

      while (schedule) {
          start = schedule.start
          end = schedule.end

          if (Math.abs(end - start) < SCHEDULE_MIN_DURATION) {
              end += SCHEDULE_MIN_DURATION;
          }

          cursor.push([start, end]);

          row += 1;
          schedule = util.pick(matrix, row, col);
      }

      map.push(cursor);
      cursor = [];
  }

  return map;
}

export function getCollides(matrices) {
  util.forEachArray(matrices, function(matrix) {
      var binaryMap,
          maxRowLength;

      binaryMap = generateTimeArrayInRow(matrix);
      maxRowLength = Math.max.apply(null, util.map(matrix, function(row) {
          return row.length;
      }));

      util.forEachArray(matrix, function(row) {
          util.forEachArray(row, function(viewModel, col) {
              var startTime,
                  endTime,
                  hasCollide,
                  i;

              if (!viewModel) {
                  return;
              }

              startTime = viewModel.start.getTime();
              endTime = viewModel.end.getTime();

              if (Math.abs(endTime - startTime) < SCHEDULE_MIN_DURATION) {
                  endTime += SCHEDULE_MIN_DURATION;
              }

              endTime -= 1;

              for (i = (col + 1); i < maxRowLength; i += 1) {
                  hasCollide = hasCollideFn(binaryMap[i - 1], startTime, endTime);

                  if (hasCollide) {
                      viewModel.hasCollide = true;
                      break;
                  }

                  viewModel.extraSpace += 1;
              }
          });
      });
  });
}

export function hasCollideFn(arr, start, end) {
  var startStart,
      startEnd,
      endStart,
      endEnd,
      getFunc = function(index) {
          return function(block) {
              return block[index];
          };
      },
      abs = Math.abs,
      compare = numberASC,
      hasCollide;

  if (!arr.length) {
      return false;
  }

  startStart = abs(bsearch(arr, start, getFunc(0), compare));
  startEnd = abs(bsearch(arr, start, getFunc(1), compare));
  endStart = abs(bsearch(arr, end, getFunc(0), compare));
  endEnd = abs(bsearch(arr, end, getFunc(1), compare));
  hasCollide = !(startStart === startEnd && startEnd === endStart && endStart === endEnd);

  return hasCollide;
}


export function getCollisionGroup(schedules) {
  var collisionGroups = [],
      foundPrevCollisionSchedule = false,
      previousScheduleList;

  if (!schedules.length) {
      return collisionGroups;
  }

  collisionGroups[0] = [schedules[0].id];
  util.forEachArray(schedules.slice(1), function(schedule, index) {
      foundPrevCollisionSchedule = false;
      previousScheduleList = Array.prototype.slice.apply(schedules, [0, index + 1]).reverse();

      util.forEachArray(previousScheduleList, function(previous) {
          if (collidesWith(schedule, previous)) {
              // If overlapping previous schedules, find a Collision Group of overlapping schedules and add this schedules
              foundPrevCollisionSchedule = true;

              util.forEachArray(collisionGroups.slice(0).reverse(), function(group) {
                  if (~util.inArray(previous.id, group)) {
                      // If you find a previous schedule that overlaps, include it in the Collision Group to which it belongs.
                      group.push(schedule.id);

                      return false; // returning false can stop this loop
                  }

                  return true;
              });

              return false; // returning false can stop this loop
          }

          return true;
      });

      if (!foundPrevCollisionSchedule) {
          // This schedule is a schedule that does not overlap with the previous schedule, so a new Collision Group is constructed.
          collisionGroups.push([schedule.id]);
      }
  });

  return collisionGroups;
}

const SCHEDULE_MIN_DURATION = 20 * 60000
export function collidesWith(own, schedule) {
  var ownStarts = own.start,
      ownEnds = own.end,
      start = schedule.start,
      end = schedule.end;

  if (Math.abs(ownEnds - ownStarts) < SCHEDULE_MIN_DURATION) {
      ownEnds += SCHEDULE_MIN_DURATION;
  }

  if (Math.abs(end - start) < SCHEDULE_MIN_DURATION) {
      end += SCHEDULE_MIN_DURATION;
  }

  if ((start > ownStarts && start < ownEnds) ||
      (end > ownStarts && end < ownEnds) ||
      (start <= ownStarts && end >= ownEnds)) {
      return true;
  }

  return false;
};

export function getMatrices(scheduleMap, collisionGroups) {
  var result = [];

    util.forEachArray(collisionGroups, function(group) {
      var matrix = [[]];

      util.forEachArray(group, function(scheduleID) {
          var schedule = scheduleMap[scheduleID],
              col = 0,
              found = false,
              nextRow,
              lastRowInColumn;

          while (!found) {
              lastRowInColumn = getLastRowInColumn(matrix, col);

              if (lastRowInColumn === false) {
                  matrix[0].push(schedule);
                  found = true;
              } else if (!collidesWith(schedule, matrix[lastRowInColumn][col])) {
                  nextRow = lastRowInColumn + 1;
                  if (util.isUndefined(matrix[nextRow])) {
                      matrix[nextRow] = [];
                  }
                  matrix[nextRow][col] = schedule;
                  found = true;
              }

              col += 1;
          }
      });

      result.push(matrix);
  });

  return result;
}

export function getLastRowInColumn(arr2d, col) {
  var row = arr2d.length;

  while (row > 0) {
      row -= 1;
      if (!util.isUndefined(arr2d[row][col])) {
          return row;
      }
  }

  return false;
}

const MIN_WIDTH_RATIO = 14
const MAX_WIDTH_RATIO = 33

let containerPx = 0

const getGridLeftAndWidth = (headerOpts) => {
  if (containerPx == 0) {
    const leftPx = document.getElementById('tg-left').style.width.split('px')[0]
    containerPx = document.getElementById('vlayout-area').getBoundingClientRect().width - leftPx
  }
  
  let accumulatedWidth = 0
  let widthRatio = 100 / headerOpts.length
  widthRatio = widthRatio < MIN_WIDTH_RATIO ? MIN_WIDTH_RATIO : MAX_WIDTH_RATIO < widthRatio ? MAX_WIDTH_RATIO : widthRatio

  switch (widthRatio) {
    case MIN_WIDTH_RATIO:
    case MAX_WIDTH_RATIO:
      const unitPx = containerPx * widthRatio / 100
      const newContainerPx= unitPx * headerOpts.length
      document.getElementById('w-container').style.width = widthRatio == MIN_WIDTH_RATIO ? `${newContainerPx}px` : ''
      document.getElementById('tg-h-g').style.width = `${newContainerPx}px`
      document.getElementById('tg-s').style.width = `${newContainerPx}px`
      document.getElementById('day-right').style.width = `${newContainerPx}px`
      widthRatio = unitPx / newContainerPx * 100
      break
    default:
      document.getElementById('tg-h-g').style.width = `100%`
      document.getElementById('tg-s').style.width = `100%`
      document.getElementById('day-right').style.width = `100%`
      document.getElementById('w-container').style.width = `100%`
      containerPx = 0
  }

  const leftAndWidthMap = {}
  headerOpts.forEach(opt => {
    leftAndWidthMap[opt.value] = {
        width: widthRatio,
        left: accumulatedWidth
    }
    accumulatedWidth += widthRatio
  })
  return leftAndWidthMap
}

const getScheduleViewBoundsMap = (timeLineMap) => {
  const baseMS = 24 * 60 * 60 * 1000
  const boundsMap = {}
  Object.keys(timeLineMap).forEach(key => {
    const matrices = timeLineMap[key]
    boundsMap[key] = matrices.map(matrix => {
      const maxRowLength = Math.max(...matrix.map(row => row.length))
      const widthPercent = 100 / maxRowLength
      const leftPercents = [...Array(maxRowLength).keys()].map(i => widthPercent * i)
      return matrix.map(row => {
        // const hasCollide = row.length > 1
        return row.map((schedule, idx) => {
          return getScheduleViewBound(schedule, {
            todayStart: 0,
            baseMS: baseMS,
            baseLeft: leftPercents,
            baseWidth: widthPercent,
            baseHeight: 1248,
            columnIndex: idx,
            isReadOnly: false,
            // hasCollide: hasCollide,
            defaultMarginBottom: 2
          })
        })
      })
    })
  })
  return boundsMap
}

const getScheduleViewBound = (schedule, options) => {
  const boundX = _getScheduleViewBoundX(options)
  const boundY = _getScheduleViewBoundY(schedule, options)
  return [boundX, boundY]
}

const _getScheduleViewBoundX = (options) => {
  const width = options.baseWidth

  // set width auto when has no collisions.
  // if (!options.hasCollide) {
  //   width = null
  // }

  return {
    left: options.baseLeft[options.columnIndex],
    width: width
  }
}

const _getScheduleViewBoundY = (schedule, options) => {
  const baseMS = options.baseMS
  const baseHeight = options.baseHeight
  const sDt = schedule.start
  const start = sDt.getHours() * 3600000 + sDt.getMinutes() * 60000 + sDt.getSeconds() * 1000
  const eDt = schedule.end
  const end = eDt.getHours() * 3600000 + eDt.getMinutes() * 60000 + eDt.getSeconds() * 1000
  const offsetStart = start
  const top = (baseHeight * offsetStart) / baseMS

  const duration = end - start
  const height = (baseHeight * duration) / baseMS

  const details = []
  if (schedule.hasOwnProperty('inPlanPersons')) {
    schedule.inPlanPersons.forEach( (ip, idx) => {
      const ipStart = ip.start
      const ipEnd = ip.end
      const duration = ipEnd - ipStart
      const height = (baseHeight * duration) / baseMS
      const obj = {
        color: ip.color,
        height: height,
      }
      details.push(obj)
    })
  }

  return {
      top: top,
      height: height,
      details: details
  }
}