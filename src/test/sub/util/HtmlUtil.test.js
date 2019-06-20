import test from 'ava'
import * as HtmlUtil from '../../../sub/util/HtmlUtil'

test('isIos', t => {
  t.true(!HtmlUtil.isIos())
})

test('isAndroid', t => {
  t.true(!HtmlUtil.isAndroid())
})

test('isAndroidOrIOS', t => {
  t.true(!HtmlUtil.isAndroidOrIOS())
})

test('supportInputType', t => {
  t.true(HtmlUtil.supportInputType('text'))
  t.true(!HtmlUtil.supportInputType('notSupport'))
})

test('addTimeToPath', t => {
  t.true(HtmlUtil.addTimeToPath('https://exbeacon.com/').startsWith('https://exbeacon.com/?_='))
  t.true(HtmlUtil.addTimeToPath('https://exbeacon.com/?a=1').startsWith('https://exbeacon.com/?a=1&_='))
})
