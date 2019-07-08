import test from 'ava'
import * as HttpHelper from '../../../../sub/helper/base/HttpHelper'

test('addTimeToPath', t => {
  t.true(HttpHelper.addTimeToPath('https://exbeacon.com/').startsWith('https://exbeacon.com/?_='))
  t.true(HttpHelper.addTimeToPath('https://exbeacon.com/?a=1').startsWith('https://exbeacon.com/?a=1&_='))
})
