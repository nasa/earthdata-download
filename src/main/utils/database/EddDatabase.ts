// @ts-nocheck

import { chunk } from 'lodash'

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
    return this.db('downloads')
      .select()
      .orderBy('createdAt', 'desc')
  }

  /**
   * Returns a download given the downloadId.
   * @param {String} downloadId downloadId for download.
   */
  async getDownloadById(downloadId) {
    return this.db('downloads').select().where({ id: downloadId }).first()
  }

  /**
   * Returns the selected downloads.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getDownloadsWhere(where) {
    return this.db('downloads').select('id', 'getLinksToken', 'getLinksUrl').where(where)
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
   * @param {Object} data The data of the download to be updated.
   */
  async updateDownloadsWhereIn(whereIn, data) {
    return this.db('downloads').update(data).whereIn(...whereIn)
  }

  /**
   * Updates downloads that match the where and the whereNot criteria.
   * @param {Object} whereIn Knex `whereIn` object to select downloads to be updated.
   * @param {Object} whereNot Knex `whereNot` object to select downloads which properties they should not have
   * @param {Object} data The data of the download to be updated.
   */
  async updateFilesWhereAndWhereNot(where, whereNot, data) {
    return this.db('files').update(data).where(where).whereNot(whereNot)
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
   * Adds links (files) to the given download.
   * @param {String} downloadId Id of the download to add files.
   * @param {Array} links List of URLs to add as files.
   */
  async addLinksByDownloadId(downloadId, links) {
    // Chunk the links to a max of 100 to ensure the insert statement isn't too long
    const chunks = chunk(links, 100)

    const promises = chunks.map(async (linkChunk) => {
      await this.db('files').insert(linkChunk.map((url) => {
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
    })

    await Promise.all(promises)
  }

  /**
   * Returns the selected file.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFileWhere(where) {
    return this.db('files').select().where(where).first()
  }

  /**
   * Returns the selected files.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFilesWhere(where, limit, offset = 0) {
    let query = this.db('files')
      .select()
      .where(where)
      .orderBy('createdAt', 'asc')

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.offset(offset)
    }

    return query
  }

  /**
   * Returns files in the pending state, with the optional fileId included. Limited results by the limit parameter
   * @param {Number} limit Number of files to return
   * @param {Number} fileId ID of files to update.
   */
  async getFilesToStart(limit, fileId) {
    let query = this.db('files')
      .select('files.*')
      .join('downloads', { 'files.downloadId': 'downloads.id' })
      .where({
        'files.state': downloadStates.pending,
        'downloads.state': downloadStates.active
      })

    // If a fileId was provided, add it to the query
    if (fileId) {
      query = query.orWhere({ 'files.id': fileId })
    }

    query = query.orderBy('files.createdAt', 'asc')
      .limit(limit)

    // Execute the full query and return the value
    return query
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
   * Returns count of files that are not in the `completed` state for the given downloadId
   * @param {String} downloadId Id of the download to add files.
   */
  async getNotCompletedFilesCountByDownloadId(downloadId) {
    const [result] = await this.db('files')
      .count('id')
      .where({ downloadId })
      .whereNotIn('state', [downloadStates.completed, downloadStates.cancelled])

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Updates the given file.
   * @param {Number} fileId ID of files to update.
   * @param {Object} data The data of the file to be updated.
   */
  async updateFileById(fileId, data) {
    return this.db('files')
      .update(data)
      .where({ id: fileId })
  }

  /**
   * Updates the given files.
   * @param {Object} where Knex `where` object to select files.
   * @param {Object} data The data of the file to be updated.
   */
  async updateFilesWhere(where, data) {
    return this.db('files')
      .update(data)
      .where(where)
  }

  /**
   * Returns the files progress for the given downloadId
   * @param {String} downloadId ID of download to return progress
   */
  async getDownloadReport(downloadId) {
    const [result] = await this.db('files')
      .sum({
        // Return the sum of the `percent` column as `percentSum`
        percentSum: 'percent'
      })
      .count({
        // Return the count of the `id` column as `totalFiles`
        totalFiles: 'id',
        // Return the count of the `state` column when the value is `COMPLETED` as `finishedFiles`
        finishedFiles: this.db.raw('CASE "state" WHEN "COMPLETED" THEN 1 ELSE NULL END'),
        // Return the count of the `state` column when the value is `ERROR` as `totalErroredFiles`
        erroredFiles: this.db.raw('CASE "state" WHEN "ERROR" THEN 1 ELSE NULL END')
      })
      .where({
        downloadId
      })

    return result
  }

  /**
   * Returns the data needed for the Files report
   * @param {Object} params
   * @param {Object} downloadId Download ID of the files to report
   * @param {Boolean} hideCompleted Should the report return completed files
   * @param {Number} limit Limit of the files returned
   * @param {Number} offset Offset of the files returned
   */
  async getFilesReport({
    downloadId,
    hideCompleted,
    limit,
    offset
  }) {
    let query = this.db('files')
      .select(
        'files.downloadId',
        'files.filename',
        'files.state',
        'files.percent',
        'files.receivedBytes',
        'files.totalBytes',
        // Return the `remainingTime` with this formula:
        // (Time Taken / `receivedBytes`) * remainingBytes / 1000
        this.db.raw('((((UNIXEPOCH() * 1000.0) - timeStart) / receivedBytes) * (totalBytes - receivedBytes)) / 1000 as remainingTime')
      )
      .where({
        downloadId
      })

    if (hideCompleted) {
      query = query.whereNot({
        state: downloadStates.completed
      })
    }

    query = query.limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'asc')

    return query
  }

  /**
   * Returns the total number of files to be reported on in the Download
   * @param {Object} params
   * @param {Object} downloadId Download ID of the files to report
   * @param {Boolean} hideCompleted Should the report return completed files
   */
  async getTotalFilesPerFilesReport({
    downloadId,
    hideCompleted
  }) {
    let query = this.db('files')
      .count('id')
      .where({
        downloadId
      })

    if (hideCompleted) {
      query = query.whereNot({
        state: downloadStates.completed
      })
    }

    const [result] = await query

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Returns the data needed for the Files header report
   * @param {String} downloadId Download ID of the files to report
   */
  async getFilesHeaderReport(downloadId) {
    const [result] = await this.db('files')
      .select(
        'downloads.id',
        'downloads.downloadLocation',
        'downloads.state',
        'downloads.createdAt',
        'downloads.timeEnd',
        'downloads.timeStart'
      )
      .sum({
        // Return the sum of the `percent` column as `percentSum`
        percentSum: 'files.percent',
        // Returns the sum of the `receivedBytes` as `receivedBytesSum`
        receivedBytesSum: 'files.receivedBytes',
        // Returns the sum of the `totalBytes` as `totalBytesSum`
        totalBytesSum: 'files.totalBytes'
      })
      .count({
        // Return the count of the `id` column as `totalFiles`
        totalFiles: 'files.id',
        // Return the count of the `percent` field when the percent is greater than 0 as `filesWithProgress`
        filesWithProgress: this.db.raw('CASE WHEN "percent" > 0 THEN 1 ELSE NULL END'),
        // Return the count of the `state` column when the value is `COMPLETED` as `finishedFiles`
        finishedFiles: this.db.raw('CASE "files"."state" WHEN "COMPLETED" THEN 1 ELSE NULL END'),
        // Return the count of the `state` column when the value is `ERROR` as `totalErroredFiles`
        erroredFiles: this.db.raw('CASE "files"."state" WHEN "ERROR" THEN 1 ELSE NULL END')
      })
      .join('downloads', { 'files.downloadId': 'downloads.id' })
      .where({
        downloadId
      })

    return result
  }

  /**
   * Returns the data needed for the Downloads report
   * @param {Number} limit Limit of the files returned
   * @param {Number} offset Offset of the files returned
   */
  async getDownloadsReport(limit, offset) {
    return this.db('downloads')
      .select(
        'downloads.createdAt',
        'downloads.id',
        'downloads.loadingMoreFiles',
        'downloads.state',
        'downloads.timeEnd',
        'downloads.timeStart'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Returns the total number of downloads to be reported
   */
  async getAllDownloadsCount() {
    const [result] = await this.db('downloads')
      .count('id')

    const { 'count(`id`)': number } = result

    return number
  }
}

export default EddDatabase
