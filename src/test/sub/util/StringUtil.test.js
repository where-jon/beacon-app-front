import test from 'ava'
import * as StringUtil from '../../../sub/util/StringUtil'

test('snake2camel', t => {
  t.true(StringUtil.snake2camel('test_string') == 'testString')
})

test('snake2camel', async t => {
  t.true(StringUtil.snake2camel('test_string') == 'testString')
})

test('getByteLength', t => {
  t.true(StringUtil.getByteLength('qwe123あいう') == 15)
})

test('str2booleanComplate', t => {
  t.true(StringUtil.str2booleanComplate('true'))
  t.true(StringUtil.str2booleanComplate('True'))
  t.true(!StringUtil.str2booleanComplate('false'))
  t.true(!StringUtil.str2booleanComplate('False'))
  t.true(StringUtil.str2booleanComplate('equal') == 'equal')
})

test('str2boolean', t => {
  t.true(StringUtil.str2boolean('true'))
  t.true(StringUtil.str2boolean('True'))
  t.true(!StringUtil.str2boolean('false'))
  t.true(!StringUtil.str2boolean('False'))
  t.true(StringUtil.str2boolean('equal'))
})

test('sanitize', t => {
  t.true(StringUtil.sanitize('&<>\'"') == '&amp;&lt;&gt;&#x27;&quot;')
})

test('zeroPad', t => {
  t.true(StringUtil.zeroPad(123, 8) == '00000123')
})

test('cutOnLong', t => {
  t.true(StringUtil.cutOnLong('qwertyuiop', 30) == 'qwertyuiop')
  t.true(StringUtil.cutOnLong('qwertyuiop', 3) == 'qwe...')
  t.true(StringUtil.cutOnLong(47, 3) == 47)
})

test('detectEncoding', t => {
  t.true(StringUtil.detectEncoding('\xc3\xa0\xc3\xad\xc3\xa0\xc3\xa7\xc3\xa3').encoding == 'UTF-8')
})

test('convert2Unicode', t => {
  t.true(StringUtil.convert2Unicode('qwe') == 'qwe')
})

test('getSjisCodePoint', t => {
  t.true(StringUtil.getSjisCodePoint('ABC')? true: false)
})

test('pathMatch', t => {
  t.true(StringUtil.pathMatch('qwe', 'qwe'))
  t.true(StringUtil.pathMatch('', ''))
  t.true(!StringUtil.pathMatch('', 'qwe'))
  t.true(!StringUtil.pathMatch('qwe', ''))
  t.true(StringUtil.pathMatch('qwe', 'qwe*'))
  t.true(StringUtil.pathMatch('qwe', 'qwe/*'))
})

test('str2Array', t => {
  t.true(StringUtil.str2Array('ABC')[0] == 0x41)
})

test('getMaxTextLength', t => {
  t.true(StringUtil.getMaxTextLength(['zxc','qwertyuiop','asdfg']) == 10)
})

test('startsWithAny', t => {
  t.true(StringUtil.startsWithAny('abc', ['abc','bbb']))
  t.true(!StringUtil.startsWithAny('abc', ['bbc','bbb']))
})

