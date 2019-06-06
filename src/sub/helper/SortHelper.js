import * as Util from '../util/Util'

export const sortByArray = (aAry, bAry) => {
  if(!Util.hasValue(aAry) && !Util.hasValue(bAry)){
    return 0
  }
  if(!Util.hasValue(aAry)){
    return -1
  }
  if(!Util.hasValue(bAry)){
    return 1
  }

  const max = aAry.length < bAry.length? bAry.length: aAry.length
  for(let idx = 0; idx < max; idx++){
    if(aAry.length <= idx){
      return -1
    }
    if(bAry.length <= idx){
      return 1
    }
    if(aAry[idx] == bAry[idx]){
      continue
    }
    return aAry[idx] < bAry[idx]? -1: 1
  }
  return 0
}

export const sortByString = (a, b) => {
  if(!isNaN(a) && !isNaN(b)){
    const aNum = Number(a)
    const bNum = Number(b)
    return aNum < bNum? -1: aNum > bNum? 1: 0
  }
  const aCodeArr = a.split('')
  const bCodeArr = b.split('')
  for(let cnt = 0; cnt < aCodeArr.length && cnt < bCodeArr.length; cnt++){
    if(aCodeArr[cnt] < bCodeArr[cnt]){
      return -1
    }
    if(aCodeArr[cnt] > bCodeArr[cnt]){
      return 1
    }
  }
  return aCodeArr.length < bCodeArr.length? 1: aCodeArr.length < bCodeArr.length? -1: 0
}
