// @ts-nocheck

import { app } from 'electron'
import knex from 'knex'
import path from 'path'

export const getDatabaseConnection = (dbPath) => {
  // Set the migration and seeds directories to the resourcePath when the app is packaged
  const migrationsDirectory = app.isPackaged ? path.join(process.resourcesPath, 'migrations') : 'migrations'
  const seedsDirectory = app.isPackaged ? path.join(process.resourcesPath, 'seeds') : 'seeds'

  const config = {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(dbPath, 'edd-database.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: migrationsDirectory
    },
    seeds: {
      directory: seedsDirectory
    }
  }

  return knex(config)
}

export default getDatabaseConnection
