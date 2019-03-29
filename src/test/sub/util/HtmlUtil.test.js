import test from 'ava'
import * as HtmlUtil from '../../../sub/util/HtmlUtil.js'

test('addTimeToPath', t => {
  t.true(HtmlUtil.addTimeToPath('https://exbeacon.com/').startsWith('https://exbeacon.com/?_='))
  t.true(HtmlUtil.addTimeToPath('https://exbeacon.com/?a=1').startsWith('https://exbeacon.com/?a=1&_='))
})
