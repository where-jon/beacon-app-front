import test from 'ava'
import fs from 'fs'
import ja from '../../../sub/locales/ja.json'
import {APP, APP_SERVICE, EXCLOUD, DISP} from '../../../sub/constant/config.js'
const resuletFile = 'resultCompareConfig.txt'

// オブジェクトの階層を「.」で結合
const keyJoin = (obj, keys = [], result = []) => {
  if(obj) {
    Object.keys(obj).forEach(key => {
      // キーが数値のみの場合、上位のキーに説明があるため、除外
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
  }
  return result
}

// 比較
const compare = (conf,confJa,confName) =>{
  let confNotExitProp = []
  fs.appendFileSync(resuletFile, `----- ${confName} -----\n`)
  conf.concat(confJa).forEach(item => {
    if (conf.includes(item) && !confJa.includes(item)) {
      fs.appendFileSync(resuletFile, `${item}\n`)
      confNotExitProp.push(item)
    }
  })
  console.log(`ja.config.${confName} not exists items：` + confNotExitProp.length + '\n')
}

// 実行
test('compareConfig', async t => {
  console.log('\n> ----- compare start -----\n')
  fs.writeFileSync(resuletFile, 'compareConfig\n')
  compare(keyJoin(APP),keyJoin(ja.config.APP) , 'APP')
  compare(keyJoin(APP_SERVICE),keyJoin(ja.config.APP_SERVICE) ,'APP_SERVICE')
  compare(keyJoin(EXCLOUD),keyJoin(ja.config.EXCLOUD) ,'EXCLOUD')
  compare(keyJoin(DISP),keyJoin(ja.config.DISP) ,'DISP')
  console.log('\n> ----- compare end -----\n')
  t.true(true)
})
