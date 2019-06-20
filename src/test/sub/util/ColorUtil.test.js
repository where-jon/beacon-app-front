import test from 'ava'
import * as ColorUtil from '../../../sub/util/ColorUtil'

test('colorCd4display', t => {
  t.true(ColorUtil.colorCd4display(null) == '#000000')
  t.true(ColorUtil.colorCd4display(null, '#123456') == '#123456')
  t.true(ColorUtil.colorCd4display({hex: '888888'}) == '#888888')
  t.true(ColorUtil.colorCd4display('888888') == '#888888')
  t.true(ColorUtil.colorCd4display('#888888') == '#888888')
})

test('colorCd4db', t => {
  t.true(ColorUtil.colorCd4db(null) == '000000')
  t.true(ColorUtil.colorCd4db({hex: '888888'}) == '888888')
  t.true(ColorUtil.colorCd4db('888888') == '888888')
  t.true(ColorUtil.colorCd4db('#888888') == '888888')
})

