// @ts-nocheck

import { chunk } from 'lodash-es'

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
   * Disconnects from the database file
   */
  async destroy() {
    await this.db.destroy()
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
  async clearDownload(downloadId, clearId) {
    let query = this.db('downloads')
      .update({
        active: false,
        clearId
      })

    if (downloadId) {
      query = query.where({ id: downloadId })
    } else {
      query = query.where({ active: true })
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
   * Updates downloads that match the where criteria.
   * @param {Object} where Knex `where` object to select downloads.
   * @param {Object} data The data of the download to be updated.
   */
  async updateDownloadsWhere(where, data) {
    return this.db('downloads')
      .update(data)
      .where(where)
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
        .onConflict(['downloadId', 'filename'])
        .merge({
          // Updates the duplicateCount column by one for every
          // duplicate file, triggered by the unique constraint
          // on (downloadId, filename)
          duplicateCount: this.db.raw('?? + 1', ['duplicateCount'])
        })
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
   */
  async getErroredFiles() {
    return this.db('files')
      // Add additional fields to this select if we need to display any error info
      .select(
        'downloads.active',
        'files.downloadId'
      )
      .count('files.id as numberErrors')
      .join('downloads', { 'files.downloadId': 'downloads.id' })
      .where({
        'files.state': downloadStates.error
      })
      .whereNull('files.deleteId')
      .groupBy('files.downloadId')
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

    if (!data.length) {
      return {
        pausedIds: []
      }
    }

    const pausedDownloadIds = data.map((item) => item.downloadId)

    return {
      pausedIds: pausedDownloadIds
    }
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
      .whereNull('fileId', 'deleteId')
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
   * Returns the additional details report for the given downloadId.
   * @param {String} downloadId ID of download to return additional details
   */
  async getAdditionalDetailsReport(downloadId) {
    const query = this.db('files')
      .select(
        this.db.raw('(SELECT invalidLinks FROM downloads WHERE id = ?) as invalidLinksCount', [downloadId])
      )
      .sum({
        // Return the sum of the `duplicateCount` column as `duplicateCount`
        duplicateCount: 'duplicateCount'
      })
      .where({
        downloadId
      })

    return query
  }

  /**
   * Returns the files progress for the given downloadId
   * @param {String} downloadId ID of download to return progress
   */
  async getDownloadReport(downloadId) {
    const [result] = await this.db('files')
      .select(
        this.db.raw('(SELECT invalidLinks FROM downloads WHERE id = ?) as invalidLinksCount', [downloadId])
      )
      .sum({
        // Return the sum of the `duplicateCount` column as `duplicateCount`
        duplicateCount: 'duplicateCount',
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
      .whereNull('deleteId')

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
        'files.cancelId',
        'files.downloadId',
        'files.filename',
        'files.percent',
        'files.receivedBytes',
        'files.restartId',
        'files.state',
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
   * Returns statstics for a completed download.
   * @param {String} downloadId downloadId for download.
   */
  async getDownloadStatistics(downloadId) {
    const result = await this.db('files')
      .where({ downloadId })
      .first()
      .count('id as fileCount')
      .sum({
        // Return the sum of the `duplicateCount` column as `duplicateCount`
        duplicateCount: 'duplicateCount',
        // Returns the sum of the `receivedBytes` as `receivedBytesSum`
        receivedBytesSum: 'receivedBytes',
        // Returns the sum of the `totalBytes` as `totalBytesSum`
        totalBytesSum: 'totalBytes'
      })
      .select(
        // Returns the invalidLinks count from the downloads table
        this.db.raw('(SELECT invalidLinks FROM downloads WHERE id = ?) as invalidLinksCount', [downloadId]),
        // Returns the total download time in milliseconds
        this.db.raw('(IFNULL(MAX(timeEnd), UNIXEPOCH() * 1000) - MIN(timeStart)) as totalDownloadTime'),
        // Returns the count of files that are not in the completed state
        this.db.raw(`(SELECT COUNT(id) FROM files WHERE downloadId = ? AND state != '${downloadStates.completed}') as incompleteFileCount`, [downloadId]),
        // Returns the count of files that are in the error state
        this.db.raw(`(SELECT COUNT(id) FROM files WHERE downloadId = ? AND state = '${downloadStates.error}') as erroredCount`, [downloadId]),
        // Returns the count of files that are in the interrupted state and can be resumed
        this.db.raw(`(SELECT COUNT(id) FROM files WHERE downloadId = ? AND state = '${downloadStates.interruptedCanResume}') as interruptedCanResumeCount`, [downloadId]),
        // Returns the count of files that are in the interrupted state and cannot be resumed
        this.db.raw(`(SELECT COUNT(id) FROM files WHERE downloadId = ? AND state = '${downloadStates.interruptedCanNotResume}') as interruptedCanNotResumeCount`, [downloadId]),
        // Returns the count of files that are in the cancelled state
        this.db.raw(`(SELECT COUNT(id) FROM files WHERE downloadId = ? AND state = '${downloadStates.cancelled}') as cancelledCount`, [downloadId]),
        // Returns the count of files that are in the paused state
        this.db.raw('(SELECT COUNT(id) FROM pauses WHERE downloadId = ? AND fileId IS NULL) as pauseCount', [downloadId])
      )

    return result
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
        'downloads.cancelId',
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
    let query = this.db('downloads')
      .select(
        'downloads.cancelId',
        'downloads.id',
        'downloads.loadingMoreFiles',
        'downloads.restartId',
        'downloads.state',
        'downloads.timeStart',
        this.db.raw('(IFNULL(`downloads`.`timeEnd`, UNIXEPOCH() * 1000.0) - `downloads`.`timeStart`) as totalTime')
      )
      .where({ active })
      .whereNull('deleteId')

    if (active) {
      query = query.orWhereNotNull('restartId')
    } else {
      query = query.whereNull('restartId')
    }

    query = query.limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')

    return query
  }

  /**
   * Returns the total number of downloads to be reported
   */
  async getAllDownloadsCount(active) {
    let query = this.db('downloads')
      .count('id')
      .where({ active })
      .whereNull('deleteId')

    if (active) {
      query = query.orWhereNotNull('restartId')
    } else {
      query = query.whereNull('restartId')
    }

    const [result] = await query

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
      .join('downloads', { 'files.downloadId': 'downloads.id' })
      .where({ 'downloads.active': true })
      .whereNull('files.deleteId', 'files.restartId')

    return result
  }

  /**
   * Adds a given deleteId to downloads, files and pauses.
   * @param downloadId Download Id to add the deleteId.
   * @param deleteId Delete ID to add to the database.
   */
  async addDeleteId(downloadId, deleteId) {
    // Add the deleteId to the specific downloadId
    if (downloadId) {
      await this.db('downloads')
        .update({ deleteId })
        .where({ id: downloadId })

      await this.db('files')
        .update({ deleteId })
        .where({ downloadId })

      await this.db('pauses')
        .update({ deleteId })
        .where({ id: downloadId })

      return
    }

    // Add the deleteId to all pauses where the download is inactive
    await this.db('pauses')
      .update({ deleteId })
      .whereIn('downloadId', function select() {
        this
          .select('id')
          .from('downloads')
          .where({ active: false })
      })

    // Add the deleteId to all files where the download is inactive
    await this.db('files')
      .update({ deleteId })
      .whereIn('downloadId', function select() {
        this
          .select('id')
          .from('downloads')
          .where({ active: false })
      })

    // Add the deleteId to all inactive downloads
    await this.db('downloads')
      .update({ deleteId })
      .where({ 'downloads.active': false })
  }

  /**
   * Removes the given deleteId from downloads, files and pauses.
   * @param deleteId Delete ID to remove from the database.
   */
  async clearDeleteId(deleteId) {
    // Remove all instances of deleteId from pauses
    await this.db('pauses')
      .update({ deleteId: null })
      .where({ deleteId })

    // Remove all instances of deleteId from files
    await this.db('files')
      .update({ deleteId: null })
      .where({ deleteId })

    // Remove all instances of deleteId from downloads
    await this.db('downloads')
      .update({ deleteId: null })
      .where({ deleteId })
  }

  /**
   * Deletes rows that match the given deleteId from downloads, files and pauses.
   * @param deleteId Delete ID to add to the database.
   */
  async deleteByDeleteId(deleteId) {
    // Delete all rows with the deleteId from pauses
    await this.db('pauses')
      .delete()
      .where({ deleteId })

    // Delete all rows with the deleteId from files
    await this.db('files')
      .delete()
      .where({ deleteId })

    // Delete all rows with the deleteId from downloads
    await this.db('downloads')
      .delete()
      .where({ deleteId })
  }
}

export default EddDatabase
