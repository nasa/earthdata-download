// @ts-nocheck

import downloadStates from '../../app/constants/downloadStates'

/**
 * Formats a links array into our store format for files.
 * @param {Array} links Retrieved links
 */
const formatLinks = (links) => {
  const files = {}
  links.forEach((url) => {
    const filename = url.split('/').pop()

    files[filename] = {
      url,
      state: downloadStates.pending,
      percent: 0
    }
  })

  return files
}

export default formatLinks
