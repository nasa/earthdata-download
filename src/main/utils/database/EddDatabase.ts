// @ts-nocheck

import downloadStates from '../../../app/constants/downloadStates'
import { getDatabaseConnection } from './getDatabaseConnection'

class EddDatabase {
  constructor(dbPath) {
    this.db = getDatabaseConnection(dbPath)

    // Always use row ID 1 for the preferences table
    this.preferencesId = 1
    // Always use row ID 1 for the token table
    this.tokenId = 1
  }

  /**
   * Migrates the database.
   */
  async migrateDatabase() {
    await this.db.migrate.latest()
    await this.db.seed.run()
  }

  /* Preferences */

  /**
   * Returns the preferences.
   */
  async getPreferences() {
    return this.db('preferences').where({ id: this.preferencesId }).first()
  }

  /**
   * Sets the given preferences.
   * @param {Object} field specified preferences field to be retrieved
   */
  async getPreferencesByField(field) {
    const preferences = await this.db('preferences').where({ id: this.preferencesId }).first().select(field)
    const { [field]: fieldValue } = preferences
    return fieldValue
  }

  /**
   * Sets the given preferences.
   * @param {Object} data Preferences to be set.
   */
  async setPreferences(data) {
    return this.db('preferences').update(data).where({ id: this.preferencesId }).returning()
  }

  /* Token */

  async getToken() {
    return this.db('token').where({ id: this.tokenId }).first()
  }

  async setToken(token) {
    return this.db('token').update({ token }).where({ id: this.tokenId }).returning()
  }

  /* Downloads */

  /**
   * Returns all downloads.
   */
  async getAllDownloads() {
    return this.db('downloads').select().orderBy('createdAt', 'desc')
  }

  /**
   * Returns a download given the downloadId.
   * @param {String} downloadId downloadId for download.
   */
  async getDownloadById(downloadId) {
    return this.db('downloads').select().where({ id: downloadId }).first()
  }

  /**
 * Returns a download given the downloadId.
 * @param {String} downloadId downloadId for download.
 */
  async getNumErrors() {
    const [result] = await this.db('downloads').sum('numErrors')
    const { 'sum(`numErrors`)': sum } = result

    return sum
  }

  /**
   * Creates a new download.
   * @param {String} downloadId ID of download to create.
   * @param {Object} data The data of the download to be inserted.
   */
  async createDownload(downloadId, data) {
    return this.db('downloads').insert({
      id: downloadId,
      ...data
    })
  }

  /**
   * Updates the selected download.
   * @param {String} downloadId ID of download to update.
   * @param {Object} data The data of the download to be updated.
   */
  async updateDownloadById(downloadId, data) {
    return this.db('downloads').update(data).where({ id: downloadId })
  }

  /**
   * Updates downloads that match the whereIn criteria.
   * @param {Object} whereIn Knex `whereIn` object to select downloads to be updated.
   * @param {Object} data data The data of the download to be updated.
   */
  async updateDownloadsWhereIn(whereIn, data) {
    return this.db('downloads').update(data).whereIn(...whereIn)
  }

  /**
   * Deletes the selected download.
   * @param {String} downloadId ID of download to delete.
   */
  async deleteDownloadById(downloadId) {
    await this.db('files').delete().where({ downloadId })
    return this.db('downloads').delete().where({ id: downloadId })
  }

  /**
   * Deletes all downloads.
   */
  async deleteAllDownloads() {
    await this.db('files').delete()
    return this.db('downloads').delete()
  }

  /* Files */

  /**
   * Returns the selected file.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFileWhere(where) {
    return this.db('files').select().where(where).first()
  }

  /**
   * Returns files in the pending state, with the optional fileId included. Limited results by the limit parameter
   * @param {Number} limit Number of files to return
   * @param {Number} fileId ID of files to update.
   */
  async getFilesToStart(limit, fileId) {
    let query = this.db('files')
      .select()
      .where({ state: downloadStates.pending })

    // If a fileId was provided, add it to the query
    if (fileId) {
      query = query.orWhere({ id: fileId })
    }

    query = query.orderBy('createdAt', 'asc')
      .limit(limit)

    // Execute the full query and return the value
    return query
  }

  /**
   * Returns the selected files.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFilesWhere(where) {
    return this.db('files').select().where(where).orderBy('createdAt', 'asc')
  }

  /**
   * Returns the count of selected files.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFileCountWhere(where) {
    const [result] = await this.db('files').count('id').where(where)

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Returns the count of selected files.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFileStateCounts(downloadId) {
    const stateCounts = {}
    const checkedStates = ['active', 'completed', 'error', 'paused']
    checkedStates.forEach(async (state) => {
      const [result] = await this.db('files').count('id').where({
        downloadId,
        state: downloadStates[state]
      })
      const { 'count(`id`)': number } = result

      stateCounts[state] = number
    })

    return stateCounts
  }

  /**
   * Returns count of files that are not in the `completed` state for the given downloadId
   * @param {String} downloadId Id of the download to add files.
   */
  async getNotCompletedFilesCountByDownloadId(downloadId) {
    const [result] = await this.db('files')
      .count('id')
      .where({ downloadId })
      .whereNot({ state: downloadStates.completed && downloadStates.error })

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Updates the given file.
   * @param {Number} fileId ID of files to update.
   * @param {Object} data The data of the file to be updated.
   */
  async updateFile(fileId, data) {
    return this.db('files').update(data).where({ id: fileId })
  }

  /**
 * Deletes the given file.
 * @param {Number} fileId ID of files to update.
 */
  async deleteFile(fileId) {
    await this.db('files').delete().where({ filename: fileId })
  }

  /**
   * Adds links (files) to the given download.
   * @param {String} downloadId Id of the download to add files.
   * @param {Array} links List of URLs to add as files.
   */
  async addLinksByDownloadId(downloadId, links) {
    return this.db('files').insert(links.map((url) => {
      const filename = url.split('/').pop()

      return {
        createdAt: new Date().getTime(),
        downloadId,
        filename,
        percent: 0,
        state: downloadStates.pending,
        url
      }
    }))
  }

  /**
   * Returns the files progress for the given downloadId
   * @param {String} downloadId ID of download to return progress
   */
  async getDownloadFilesProgressByDownloadId(downloadId) {
    const [result] = await this.db('files')
      .sum({
        // Return the sum of the `percent` column as `percentSum`
        percentSum: 'percent'
      })
      .count({
        // Return the count of the `id` column as `totalFiles`
        totalFiles: 'id',
        // Return the count of the `state` column when the value is `COMPLETED` as `finishedFiles`
        finishedFiles: this.db.raw('CASE "state" WHEN "COMPLETED" THEN 1 ELSE NULL END')
      })
      .where({
        downloadId
      })

    return result
  }
}

export default EddDatabase
