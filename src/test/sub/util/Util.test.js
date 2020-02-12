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
  t.true(Util.getValue(obj, 'hoge.0.boke.ok') == 'AbcdE')
  t.true(Util.getValue(obj, 'hoge.0.boke.ok', 'bbb') == 'AbcdE')
  t.true(Util.getValue(obj, 'hoge.0.boke.ok2', 'bbb') == 'bbb')
})

