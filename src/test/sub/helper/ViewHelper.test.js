import test from 'ava'
import * as ViewHelper from '../../../sub/helper/ViewHelper'

test('getDetailCaptionKey', t => {
  t.true(ViewHelper.getDetailCaptionKey('update') == 'update' )
 // t.true(ViewHelper.getDetailCaptionKey('') == 'addSetting' )
})
