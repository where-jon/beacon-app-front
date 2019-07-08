import test from 'ava'
import * as StayTimeHelper from '../../../../sub/helper/domain/StayTimeHelper'

test('getRatio', t => {
  // APP.STAY_SUM.FROM, APP.STAY_SUM.TO がデフォルト前提
  let secTime = 21650
  let defaultResult = StayTimeHelper.getRatio(secTime)
  t.true(defaultResult == '25.06')
  let stayBaseSec = 43300
  let half1digitResult = StayTimeHelper.getRatio(secTime, 10, stayBaseSec)
  t.true(half1digitResult == '50.0')
})

test('getStayBaseSec', t => {
  // APP.STAY_SUM.FROM, APP.STAY_SUM.TO がデフォルト前提
  let stayBaseSec = StayTimeHelper.getStayBaseSec()
  t.true(stayBaseSec == 86400)
})
