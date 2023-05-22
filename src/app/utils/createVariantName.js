const createVariantClassName = (variant = '') => {
  if (!variant) return null

  return `is${variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase()}`
}

export default createVariantClassName
