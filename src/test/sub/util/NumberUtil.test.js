import test from 'ava'
import * as NumberUtil from '../../../sub/util/NumberUtil'

test('luminance', t => {
  t.true(Math.ceil(NumberUtil.luminance(0x123456)) == 121)
})

