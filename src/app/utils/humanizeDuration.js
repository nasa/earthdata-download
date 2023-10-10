import hd from 'humanize-duration'

/**
 * Returns humanized duration string
 * @param {number} duration The duration to humanize in ms.
 * @returns {string} A humanized string.
 */
export const humanizeDuration = (duration) => hd(duration, {
  largest: 2,
  round: 1,
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms'
    }
  },
  serialComma: false,
  spacer: ''
})

export default humanizeDuration
