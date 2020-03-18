import test from 'ava'
import * as DateUtil from '../../../sub/util/DateUtil'

test('formatDateRange', t => {
  const date = new Date('2020-01-01 12:34:56')
  const day = DateUtil.formatDateRange(date, 'day')
  t.true(day.key == '2020/01/01 00:00')
  const hour = DateUtil.formatDateRange(date, 'hour')
  t.true(hour.key == '2020/01/01 12:00')
  const minute = DateUtil.formatDateRange(date, 'minute')
  t.true(minute.key == '2020/01/01 12:34')
})

test('dateRange', t => {
  const start = new Date('2020-01-01 12:34:56')
  let end = new Date('2020-01-03 10:20:30')
  const dayArr = DateUtil.dateRange(start, end, 'day')
  dayArr.forEach((day, idx) => t.true(day.key == `2020/01/0${idx + 1} 00:00`))

  end = new Date('2020-01-01 15:20:30')
  const hourArr = DateUtil.dateRange(start, end, 'hour')
  hourArr.forEach((hour, idx) => {
    t.true(hour.key == `2020/01/01 ${idx + 12}:00`)
  })
  
  end = new Date('2020-01-01 12:40:30')
  const minuteArr = DateUtil.dateRange(start, end, 'minute')
  minuteArr.forEach((minute, idx) => {
    t.true(minute.key == `2020/01/01 12:${idx + 34}`)
  })
})

test('formatDate', t => {
  const date = new Date('2020-01-01 00:00:00')
  t.true(DateUtil.formatDate(date.getTime()) == '2020/01/01 00:00:00')
})

test('getDateWithTimeZone', t => {
  const date = new Date(DateUtil.getDateWithTimeZone('JST'))
  t.true(date != '')
})

test('getDatetime', t => {
  const now = new Date('2020-01-01')
  const after = DateUtil.getDatetime(now, {year: 1, hours: 1})
  t.true(now.getFullYear() + 1 == after.getFullYear() )
  t.true(now.getHours() + 1 == after.getHours() )
})

test('getSubDatetime', t => {
  const now = new Date('2020-01-01 10:00:00')
  let after = new Date('2020-01-02 15:30:45')
  let sub = DateUtil.getSubDatetime(now, after)
  t.true(Math.round(sub.date) == 1 )
  after = new Date('2020-01-01 15:30:45')
  sub = DateUtil.getSubDatetime(now, after)
  t.true(Math.round(sub.hour) == 6 )
  after = new Date('2020-01-01 10:30:45')
  sub = DateUtil.getSubDatetime(now, after)
  t.true(Math.round(sub.minute) == 31)
})

test('convertToTime', t => {
  const fullTestDate = 55555
  const zeroTestDate = 4025
  let fullTime = DateUtil.convertToTime(fullTestDate)
  t.true(fullTime == '15:25:55')
  let zeroTime = DateUtil.convertToTime(zeroTestDate)
  t.true(zeroTime == '01:07:05')
})

