// @ts-nocheck

import isTrustedLink from '../isTrustedLink'

jest.spyOn(console, 'log').mockImplementation(() => {})

describe('isTrustedLink', () => {
  test.each([
    'http://malicious:3000/granule_links?id=300&flattenLinks=true&linkTypes=data',
    'http://fakery/granule_links?id=301&flattenLinks=true&linkTypes=data',
    'https://tricksy:3001/granule_links?id=302&flattenLinks=true&linkTypes=data',
    'ftp://sneaky/granule_links?id=304',
    'sftp://fictitious:1234/granule_links?id=305',
    'sftp://fictitious/granule_links?id=306',
    'file:///file:5431/granule_links?id=307',
    '://noprotocol:5431/granule_links?id=308',
    'noprotocol/granule_links?id=309'
  ])('returns false for untrusted source: [%s]', async (link) => {
    const result = await isTrustedLink(link)

    expect(result).toEqual(false)
  })

  test.each([
    'http://localhost:3000/granule_links?id=300&flattenLinks=true&linkTypes=data',
    'http://127.0.0.1:1234/granule_links?id=301&flattenLinks=true&linkTypes=data',
    'https://d53njncz5taqi.cloudfront.net/granule_links?id=302&flattenLinks=true&linkTypes=data',
    'https://dycghwhsgr9el.cloudfront.net/granule_links?id=302&flattenLinks=true&linkTypes=data',
    'https://d30czzksj9a4kf.cloudfront.net/granule_links?id=302&flattenLinks=true&linkTypes=data'
  ])('returns true for trusted source: [%s]', async (link) => {
    const result = await isTrustedLink(link)

    expect(result).toEqual(true)
  })
})
