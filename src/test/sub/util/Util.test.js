import test from 'ava'
import * as Util from '../../../sub/util/Util.js'

test('snake2camel', t => {
  t.true(Util.snake2camel('test_string') == 'testString')
})

test('addNoSelect', t => {
  const option = [ { value: 1, text: 'a'}, { value: 2, text: 'b'}, { value: 3, text: 'c'}, ]
  Util.addNoSelect(option)
  t.true(option[0].value == null && option[0].text == '')
})

test('snake2camel', async t => {
  t.true(Util.snake2camel('test_string') == 'testString')
})

test('getByteLength', t => {
  t.true(Util.getByteLength('qwe123あいう') == 15)
})

test('zeroPad', t => {
  t.true(Util.zeroPad(123, 8) == '00000123')
})

test('range', t => {
  t.true(Util.range(100, 103).toString() == [100,101,102,103].toString())
  t.true(Util.range(100, 108, 2).toString() == [100,102,104,106,108].toString())
})

test('numberRange', t => {
  const arr = Util.numberRange(3, 5)
  t.true(arr[0].key == 3 && arr[1].key == 4 && arr[2].key == 5)
})

test('formatDateRange', t => {
  const date = new Date('2020-01-01 12:34:56')
  const day = Util.formatDateRange(date, 'day')
  t.true(day.key == '2020/01/01 00:00')
  const hour = Util.formatDateRange(date, 'hour')
  t.true(hour.key == '2020/01/01 12:00')
  const minute = Util.formatDateRange(date, 'minute')
  t.true(minute.key == '2020/01/01 12:34')
})

test('dateRange', t => {
  const start = new Date('2020-01-01 12:34:56')
  let end = new Date('2020-01-03 10:20:30')
  const dayArr = Util.dateRange(start, end, 'day')
  dayArr.forEach((day, idx) => t.true(day.key == `2020/01/0${idx + 1} 00:00`))

  end = new Date('2020-01-01 15:20:30')
  const hourArr = Util.dateRange(start, end, 'hour')
  hourArr.forEach((hour, idx) => {
    t.true(hour.key == `2020/01/01 ${idx + 12}:00`)
  })
  
  end = new Date('2020-01-01 12:40:30')
  const minuteArr = Util.dateRange(start, end, 'minute')
  minuteArr.forEach((minute, idx) => {
    t.true(minute.key == `2020/01/01 12:${idx + 34}`)
  })
})

test('str2booleanComplate', t => {
  t.true(Util.str2booleanComplate('true'))
  t.true(Util.str2booleanComplate('True'))
  t.true(!Util.str2booleanComplate('false'))
  t.true(!Util.str2booleanComplate('False'))
  t.true(Util.str2booleanComplate('equal') == 'equal')
})

test('str2boolean', t => {
  t.true(Util.str2boolean('true'))
  t.true(Util.str2boolean('True'))
  t.true(!Util.str2boolean('false'))
  t.true(!Util.str2boolean('False'))
  t.true(Util.str2boolean('equal'))
})

test('isIos', t => {
  t.true(!Util.isIos())
})

test('isAndroid', t => {
  t.true(!Util.isAndroid())
})

test('isAndroidOrIOS', t => {
  t.true(!Util.isAndroidOrIOS())
})

test('formatDate', t => {
  const date = new Date('2020-01-01 00:00:00')
  t.true(Util.formatDate(date.getTime()) == '2020/01/01 00:00:00')
})

test('sanitize', t => {
  t.true(Util.sanitize('&<>\'"') == '&amp;&lt;&gt;&#x27;&quot;')
})

test('cutOnLong', t => {
  t.true(Util.cutOnLong('qwertyuiop', 30) == 'qwertyuiop')
  t.true(Util.cutOnLong('qwertyuiop', 3) == 'qwe...')
  t.true(Util.cutOnLong(47, 3) == 47)
})

test('luminance', t => {
  t.true(Math.ceil(Util.luminance(0x123456)) == 121)
})

test('colorCd4db', t => {
  t.true(Util.colorCd4db(null) == '000000')
  t.true(Util.colorCd4db({hex: '888888'}) == '888888')
  t.true(Util.colorCd4db('888888') == '888888')
  t.true(Util.colorCd4db('#888888') == '888888')
})

test('colorCd4display', t => {
  t.true(Util.colorCd4display(null) == '#000000')
  t.true(Util.colorCd4display(null, '#123456') == '#123456')
  t.true(Util.colorCd4display({hex: '888888'}) == '#888888')
  t.true(Util.colorCd4display('888888') == '#888888')
  t.true(Util.colorCd4display('#888888') == '#888888')
})

test('isArray', t => {
  t.true(Util.isArray([1,2,3]))
  t.true(!Util.isArray('test'))
  t.true(!Util.isArray(1))
  t.true(!Util.isArray({a: 1, b: 2}))
})

