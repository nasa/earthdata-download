// @ts-nocheck

import { app, shell } from 'electron'

/**
 * Opens the application's logs folder.
 */
const openLogFolder = async () => {
  const logsPath = app.getPath('logs')

  shell.openPath(logsPath)
}

export default openLogFolder
