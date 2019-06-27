import test from 'ava'
import * as DomUtil from '../../../sub/util/DomUtil'

test('supportInputType', t => {
  t.true(DomUtil.supportInputType('text'))
  t.true(!DomUtil.supportInputType('notSupport'))
})
