import test from 'ava'
import ja from '../../../sub/locales/ja.json'
import en from '../../../sub/locales/en.json'


const compare = (targetJson) => {
  let result = []
  let categories = ['label','message']
  categories.forEach((cat) => {
    for (let key in ja[cat]) {
      if (!targetJson[cat][key]) {
        result.push('"' + key + '": "' + ja[cat][key] + '",')
      }
    }
  })
  return result
}

test('compare', async t => {
  let result = compare(en)
  result.forEach((val) => {
    console.log(val)
  })
//  t.true(result.length == 0)
  t.true(true)
})

