export const getLocale = (defaultLocale = '') => {
  const locale = window.localStorage.getItem(`${document.domain}-locale`)
  return locale? locale : defaultLocale
}

export const setLocale = (locale) => {
  window.localStorage.setItem(`${document.domain}-locale`, locale)
}
