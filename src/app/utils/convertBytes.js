/**
 * Returns a string with bytes converted to the closest multiple and associated suffix in acronym form.
 * @param {number} bytes The number to use for pluralization.
 * @returns {string} Converted bytes with associated suffix for unit.
 */
const convertBytes = (bytes) => {
  if (!bytes) {
    return '0 bytes'
  }

  if (bytes >= 1024 * 1024 * 1024) {
    const gigabytes = Math.round(bytes / (1024 * 1024 * 1024))

    return `${Math.round(gigabytes * 10) / 10} gb`
  }

  if (bytes >= 1024 * 1024) {
    const megaBytes = Math.round(bytes / (1024 * 1024))

    return `${Math.round(megaBytes * 10) / 10} mb`
  }

  if (bytes >= 1024) {
    const kiloBytes = Math.round(bytes / (1024))

    return `${Math.round(kiloBytes * 10) / 10} kb`
  }

  return `${bytes} bytes`
}

export default convertBytes
