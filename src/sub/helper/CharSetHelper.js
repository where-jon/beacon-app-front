import { CHAR_SET } from '../constant/Constants'

export const getCharSet = (loginId) => {
  if (loginId == null) {
    return CHAR_SET[0].name
  }
  const charSet = window.localStorage.getItem(loginId + '-charSet')
  return charSet ? charSet : CHAR_SET[0].name
}

export const setBulkCharSet = (loginId, charSetId) => {
  if (loginId == null) {
    return
  }
  const selected = CHAR_SET.find(e => e.id === charSetId)
  const charSet = selected != null ? selected.name : CHAR_SET[0].name
  window.localStorage.setItem(loginId + '-bulkCharSet', charSet)
}

export const getBulkCharSet = (loginId) => loginId == null? null: window.localStorage.getItem(loginId + '-bulkCharSet')

export const detectBulkCharSet = (loginId) => {
  if(loginId == null){
    return CHAR_SET[0].name
  }
  const bulkCharSet = getBulkCharSet(loginId)
  return bulkCharSet? bulkCharSet: getCharSet(loginId)
}
