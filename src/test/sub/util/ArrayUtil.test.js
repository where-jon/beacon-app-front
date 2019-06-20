import test from 'ava'
import * as ArrayUtil from '../../../sub/util/ArrayUtil'

test('isArray', t => {
  t.true(ArrayUtil.isArray([1,2,3]))
  t.true(!ArrayUtil.isArray('test'))
  t.true(!ArrayUtil.isArray(1))
  t.true(!ArrayUtil.isArray({a: 1, b: 2}))
})

test('addNoSelect', t => {
  const option = [ { value: 1, text: 'a'}, { value: 2, text: 'b'}, { value: 3, text: 'c'}, ]
  ArrayUtil.addNoSelect(option)
  t.true(option[0].value == null && option[0].text == '')
})

test('range', t => {
  t.true(ArrayUtil.range(100, 103).toString() == [100,101,102,103].toString())
  t.true(ArrayUtil.range(100, 108, 2).toString() == [100,102,104,106,108].toString())
})

test('numberRange', t => {
  const arr = ArrayUtil.numberRange(3, 5)
  t.true(arr[0].key == 3 && arr[1].key == 4 && arr[2].key == 5)
})

test('arrayBuffer2str', t => {
  t.true(ArrayUtil.arrayBuffer2str([0x41, 0x42, 0x43]) == 'ABC')
})

test('equalsAny', t => {
  t.true(ArrayUtil.equalsAny('b', ['a','b','c']))
  t.true(!ArrayUtil.equalsAny('r', ['a','b','c']))
})

