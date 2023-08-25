// @ts-nocheck

import trustedSources from '../trustedSources.json'

/**
 * Tests a link against the trustedSources.json file
 * @param {String} link Link to test
 */
const isTrustedLink = (link) => {
  const protocolMatch = /^([a-z]*):\/\/\.*/i.exec(link)
  const protocol = protocolMatch?.at(1)?.toLowerCase()

  if (!protocolMatch || (protocol !== 'http' && protocol !== 'https')) {
    return false
  }

  const host = link
    .replace(/^https?:\/\//i, '')
    .split('/')
    .at(0)
    ?.toLowerCase()
    ?.split(':')
    ?.at(0)
  console.log(`Checking [${host}] for matching trusted host`)

  return trustedSources[host] !== undefined
}

export default isTrustedLink
