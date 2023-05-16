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
   * @param {String} name Name of the downloaded file
   * @param {Object} downloadItem Electron DownloadItem class instance
   */
  addItem(downloadId, name, downloadItem) {
    if (!this.downloadItems[downloadId]) {
      this.downloadItems[downloadId] = {}
    }

    this.downloadItems[downloadId][name] = downloadItem
  }

  /**
   * Cancels a downloadItem and removes it from the current downloadItems list.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} name Name of the downloaded file
   */
  cancelItem(downloadId, name) {
    if (name) {
      const item = this.getItem(downloadId, name)

      // Cancel the download
      if (item) item.cancel()
    } else if (downloadId) {
      const items = this.getAllItemsInDownload(downloadId)

      if (items) {
        Object.keys(items).forEach((name) => {
          items[name].cancel()
        })
      }
    } else {
      Object.keys(this.downloadItems).forEach((id) => {
        const items = this.getAllItemsInDownload(id)

        if (items) {
          Object.keys(items).forEach((name) => {
            items[name].cancel()
          })
        }
      })
    }

    // Remove the item from the downloadItems
    this.removeItem(downloadId, name)
  }

  /**
   * Returns a downloadItem.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} name Name of the downloaded file
   */
  getItem(downloadId, name) {
    return this.downloadItems[downloadId][name]
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

    return Object.keys(this.downloadItems).reduce((sum, downloadId) => {
      const itemsByDownloadId = this.downloadItems[downloadId]

      return sum + Object.keys(itemsByDownloadId).length
    }, 0)
  }

  /**
   * Pauses a downloadItem.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} name Name of the downloaded file
   */
  pauseItem(downloadId, name) {
    if (name) {
      const item = this.getItem(downloadId, name)

      if (item) item.pause()
    } else if (downloadId) {
      const items = this.getAllItemsInDownload(downloadId)

      if (items) {
        Object.keys(items).forEach((name) => {
          items[name].pause()
        })
      }
    } else {
      Object.keys(this.downloadItems).forEach((id) => {
        const items = this.getAllItemsInDownload(id)

        if (items) {
          Object.keys(items).forEach((name) => {
            items[name].pause()
          })
        }
      })
    }
  }

  /**
   * Removes a downloadItem from the current downloadItems list.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} name Name of the downloaded file
   */
  removeItem(downloadId, name) {
    try {
      if (name) {
        delete this.downloadItems[downloadId][name]
      } else if (downloadId) {
        delete this.downloadItems[downloadId]
      } else {
        this.downloadItems = {}
      }
    } catch {
      console.log(`Item: ${downloadId}.${name} did not exist.`)
    }
  }

  /**
   * Resumes a downloadItem.
   * @param {String} downloadId downloadId the item belongs to
   * @param {String} name Name of the downloaded file
   */
  resumeItem(downloadId, name) {
    if (name) {
      const item = this.getItem(downloadId, name)

      if (item) item.resume()
    } else if (downloadId) {
      const items = this.getAllItemsInDownload(downloadId)

      if (items) {
        Object.keys(items).forEach((name) => {
          items[name].resume()
        })
      }
    } else {
      Object.keys(this.downloadItems).forEach((id) => {
        const items = this.getAllItemsInDownload(id)

        if (items) {
          Object.keys(items).forEach((name) => {
            items[name].resume()
          })
        }
      })
    }
  }
}

module.exports = CurrentDownloadItems
