import { CHAR_SET } from '../constant/Constants'

export const getCharSet = (loginId) => {
  if (loginId == null) {
    return CHAR_SET[0].name
  }
  const charSet = window.localStorage.getItem(loginId + '-charSet')
  return charSet ? charSet : CHAR_SET[0].name
}
