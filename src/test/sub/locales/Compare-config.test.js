import test from 'ava'
import ja from '../../../sub/locales/ja.json'
import {APP} from '../../../sub/constant/config.js'

const keyJoin = (obj, keys = [], result = []) => {
  Object.keys(obj).forEach(key => {
    // 数値のみのキーが含まれる場合、上位に説明ありのため、除外
    if(!isNaN(key)){
      return
    }
    keys.push(key)
    if(obj[key] && typeof obj[key] == 'object'){
      keyJoin(obj[key], keys, result)
      keys.pop()
      return
    }
    result.push( keys.join('.'))
    keys.pop()
  })
  return result
}

test('比較テスト', async t => {
  console.log('\n> ----- compare start -----\n')
  const conf = keyJoin(APP)
  const confJa = keyJoin(ja.config.APP)
  let confNotExitProp = []
  conf.concat(confJa).forEach(item => {
    if (conf.includes(item) && !confJa.includes(item)) {
      console.log(`ja.config.APPに存在しない : ${item}`)
      confNotExitProp.push(item)
    }
  })

  console.log('\n> ja.configに不足している設定数：' + confNotExitProp.length + '\n')
  console.log('\n> ----- compare success -----\n')
  console.log('\n')
  t.true(true)
})
