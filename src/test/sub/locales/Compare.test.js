import test from 'ava'
import ja from '../../../sub/locales/ja.json'
import en from '../../../sub/locales/en.json'


const search = (obj, keys) => keys.reduce((prev, cur) => prev != null && prev[cur] != null? prev[cur]: null, obj)

const compare = (lang1, lang2, keys = [], result = []) => {
  Object.keys(lang1).forEach(key => {
    keys.push(key)
    const value1 = search(lang1, [key])
    if(typeof value1 == 'object'){
      compare(value1, lang2, keys, result)
      keys.pop()
      return
    }
    const value2 = search(lang2, keys)
    if(value2 == null){
      result.push('"' + keys.join('.') + '": "' + value1 + '",')
    }
    else if(value1 != '' && value2 == ''){
      result.push('"' + keys.join('.') + '": "' + value1 + '",')
    }
    keys.pop()
  })
  return result
}

test('compare', async t => {
  console.log('\n> ----- compare start -----\n')
  const result = compare(ja, en)
  console.log('\n')
  console.log(result.join('\n'))
  console.log('\n')
  console.log('\n> ----- compare success -----\n')
  console.log('\n')
  t.true(true)
})
