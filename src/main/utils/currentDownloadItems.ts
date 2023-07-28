// @ts-nocheck

/**
 * Manages the current running downloadItems
 */
class CurrentDownloadItems {
  constructor() {
    this.downloadItems = {}
  }

  /**
   * Adds a downloadItem to the current downloads.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} filename Filename of the downloaded file
   * @param {Object} downloadItem Electron DownloadItem class instance
   */
  addItem(downloadId, filename, downloadItem) {
    if (!this.downloadItems[downloadId]) {
      this.downloadItems[downloadId] = {}
    }

    this.downloadItems[downloadId][filename] = downloadItem
  }

  /**
   * Cancels a downloadItem and removes it from the current downloadItems list.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} filename Filename of the downloaded file
   */
  cancelItem(downloadId, filename) {
    if (filename) {
      const item = this.getItem(downloadId, filename)

      // Cancel the download
      if (item) item.cancel()
    } else if (downloadId) {
      const items = this.getAllItemsInDownload(downloadId)

      if (items) {
        Object.keys(items).forEach((itemFilename) => {
          items[itemFilename].cancel()
        })
      }
    } else {
      Object.keys(this.downloadItems).forEach((id) => {
        const items = this.getAllItemsInDownload(id)

        if (items) {
          Object.keys(items).forEach((itemFilename) => {
            items[itemFilename].cancel()
          })
        }
      })
    }

    // Remove the item from the downloadItems
    this.removeItem(downloadId, filename)
  }

  /**
   * Returns a downloadItem.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} filename Filename of the downloaded file
   */
  getItem(downloadId, filename) {
    return this.downloadItems[downloadId]?.[filename]
  }

  /**
   * Returns all downloadItems belonging to the provided downloadId
   * @param {String} downloadId downloadId the items belong to
   */
  getAllItemsInDownload(downloadId) {
    return this.downloadItems[downloadId]
  }

  /**
   * Returns the number of current downloads.
   */
  getNumberOfDownloads(downloadId) {
    if (downloadId) {
      return Object.keys(this.getAllItemsInDownload(downloadId)).length
    }

    return Object.keys(this.downloadItems).reduce((sum, downloadIdKey) => {
      const itemsByDownloadId = this.downloadItems[downloadIdKey]

      return sum + Object.keys(itemsByDownloadId).length
    }, 0)
  }

  /**
   * Pauses a downloadItem.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} filename Filename of the downloaded file
   */
  pauseItem(downloadId, filename) {
    if (filename) {
      const item = this.getItem(downloadId, filename)

      if (item) item.pause()
    } else if (downloadId) {
      const items = this.getAllItemsInDownload(downloadId)

      if (items) {
        Object.keys(items).forEach((itemFilename) => {
          items[itemFilename].pause()
        })
      }
    } else {
      Object.keys(this.downloadItems).forEach((id) => {
        const items = this.getAllItemsInDownload(id)

        if (items) {
          Object.keys(items).forEach((itemFilename) => {
            items[itemFilename].pause()
          })
        }
      })
    }
  }

  /**
   * Removes a downloadItem from the current downloadItems list.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} filename Filename of the downloaded file
   */
  removeItem(downloadId, filename) {
    try {
      if (filename) {
        delete this.downloadItems[downloadId][filename]
      } else if (downloadId) {
        delete this.downloadItems[downloadId]
      } else {
        this.downloadItems = {}
      }
    } catch {
      console.log(`Item: ${downloadId}.${filename} did not exist.`)
    }
  }

  /**
   * Resumes a downloadItem.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} filename Filename of the downloaded file
   */
  resumeItem(downloadId, filename) {
    if (filename) {
      const item = this.getItem(downloadId, filename)

      if (item) item.resume()
    } else if (downloadId) {
      const items = this.getAllItemsInDownload(downloadId)

      if (items) {
        Object.keys(items).forEach((itemFilename) => {
          items[itemFilename].resume()
        })
      }
    } else {
      Object.keys(this.downloadItems).forEach((id) => {
        const items = this.getAllItemsInDownload(id)

        if (items) {
          Object.keys(items).forEach((itemFilename) => {
            items[itemFilename].resume()
          })
        }
      })
    }
  }
}

export default CurrentDownloadItems
