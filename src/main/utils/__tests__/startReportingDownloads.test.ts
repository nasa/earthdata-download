// @ts-nocheck

import startReportingDownloads from '../startReportingDownloads'

import reportDownloadsProgress from '../../eventHandlers/reportDownloadsProgress'

jest.mock('../../eventHandlers/reportDownloadsProgress', () => ({
  __esModule: true,
  default: jest.fn(() => ({}))
}))

describe('startReportingDownloads', () => {
  describe('when a report interval already exists', () => {
    test('clears the interval and calls `reportDownloadsProgress`', async () => {
      jest.useFakeTimers()
      jest.spyOn(global, 'clearInterval')
      jest.spyOn(global, 'setInterval')

      const database = { getAllDownloads: jest.fn() }
      const webContents = {}
      const reportInterval = 1
      const intervalTime = 1000

      const newReportInterval = await startReportingDownloads({
        database,
        webContents,
        reportInterval,
        intervalTime
      })

      expect(clearInterval).toHaveBeenCalledTimes(1)
      expect(clearInterval).toHaveBeenCalledWith(reportInterval)

      expect(reportDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(reportDownloadsProgress).toHaveBeenCalledWith({
        database,
        webContents
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
      expect(reportDownloadsProgress).toHaveBeenCalledTimes(2)
      expect(reportDownloadsProgress).toHaveBeenCalledWith({
        database,
        webContents
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

      const database = { getAllDownloads: jest.fn() }
      const webContents = {}
      const reportInterval = null
      const intervalTime = 1000

      const newReportInterval = await startReportingDownloads({
        database,
        webContents,
        reportInterval,
        intervalTime
      })

      expect(clearInterval).toHaveBeenCalledTimes(0)

      expect(reportDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(reportDownloadsProgress).toHaveBeenCalledWith({
        database,
        webContents
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
      expect(reportDownloadsProgress).toHaveBeenCalledTimes(2)
      expect(reportDownloadsProgress).toHaveBeenCalledWith({
        database,
        webContents
      })

      expect(newReportInterval).not.toBeNull()
      expect(newReportInterval).toEqual(expect.any(Number))
    })
  })
})
