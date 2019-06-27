import test from 'ava'
import * as Util from '../../../sub/util/Util'
import * as CsvUtil from '../../../sub/util/CsvUtil'

test('extraCheckCsvObj', t => {
  t.true(!Util.hasValue(CsvUtil.extraCheckCsvObj({data: [ [47,48],[12,13] ]}).errors))
})

test('csv2Obj', t => {
  const obj = CsvUtil.csv2Obj("a,b,c,d,e\n1,2,3,4,5")
  t.true(obj && !Util.hasValue(obj.errors))
})

test('removeCrLfDup', async t => {
  t.true(CsvUtil.removeCrLfDup('あい\r\rあいう\n\nあ\n\n\n') == 'あい\nあいう\nあ')
})

test('convertCsv2Obj', t => {
  t.true(Util.hasValue(CsvUtil.convertCsv2Obj().errors))
  t.true(!Util.hasValue(CsvUtil.convertCsv2Obj('a,b,c,d,e\n1,2,3,4,5').errors))
})

test('converToCsv', t => {
  const data = [
    ['a','b','c'],
    ['1','2','3']
  ]
  t.true(CsvUtil.converToCsv(data, ['a','b','c'])? true: false)
})
