import bytes from 'bytes'
/**
 * Returns a string with bytes converted to the closest multiple and associated suffix in acronym form.
 * @param {number} bytes The number to convert.
 * @returns {string} Converted bytes with associated suffix for unit.
 */
const convertBytes = (inputBytes) => {
  if (inputBytes === null) {
    return '0 b'
  }

  const convertedBytes = bytes.format(inputBytes, {
    unitSeparator: ' ',
    decimalPlaces: 0
  })

  return convertedBytes.toLowerCase()
}

export default convertBytes
