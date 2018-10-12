export const validatePattern = (value, regexp, errorMessage) => {
  if (value === null || (typeof value) === 'undefined') {
    return null
  }
  return value.match(regexp) !== null ? null : errorMessage
}

export const validateRequire = (value, errorMessage) => {
  const val = (value === null || (typeof value) === 'undefined') ? '' : value
  return val.length > 0 ? null : errorMessage
}