test('hasValue', t => {
  t.true(!Util.hasValue(null))
  t.true(!Util.hasValue([]))
  t.true(Util.hasValue([1,2,3]))
  t.true(Util.hasValue('qwe'))
})

test('detectEncoding', t => {
  t.true(Util.detectEncoding('\xc3\xa0\xc3\xad\xc3\xa0\xc3\xa7\xc3\xa3').encoding == 'UTF-8')
})

test('supportInputType', t => {
  t.true(Util.supportInputType('text'))
  t.true(!Util.supportInputType('notSupport'))
})

test('arrayBuffer2str', t => {
  t.true(Util.arrayBuffer2str([0x41, 0x42, 0x43]) == 'ABC')
})

test('pathMatch', t => {
  t.true(Util.pathMatch('qwe', 'qwe'))
  t.true(Util.pathMatch('', ''))
  t.true(!Util.pathMatch('', 'qwe'))
  t.true(!Util.pathMatch('qwe', ''))
  t.true(Util.pathMatch('qwe', 'qwe*'))
  t.true(Util.pathMatch('qwe', 'qwe/*'))
})

test('getValue', async t => {
  let obj = {
    hoge: [
      {
        boke: {
          ok: 'AbcdE'
        }
      }
    ]
  }
  t.true(Util.getValue(obj, 'hoge.0.boke.ok').val == 'AbcdE')
  t.true(Util.getValue(obj, 'hoge.0.boke.ok', 'bbb') == 'AbcdE')
  t.true(Util.getValue(obj, 'hoge.0.boke.ok2', 'bbb') == 'bbb')
})

test('extraCheckCsvObj', t => {
  t.true(!Util.hasValue(Util.extraCheckCsvObj({data: [ [47,48],[12,13] ]}).errors))
})

test('csv2Obj', t => {
  const obj = Util.csv2Obj("a,b,c,d,e\n1,2,3,4,5")
  t.true(obj && !Util.hasValue(obj.errors))
})

test('convert2Unicode', t => {
  t.true(Util.convert2Unicode('qwe') == 'qwe')
})

test('getSjisCodePoint', t => {
  t.true(Util.getSjisCodePoint('ABC')? true: false)
})

test('removeCrLfDup', async t => {
  t.true(Util.removeCrLfDup('あい\r\rあいう\n\nあ\n\n\n') == 'あい\nあいう\nあ')
})

test('str2Array', t => {
  t.true(Util.str2Array('ABC')[0] == 0x41)
})

test('convertCsv2Obj', t => {
  t.true(Util.hasValue(Util.convertCsv2Obj().errors))
  t.true(!Util.hasValue(Util.convertCsv2Obj('a,b,c,d,e\n1,2,3,4,5').errors))
})

test('converToCsv', t => {
  const data = [
    ['a','b','c'],
    ['1','2','3']
  ]
  t.true(Util.converToCsv(data, ['a','b','c'])? true: false)
})

test('equalsAny', t => {
  t.true(Util.equalsAny('b', ['a','b','c']))
  t.true(!Util.equalsAny('r', ['a','b','c']))
})

test('getMaxTextLength', t => {
  t.true(Util.getMaxTextLength(['zxc','qwertyuiop','asdfg']) == 10)
})

test('base64ToBlob', t => {
  const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAZSURBVChTY2RgYPgPxDgBE5TGCYaDAgYGAAxTAQ+7uUVuAAAAAElFTkSuQmCC'
  t.true(Util.base64ToBlob(base64)? true: false)
})

test('getEntityFromIds', t => {
  t.true(Util.getEntityFromIds(
    [ {id: 12, val: 120}, {id: 13, val: 130}, {id: 14, val: 140} ],
    {id: 13, val: 130},
    ['id']
  )? true: false)
})

test('getMidnightMs', t => {
  const midnight = new Date(Util.getMidnightMs())
  t.true(midnight.getHours() == 0 )
  t.true(midnight.getMinutes() == 0 )
  t.true(midnight.getSeconds() == 0 )
})

test('getDetailCaptionKey', t => {
  t.true(Util.getDetailCaptionKey('update') == 'label.update' )
  t.true(Util.getDetailCaptionKey('') == 'label.addSetting' )
})

test('getDatetime', t => {
  const now = new Date('2020-01-01')
  const after = Util.getDatetime(now, {year: 1, hours: 1})
  t.true(now.getFullYear() + 1 == after.getFullYear() )
  t.true(now.getHours() + 1 == after.getHours() )
})

test('getSubDatetime', t => {
  const now = new Date('2020-01-01 10:00:00')
  let after = new Date('2020-01-02 15:30:45')
  let sub = Util.getSubDatetime(now, after)
  t.true(Math.round(sub.date) == 1 )
  after = new Date('2020-01-01 15:30:45')
  sub = Util.getSubDatetime(now, after)
  t.true(Math.round(sub.hour) == 6 )
  after = new Date('2020-01-01 10:30:45')
  sub = Util.getSubDatetime(now, after)
  t.true(Math.round(sub.minute) == 31)
})

