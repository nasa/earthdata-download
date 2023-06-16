// @ts-nocheck

import { shell } from 'electron'
import path from 'path'

import onDone from './willDownloadEvents/onDone'
import onUpdated from './willDownloadEvents/onUpdated'

import downloadStates from '../../app/constants/downloadStates'

/**
 * Handles the DownloadItem events
 * @param {Object} params
 */
const willDownload = async ({
  currentDownloadItems,
  database,
  downloadIdContext,
  item,
  webContents
}) => {
  const [originalUrl] = item.getURLChain()

  const context = downloadIdContext[originalUrl]

  // If no downloadIdContext is available for this download, cancel the download
  if (!context) {
    item.cancel()
    return
  }

  const {
    downloadId,
    downloadLocation,
    fileId
  } = context

  const filename = item.getFilename()

  // Set the save path for the DownloadItem
  item.setSavePath(path.join(downloadLocation, filename))

  // eslint-disable-next-line no-param-reassign
  delete downloadIdContext[originalUrl]

  // Pull the reAuthUrl for this downloadId from the database
  const {
    reAuthUrl
  } = await database.getDownloadById(downloadId)

  const urlChain = item.getURLChain()
  const lastUrl = urlChain.pop()

  // If the last item in the urlChain is EDL, set the download to pending and forward the user to EDL
  if (lastUrl.includes('oauth/authorize')) {
    item.cancel()

    await database.updateDownloadById(downloadId, {
      state: downloadStates.pending,
      timeStart: null
    })

    console.log('REDIRECT TO URS HERE')
    // TODO how to redirect to browser
    shell.openExternal(reAuthUrl)
  }

  // Add the DownloadItem to the currentDownloadItems
  currentDownloadItems.addItem(downloadId, filename, item)

  // Update the start time for the file
  await database.updateFile(fileId, {
    timeStart: new Date().getTime()
  })

  // Setup event handlers for the download item
  item.on('updated', async (event, state) => {
    await onUpdated({
      database,
      downloadId,
      item,
      state
    })
  })

  item.once('done', async (event, state) => {
    await onDone({
      currentDownloadItems,
      database,
      downloadId,
      downloadIdContext,
      item,
      state,
      webContents
    })
  })
}

export default willDownload
