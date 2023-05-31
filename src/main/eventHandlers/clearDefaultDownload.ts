// @ts-nocheck

/**
 * Clears the default download from the user preferences
 * @param {Object} params
 * @param {Object} params.store `electron-store` instance
 */
const clearDefaultDownload = ({
  store
}) => {
  const preferences = store.get('preferences')

  // Remove the defaultDownloadLocation from the store
  store.set('preferences', {
    ...preferences,
    defaultDownloadLocation: undefined
  })
}

export default clearDefaultDownload
