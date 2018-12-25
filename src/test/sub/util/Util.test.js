import test from 'ava'
import * as Util from '../../../sub/util/Util.js'

test('detectEncoding', async t => {
  t.true(Util.detectEncoding('あああ').encoding == 'ascii')
})

test('removeCrLfDup', async t => {
  t.true(Util.removeCrLfDup('あい\r\rあいう\n\nあ\n\n\n') == 'あい\nあいう\nあ')
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

