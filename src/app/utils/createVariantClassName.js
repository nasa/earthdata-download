const createVariantClassName = (variant = '') => {
  if (!variant) return null

  if (variant.includes('INTERRUPTED')) {
    return 'isInterrupted'
  }

  return `is${variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase()}`
}

export default createVariantClassName
