import test from 'ava'
import * as Util from '../../../sub/util/Util'

test('hasValue', t => {
  t.true(!Util.hasValue(null))
  t.true(!Util.hasValue([]))
  t.true(Util.hasValue([1,2,3]))
  t.true(Util.hasValue('qwe'))
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

test('removeCrLfDup', async t => {
  t.true(Util.removeCrLfDup('あい\r\rあいう\n\nあ\n\n\n') == 'あい\nあいう\nあ')
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

test('getDetailCaptionKey', t => {
  t.true(Util.getDetailCaptionKey('update') == 'update' )
 // t.true(Util.getDetailCaptionKey('') == 'addSetting' )
})

test('getRatio', t => {
  // APP.STAY_SUM.FROM, APP.STAY_SUM.TO がデフォルト前提
  let secTime = 21650
  let defaultResult = Util.getRatio(secTime)
  t.true(defaultResult == '25.06')
  let stayBaseSec = 43300
  let half1digitResult = Util.getRatio(secTime, 10, stayBaseSec)
  t.true(half1digitResult == '50.0')
})

test('getStayBaseSec', t => {
  // APP.STAY_SUM.FROM, APP.STAY_SUM.TO がデフォルト前提
  let stayBaseSec = Util.getStayBaseSec()
  t.true(stayBaseSec == 86400)
})
