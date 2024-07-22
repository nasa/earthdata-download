// @ts-nocheck

import { app, shell } from 'electron'
import path from 'path'

/**
 * Disconnects from the database, deletes the database file and relaunches the application.
 * @param {Object} params The params object.
 * @param {Object} params.database `EddDatabase` instance
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
