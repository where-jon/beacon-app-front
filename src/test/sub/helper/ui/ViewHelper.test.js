import test from 'ava'
import * as ViewHelper from '../../../../sub/helper/ui/ViewHelper'

test('getDetailCaptionKey', t => {
  t.true(ViewHelper.getDetailCaptionKey('update') == 'update' )
 // t.true(ViewHelper.getDetailCaptionKey('') == 'addSetting' )
})
