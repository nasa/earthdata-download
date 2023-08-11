// @ts-nocheck

import startReportingFiles from '../startReportingFiles'

import reportFilesProgress from '../../eventHandlers/reportFilesProgress'

jest.mock('../../eventHandlers/reportFilesProgress', () => ({
  __esModule: true,
  default: jest.fn(() => ({}))
}))

describe('startReportingFiles', () => {
  describe('when a report interval already exists', () => {
    test('clears the interval and calls `reportFilesProgress`', async () => {
      jest.useFakeTimers()
      jest.spyOn(global, 'clearInterval')
      jest.spyOn(global, 'setInterval')

      const downloadId = 'mock-download-id'
      const info = { downloadId }
      const database = { getAllDownloads: jest.fn() }
      const webContents = {}
      const reportInterval = 1
      const intervalTime = 1000

      const newReportInterval = await startReportingFiles({
        database,
        info,
        intervalTime,
        reportInterval,
        webContents
      })

      expect(clearInterval).toHaveBeenCalledTimes(1)
      expect(clearInterval).toHaveBeenCalledWith(reportInterval)

      expect(reportFilesProgress).toHaveBeenCalledTimes(1)
      expect(reportFilesProgress).toHaveBeenCalledWith({
        database,
        webContents,
        downloadId
      })

      expect(setInterval).toHaveBeenCalledTimes(1)

      // In order for the function that is called as the
      // second argument of `setInterval` to be called in the mock, we must advance time
      // we must to have this line under test-coverage
      jest.advanceTimersByTime(1000)

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        intervalTime
      )

      // ReportDownload
      expect(reportFilesProgress).toHaveBeenCalledTimes(2)
      expect(reportFilesProgress).toHaveBeenCalledWith({
        database,
        webContents,
        downloadId
      })

      // `setInterval` Returns the intervalID see, https://developer.mozilla.org/en-US/docs/Web/API/setInterval
      // We want to ensure that we return a new one each time this is called
      expect(newReportInterval).not.toEqual(reportInterval)
      expect(newReportInterval).toEqual(expect.any(Number))
    })
  })

  describe('when a report interval does not exist', () => {
    test('does not clear interval and calls `reportDownloadsProgress`', async () => {
      jest.useFakeTimers()
      jest.spyOn(global, 'clearInterval')
      jest.spyOn(global, 'setInterval')

      const downloadId = 'mock-download-id'
      const info = { downloadId }
      const database = { getAllDownloads: jest.fn() }
      const webContents = {}
      const reportInterval = null
      const intervalTime = 1000

      const newReportInterval = await startReportingFiles({
        database,
        info,
        intervalTime,
        reportInterval,
        webContents
      })

      expect(clearInterval).toHaveBeenCalledTimes(0)

      expect(reportFilesProgress).toHaveBeenCalledTimes(1)
      expect(reportFilesProgress).toHaveBeenCalledWith({
        database,
        webContents,
        downloadId
      })

      expect(setInterval).toHaveBeenCalledTimes(1)

      // In order for the function that is called as the
      // second argument of `setInterval` to be called in the mock, we must advance time
      // we must to have this line under test-coverage
      jest.advanceTimersByTime(1000)

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        intervalTime
      )

      // ReportDownload
      expect(reportFilesProgress).toHaveBeenCalledTimes(2)
      expect(reportFilesProgress).toHaveBeenCalledWith({
        database,
        webContents,
        downloadId
      })

      // `setInterval` Returns the intervalID see, https://developer.mozilla.org/en-US/docs/Web/API/setInterval
      // We want to ensure that we return a new one each time this is called
      expect(newReportInterval).not.toEqual(reportInterval)
      expect(newReportInterval).toEqual(expect.any(Number))
    })
  })
})
