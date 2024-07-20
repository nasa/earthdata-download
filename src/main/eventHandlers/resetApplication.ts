// @ts-nocheck

import { app, shell } from 'electron'
import path from 'path'

/**
 * Opens the download folder associated with the given download ID.
 * @param {Object} params The params object.
 * @param {Object} params.database `EddDatabase` instance
 * @param {String} params.info.downloadId The download ID.
 */
const resetApplication = async ({
  database
}) => {
  const userDataPath = app.getPath('userData')
  const databaseFilePath = path.join(userDataPath, 'edd-database.sqlite3')

  console.log(`Deleting database file: ${databaseFilePath}`)

  try {
    // Disconnect from the database file
    await database.destroy()

    // Delete the database file
    await shell.trashItem(databaseFilePath)

    // Relaunch the application
    app.relaunch()
    app.exit(0)
  } catch (error) {
    console.log('Error deleting database file', error)
  }
}

export default resetApplication
