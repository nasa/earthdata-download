import checkTokenExpired from '../checkTokenExpired'

describe('checkTokenExpired', () => {
  describe('when there is no token stored', () => {
    test('returns null', async () => {
      const database = {
        getToken: jest.fn().mockResolvedValue({ token: null }),
        setToken: jest.fn()
      }

      const result = await checkTokenExpired({ database })

      expect(database.getToken).toHaveBeenCalledTimes(1)
      expect(database.getToken).toHaveBeenCalledWith()

      expect(database.setToken).toHaveBeenCalledTimes(0)

      expect(result).toEqual(null)
    })
  })

  describe('when the token is expired', () => {
    test('removes the token from the database and returns null', async () => {
      const consoleMock = jest.spyOn(console, 'log').mockImplementation(() => {})

      // This is a JWT token with an expiration date in the past (Sun Sep 13 2020)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.dummy-signature'

      const database = {
        getToken: jest.fn().mockResolvedValue({ token: expiredToken }),
        setToken: jest.fn()
      }

      const result = await checkTokenExpired({ database })

      expect(database.getToken).toHaveBeenCalledTimes(1)
      expect(database.getToken).toHaveBeenCalledWith()

      expect(database.setToken).toHaveBeenCalledTimes(1)
      expect(database.setToken).toHaveBeenCalledWith(null)

      expect(result).toEqual(null)

      expect(consoleMock).toHaveBeenCalledTimes(1)
      expect(consoleMock).toHaveBeenCalledWith('User token has expired, removing it from the database.')
    })
  })

  describe('when the token is valid', () => {
    test('returns the token', async () => {
      // This is a JWT token with an expiration date in the future (Fri Nov 29 2120)
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ3NjIzMjQ4MDB9.dummy-signature'

      const database = {
        getToken: jest.fn().mockResolvedValue({ token: validToken }),
        setToken: jest.fn()
      }

      const result = await checkTokenExpired({ database })

      expect(database.getToken).toHaveBeenCalledTimes(1)
      expect(database.getToken).toHaveBeenCalledWith()

      expect(database.setToken).toHaveBeenCalledTimes(0)

      expect(result).toBe(validToken)
    })
  })
})
