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
    return this.db('preferences')
      .where({ id: this.preferencesId })
      .first()
  }

  /**
   * Sets the given preferences.
   * @param {Object} field specified preferences field to be retrieved
   */
  async getPreferencesByField(field) {
    const preferences = await this.db('preferences')
      .where({ id: this.preferencesId })
      .first()
      .select(field)
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
    return this.db('token')
      .where({ id: this.tokenId })
      .first()
  }

  async setToken(token) {
    return this.db('token')
      .update({ token })
      .where({ id: this.tokenId })
      .returning()
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
   * Returns all downloads that match the where object.
   */
  async getAllDownloadsWhere(where) {
    return this.db('downloads')
      .select()
      .where(where)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Returns a download given the downloadId.
   * @param {String} downloadId downloadId for download.
   */
  async getDownloadById(downloadId) {
    return this.db('downloads')
      .select()
      .where({ id: downloadId })
      .first()
  }

  /**
   * Returns the selected downloads.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getDownloadsWhere(where) {
    return this.db('downloads')
      .select('id', 'getLinksToken', 'getLinksUrl')
      .where(where)
  }

  /**
   * Sets the active column of a download to false.
   * @param {String} downloadId ID of download to update.
   */
  async clearDownload(downloadId) {
    let query = this.db('downloads')
      .update({
        active: false
      })

    if (downloadId) {
      query = query.where({ id: downloadId })
    }

    return query
  }

  /**
   * Creates a new download.
   * @param {String} downloadId ID of download to create.
   * @param {Object} data The data of the download to be inserted.
   */
  async createDownload(downloadId, data) {
    return this.db('downloads')
      .insert({
        id: downloadId,
        active: true,
        ...data
      })
  }

  /**
   * Updates the selected download.
   * @param {String} downloadId ID of download to update.
   * @param {Object} data The data of the download to be updated.
   */
  async updateDownloadById(downloadId, data) {
    return this.db('downloads')
      .update(data)
      .where({ id: downloadId })
  }

  /**
   * Updates downloads that match the whereIn criteria.
   * @param {Object} whereIn Knex `whereIn` object to select downloads to be updated.
   * @param {Object} data The data of the download to be updated.
   */
  async updateDownloadsWhereIn(whereIn, data) {
    return this.db('downloads')
      .returning(['id'])
      .update(data)
      .whereIn(...whereIn)
  }

  /**
   * Updates downloads that match the whereIn criteria.
   * @param {Object} whereIn Knex `whereIn` object to select downloads to be updated.
   * @param {Object} data The data of the download to be updated.
   */
  async updateDownloadsWhereAndWhereNotIn(where, whereIn, data) {
    return this.db('downloads')
      .returning(['id'])
      .update(data)
      .where(where)
      .whereNotIn(...whereIn)
  }

  /**
   * Updates downloads that match the where and the whereNot criteria.
   * @param {Object} whereIn Knex `whereIn` object to select downloads to be updated.
   * @param {Object} whereNot Knex `whereNot` object to select downloads which properties they should not have
   * @param {Object} data The data of the download to be updated.
   */
  async updateFilesWhereAndWhereNot(where, whereNot, data) {
    return this.db('files')
      .returning(['id', 'downloadId'])
      .update(data)
      .where(where)
      .whereNot(whereNot)
  }

  /**
   * Deletes the selected download.
   * @param {String} downloadId ID of download to delete.
   */
  async deleteDownloadById(downloadId) {
    await this.db('files')
      .delete()
      .where({ downloadId })

    return this.db('downloads')
      .delete()
      .where({ id: downloadId })
  }

  /**
   * Deletes all downloads.
   */
  async deleteAllDownloads() {
    await this.db('files').delete()

    await this.db('pauses').delete()

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
      await this.db('files')
        .insert(linkChunk.map((url) => {
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
    return this.db('files')
      .select()
      .where(where)
      .first()
  }

  /**
   * Returns the selected files.
   * @param {Object} where Knex `where` object to select downloads.
   */
  async getFilesWhere(where) {
    return this.db('files')
      .select()
      .where(where)
      .orderBy('createdAt', 'asc')
  }

  /**
   * Returns the errored files.
   * @param {String} downloadId Id of the download to retrieve errored files.
   */
  async getErroredFiles() {
    return this.db('files')
      // Add additional fields to this select if we need to display any error info
      .select(
        'downloadId'
      )
      .count('id as numberErrors')
      .where({
        state: downloadStates.error
      })
      .groupBy('downloadId')
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
    const [result] = await this.db('files')
      .count('id')
      .where(where)

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Returns count of files that are not in the `completed` state for the given downloadId
   * @param {String} downloadId Id of the download to count files.
   */
  async getNotCompletedFilesCountByDownloadId(downloadId) {
    const [result] = await this.db('files')
      .count('id')
      .where({ downloadId })
      .whereNotIn('state', [
        downloadStates.completed,
        downloadStates.cancelled,
        downloadStates.error
      ])

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Returns count of files that are active for the given downloadId
   * @param {String} downloadId Id of the download to count files.
   */
  async getActiveFilesCountByDownloadId(downloadId) {
    const [result] = await this.db('files')
      .count('id')
      .where({
        downloadId,
        state: downloadStates.active
      })

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
      .returning(['id', 'downloadId', 'filename'])
      .update(data)
      .where(where)
  }

  /** Pauses */

  /**
   * Creates a new pause row for a file based on the downloadId and filename.
   * @param {String} downloadId Download ID of the file to create a pause.
   * @param {String} filename Filename of the file to create a pause.
   */
  async createPauseByDownloadIdAndFilename(downloadId, filename) {
    const { id: fileId } = await this.db('files')
      .select('id')
      .where({
        downloadId,
        filename
      })
      .first()

    const data = {
      downloadId,
      fileID: fileId,
      timeStart: new Date().getTime()
    }

    return this.db('pauses')
      .insert(data)
  }

  /**
   * Creates a new pause row for all active files of the provided downloadId.
   * @param {String} downloadId Download ID of the file to create a pause.
   * @param {Boolean} pauseFiles Should files also have pauses created.
   */
  async createPauseByDownloadId(downloadId, pauseFiles) {
    const timeStart = new Date().getTime()
    let data = []

    if (pauseFiles) {
      const files = await this.db('files')
        .select('id')
        .where({
          downloadId,
          state: downloadStates.active
        })

      data = files.map((file) => ({
        downloadId,
        fileId: file.id,
        timeStart
      }))
    }

    const query = this.db('pauses')
      .select('id')
      .where({ downloadId })
      .whereNull('fileId')
      .whereNull('timeEnd')
    const downloadAlreadyPaused = await query

    if (downloadAlreadyPaused.length === 0) {
      data.push({
        downloadId,
        timeStart
      })
    }

    if (data.length > 0) {
      return this.db('pauses')
        .insert(data)
    }

    return null
  }

  /**
   * Creates a new pause row for all active files and downloads.
   */
  async createPauseForAllActiveDownloads() {
    const files = await this.db('files')
      .select('id', 'downloadId')
      .where({
        state: downloadStates.active
      })

    const timeStart = new Date().getTime()
    const filesData = files.map((file) => ({
      downloadId: file.downloadId,
      fileId: file.id,
      timeStart
    }))

    const downloads = await this.db('downloads')
      .select('id')
      .where({
        state: downloadStates.active
      })
    const downloadsData = downloads.map((download) => ({
      downloadId: download.id,
      timeStart
    }))

    const data = [
      ...filesData,
      ...downloadsData
    ]

    if (!data.length) return null

    return this.db('pauses')
      .insert(data)
  }

  /**
   * Creates a new pause row with the provided data.
   * @param {Object} data Data to be inserted into the pause table.
   */
  async createPauseWith(data) {
    return this.db('pauses')
      .insert(data)
  }

  /**
   * Sets the timeEnd column for any pause rows without a timeEnd that matches the downloadId or filename.
   * @param {String} downloadId Download ID of the file to end a pause.
   * @param {String} filename Filename of the file to end a pause.
   */
  async endPause(downloadId, filename) {
    const where = {
      downloadId,
      timeEnd: null
    }

    if (filename) {
      where.fileID = this.db.raw(`SELECT id FROM files WHERE downloadId = ${downloadId} AND filename = ${filename};`)
    }

    return this.db('pauses')
      .update({
        timeEnd: new Date().getTime()
      })
      .where(where)
  }

  /**
   * Returns the sum of the pause rows for the downloadId where the fileId is null.
   * @param {String} downloadId Download ID of the file to end a pause.
   */
  async getPausesSum(downloadId) {
    const where = {
      downloadId
    }

    const result = await this.db('pauses')
      .sum({
        pausesSum: this.db.raw('IFNULL(`pauses`.`timeEnd`, UNIXEPOCH() * 1000.0) - `pauses`.`timeStart`')
      })
      .where(where)
      .whereNull('fileId')
      .first()

    const { pausesSum } = result

    return pausesSum
  }

  /**
   * Deletes the pause rows for a file that matches the provided downloadId and filename.
   * @param {String} downloadId Download ID of the file to delete pauses.
   * @param {String} filename Filename of the file to delete pauses.
   */
  async deletePausesByDownloadIdAndFilename(downloadId, filename) {
    const { id: fileId } = await this.db('files')
      .select('id')
      .where({
        downloadId,
        filename
      })
      .first()

    return this.db('pauses')
      .delete()
      .where({
        downloadId,
        fileId
      })
  }

  /**
   * Deletes the pause rows for every pause that includes the provided downloadId.
   * @param {String} downloadId Download ID of the file to delete pauses.
   */
  async deleteAllPausesByDownloadId(downloadId) {
    return this.db('pauses')
      .delete()
      .where({ downloadId })
  }

  /**
   * Deletes the pause rows for all file that match the provided downloadId.
   * @param {String} downloadId Download ID of the file to delete pauses.
   */
  async deleteFilePausesByDownloadId(downloadId) {
    return this.db('pauses')
      .delete()
      .where({ downloadId })
      .whereNotNull('fileId')
  }

  /** Reports */

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
        // Return the count of the `state` column when the value is "COMPLETED" as `finishedFiles`
        finishedFiles: this.db.raw('CASE `state` WHEN \'COMPLETED\' THEN 1 ELSE NULL END')
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
        // `remainingTime` = (`timeTaken` / `receivedBytes`) * remainingBytes
        // `timeTaken` = (`timeEnd` (defaulting to now) - `timeStart`) - the sum of the pause rows for the file
        this.db.raw('(((IFNULL(`files`.`timeEnd`, UNIXEPOCH () * 1000.0) - `files`.`timeStart`) - IFNULL(sum(IFNULL(`pauses`.`timeEnd`, UNIXEPOCH () * 1000.0) - `pauses`.`timeStart`), 0)) / receivedBytes * (totalBytes - receivedBytes)) AS remainingTime')
      )
      .fullOuterJoin('pauses', 'files.id', '=', 'pauses.fileId')
      .where({
        'files.downloadId': downloadId
      })
      .groupBy('files.id')

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
    const query = this.db('files')
      .select(
        'downloads.id',
        'downloads.downloadLocation',
        'downloads.loadingMoreFiles',
        'downloads.state',
        this.db.raw('(IFNULL(`downloads`.`timeEnd`, UNIXEPOCH() * 1000.0) - `downloads`.`timeStart`) as totalTime')
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
        filesWithProgress: this.db.raw('CASE WHEN `percent` > 0 THEN 1 ELSE NULL END'),
        // Return the count of the `state` column when the value is "COMPLETED" as `finishedFiles`
        finishedFiles: this.db.raw('CASE `files`.`state` WHEN \'COMPLETED\' THEN 1 ELSE NULL END')
      })
      .join('downloads', { 'files.downloadId': 'downloads.id' })
      .where({
        'files.downloadId': downloadId
      })

    const [result] = await query

    return result
  }

  /**
   * Returns the data needed for the Downloads report
   * @param {Number} limit Limit of the files returned
   * @param {Number} offset Offset of the files returned
   */
  async getDownloadsReport(active, limit, offset) {
    return this.db('downloads')
      .select(
        'downloads.id',
        'downloads.loadingMoreFiles',
        'downloads.state',
        'downloads.timeStart',
        this.db.raw('(IFNULL(`downloads`.`timeEnd`, UNIXEPOCH() * 1000.0) - `downloads`.`timeStart`) as totalTime')
      )
      .where({ active })
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Returns the total number of downloads to be reported
   */
  async getAllDownloadsCount(active) {
    const [result] = await this.db('downloads')
      .count('id')
      .where({ active })

    const { 'count(`id`)': number } = result

    return number
  }

  /**
   * Returns the total number of files and completed files
   */
  async getFilesTotals() {
    const [result] = await this.db('files')
      .count({
        // Return the count of the `id` column as `totalFiles`
        totalFiles: 'files.id',
        // Return the count of the `state` column when the value is "COMPLETED" as `finishedFiles`
        totalCompletedFiles: this.db.raw('CASE `files`.`state` WHEN \'COMPLETED\' THEN 1 ELSE NULL END')
      })

    return result
  }
}

export default EddDatabase
