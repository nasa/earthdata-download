import { UAParser } from 'ua-parser-js'

export function setOSClassName(element) {
  const parser = new UAParser(window.navigator.userAgent)
  const { name: osName } = parser.getOS()

  element.classList.add(`is-${osName.replace(' ', '').toLowerCase()}`)
}
