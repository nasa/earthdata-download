// @ts-nocheck

import jwt from 'jsonwebtoken'

/**
 * Checks if the stored token is expired. If it is expired, removes it from the database. If not, returns the token.
 * @param {Object} params
 * @param {Object} params.database `EddDatabase` instance
 * @returns {String|null} The valid token, or false if the token is expired or not present
 */
const checkTokenExpired = async ({
  database
}) => {
  // Get the stored token from the database
  const { token } = await database.getToken()

  if (!token) {
    return null
  }

  // Decode the token to check its expiration
  const decodedToken = jwt.decode(token, { complete: true })

  if (decodedToken && decodedToken.payload && decodedToken.payload.exp) {
    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000)

    // If the token expires in the future, return the token
    if (decodedToken.payload.exp > currentTime) return token
  }

  console.log('User token has expired, removing it from the database.')

  // Token is expired, remove it from the database
  // We remove the token by setting it to null, not actually deleting the record
  await database.setToken(null)

  return null
}

export default checkTokenExpired
