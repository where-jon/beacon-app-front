import test from 'ava'
import * as BrowserUtil from '../../../sub/util/BrowserUtil'

test('isIos', t => {
  t.true(!BrowserUtil.isIos())
})

test('isAndroid', t => {
  t.true(!BrowserUtil.isAndroid())
})

test('isAndroidOrIOS', t => {
  t.true(!BrowserUtil.isAndroidOrIOS())
})
