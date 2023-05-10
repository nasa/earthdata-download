const { dialog } = require('electron')

/**
 * Opens the electron open dialog to choose a download location
 * @param {Object} params
 * @param {Object} params.window Electron window instance
 */
const chooseDownloadLocation = ({
  window
}) => {
  const result = dialog.showOpenDialogSync(window, {
    message: 'Where would you like to download your files?',
    buttonLabel: 'Choose folder',
    properties: [
      'openDirectory',
      'createDirectory'
    ]
  })

  // Handle the user cancelling the dialog
  if (!result) return

  const [downloadLocation] = result

  // Send a message back to the renderer with the downloadLocation
  window.webContents.send('setDownloadLocation', { downloadLocation })
}

module.exports = { chooseDownloadLocation }
