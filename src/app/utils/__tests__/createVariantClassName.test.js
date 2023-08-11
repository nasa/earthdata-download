import createVariantClassName from '../createVariantClassName'

describe('createVariantClassName', () => {
  describe('when no variant is passed', () => {
    test('returns null', () => {
      const value = createVariantClassName()

      expect(value).toEqual(null)
    })
  })

  describe('when a variant is lowercase', () => {
    test('returns the correct value', () => {
      const value = createVariantClassName('active')

      expect(value).toEqual('isActive')
    })
  })

  describe('when a variant is uppercase', () => {
    test('returns the correct value', () => {
      const value = createVariantClassName('ACTIVE')

      expect(value).toEqual('isActive')
    })
  })

  describe('when a variant has mixed casing', () => {
    test('returns the correct value', () => {
      const value = createVariantClassName('AcTiVe')

      expect(value).toEqual('isActive')
    })
  })
})
