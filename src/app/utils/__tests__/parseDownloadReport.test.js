import downloadStates from '../../constants/downloadStates'
import parseDownloadReport from '../parseDownloadReport'

const pausedDownload = {
  downloadId: 'paused-download-id',
  loadingMoreFiles: false,
  progress: {
    percent: 66.8,
    finishedFiles: 5,
    totalFiles: 8,
    totalTime: 5019
  },
  state: downloadStates.paused
}
const activeDownload = {
  downloadId: 'active-download-id',
  loadingMoreFiles: false,
  progress: {
    percent: 66.8,
    finishedFiles: 5,
    totalFiles: 8,
    totalTime: 5019
  },
  state: downloadStates.active
}
const completedDownload = {
  downloadId: 'completed-download-id',
  loadingMoreFiles: false,
  progress: {
    percent: 100,
    finishedFiles: 8,
    totalFiles: 8,
    totalTime: 5019
  },
  state: downloadStates.completed
}
const errorDownload = {
  downloadId: 'error-download-id',
  errors: [
    {
      id: 533,
      downloadId: 'error-download-id',
      filename: 'bad-file.png',
      state: 'ERROR',
      url: 'http://localhost:3001/bad-file.png',
      percent: 0,
      createdAt: 1691779355727,
      timeStart: null,
      timeEnd: null,
      errors: 'This file could not be downloaded',
      receivedBytes: null,
      totalBytes: null
    }
  ],
  loadingMoreFiles: false,
  progress: {
    percent: 87.5,
    finishedFiles: 7,
    totalFiles: 8,
    totalTime: 5019
  },
  state: downloadStates.completed
}

describe('parseDownloadReport', () => {
  describe('when there is an active download', () => {
    test('returns the correct values', () => {
      const result = parseDownloadReport([activeDownload])

      expect(result).toEqual({
        allDownloadsCompleted: false,
        allDownloadsPaused: false,
        derivedStateFromDownloads: downloadStates.active,
        hasActiveDownload: true,
        totalCompletedFiles: 5,
        totalDownloadFiles: 8
      })
    })
  })

  describe('when not all downloads are paused', () => {
    test('returns the correct values', () => {
      const result = parseDownloadReport([pausedDownload, completedDownload])

      expect(result).toEqual({
        allDownloadsCompleted: false,
        allDownloadsPaused: false,
        derivedStateFromDownloads: downloadStates.paused,
        hasActiveDownload: false,
        totalCompletedFiles: 13,
        totalDownloadFiles: 16
      })
    })
  })

  describe('when all downloads are paused', () => {
    test('returns the correct values', () => {
      const result = parseDownloadReport([pausedDownload])

      expect(result).toEqual({
        allDownloadsCompleted: false,
        allDownloadsPaused: true,
        derivedStateFromDownloads: downloadStates.paused,
        hasActiveDownload: false,
        totalCompletedFiles: 5,
        totalDownloadFiles: 8
      })
    })
  })

  describe('when all downloads are completed', () => {
    test('returns the correct values', () => {
      const result = parseDownloadReport([completedDownload])

      expect(result).toEqual({
        allDownloadsCompleted: true,
        allDownloadsPaused: false,
        derivedStateFromDownloads: downloadStates.completed,
        hasActiveDownload: false,
        totalCompletedFiles: 8,
        totalDownloadFiles: 8
      })
    })
  })

  describe('when a download has an error', () => {
    test('returns the correct values', () => {
      const result = parseDownloadReport([errorDownload])

      expect(result).toEqual({
        allDownloadsCompleted: true,
        allDownloadsPaused: false,
        derivedStateFromDownloads: downloadStates.completed,
        hasActiveDownload: false,
        totalCompletedFiles: 7,
        totalDownloadFiles: 8
      })
    })
  })
})
