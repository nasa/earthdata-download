import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloadsHeader from '../FileDownloadsHeader'

import { PAGES } from '../../../constants/pages'

import downloadStates from '../../../constants/downloadStates'

const downloadReport = {
  percent: 0,
  totalFiles: 1,
  finishedFiles: 0,
  erroredFiles: 0,
  totalTimeRemaining: 0,
  state: downloadStates.pending,
  totalTime: 0,
  downloadLocation: '/mock/location',
  id: 'mock-download-id'
}

const setup = (overrideProps) => {
  // ElectronApiContext functions
  const cancelDownloadItem = jest.fn()
  const pauseDownloadItem = jest.fn()
  const resumeDownloadItem = jest.fn()
  const startReportingDownloads = jest.fn()

  // Props
  const setCurrentPage = jest.fn()
  const setHideCompleted = jest.fn()

  const props = {
    hideCompleted: false,
    setCurrentPage,
    setHideCompleted,
    downloadReport,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        cancelDownloadItem,
        pauseDownloadItem,
        resumeDownloadItem,
        startReportingDownloads
      }
    }
    >
      <FileDownloadsHeader
        {...props}
      />
    </ElectronApiContext.Provider>
  )

  return {
    setHideCompleted,
    setCurrentPage,
    cancelDownloadItem,
    pauseDownloadItem,
    resumeDownloadItem,
    startReportingDownloads
  }
}

describe('FileDownloadsHeader component', () => {
  describe('when clicking the Back to Downloads button', () => {
    test('calls startReportingDownloads and setCurrentPage', async () => {
      const { setCurrentPage, startReportingDownloads } = setup()

      const button = screen.getByRole('button', { name: 'Back to Downloads' })
      await userEvent.click(button)

      expect(setCurrentPage).toHaveBeenCalledTimes(1)
      expect(setCurrentPage).toHaveBeenCalledWith(PAGES.downloads)

      expect(startReportingDownloads).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking the Pause All button', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('button', { name: 'Pause All' })
      await userEvent.click(button)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
      expect(pauseDownloadItem).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when clicking the Resume All button', () => {
    test('calls resumeDownloadItem', async () => {
      const { resumeDownloadItem } = setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.paused
        }
      })

      const button = screen.getByRole('button', { name: 'Resume All' })
      await userEvent.click(button)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
      expect(resumeDownloadItem).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when clicking the Cancel All button', () => {
    test('calls cancelDownloadItem', async () => {
      const { cancelDownloadItem } = setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('button', { name: 'Cancel All' })
      await userEvent.click(button)

      expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
      expect(cancelDownloadItem).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when checking the Hide Completed checkbox', () => {
    test('calls setHideCompleted', async () => {
      const { setHideCompleted } = setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('checkbox', { name: 'Hide Completed' })
      await userEvent.click(button)

      expect(setHideCompleted).toHaveBeenCalledTimes(1)
      expect(setHideCompleted).toHaveBeenCalledWith(true)
    })
  })

  describe('when the download is pending', () => {
    test('displays the correct information', () => {
      setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.pending
        }
      })

      expect(screen.getByText('Not yet started')).toHaveClass('status')
      expect(screen.getByText('0%')).toHaveClass('statusPercent')

      expect(screen.getByText('0 of 1 files completed in 0 seconds')).toHaveClass('progressFiles')
      expect(screen.getByText('0 seconds remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel All' })).not.toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })

  describe('when the download is starting', () => {
    test('displays the correct information', () => {
      setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.starting
        }
      })

      expect(screen.getByText('Initializing')).toHaveClass('status')
      expect(screen.getByText('0%')).toHaveClass('statusPercent')

      expect(screen.getByText('0 of 1 files completed in 0 seconds')).toHaveClass('progressFiles')
      expect(screen.getByText('0 seconds remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel All' })).not.toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })

  describe('when the download is active', () => {
    test('displays the correct information', () => {
      setup({
        downloadReport: {
          ...downloadReport,
          percent: 42,
          state: downloadStates.active
        }
      })

      expect(screen.getByText('Downloading')).toHaveClass('status')
      expect(screen.getByText('42%')).toHaveClass('statusPercent')

      expect(screen.getByText('0 of 1 files completed in 0 seconds')).toHaveClass('progressFiles')
      expect(screen.getByText('0 seconds remaining')).toHaveClass('progressRemaining')

      expect(screen.getByRole('button', { name: 'Pause All' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })

  describe('when the download is paused', () => {
    test('displays the correct information', () => {
      setup({
        downloadReport: {
          ...downloadReport,
          percent: 42,
          totalTime: 234,
          totalTimeRemaining: 123,
          state: downloadStates.paused
        }
      })

      expect(screen.getByText('Paused')).toHaveClass('status')
      expect(screen.getByText('42%')).toHaveClass('statusPercent')

      expect(screen.getByText('0 of 1 files completed in 4 minutes')).toHaveClass('progressFiles')
      expect(screen.getByText('2 minutes remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Resume All' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })

  describe('when the download is cancelled', () => {
    test('displays the correct information', () => {
      setup({
        downloadReport: {
          ...downloadReport,
          state: downloadStates.cancelled
        }
      })

      expect(screen.getByText('Cancelled')).toHaveClass('status')
      expect(screen.getByText('0%')).toHaveClass('statusPercent')

      expect(screen.getByText('0 of 1 files completed in 0 seconds')).toHaveClass('progressFiles')
      expect(screen.getByText('0 seconds remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel All' })).not.toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })

  describe('when the download is completed', () => {
    test('displays the correct information', () => {
      setup({
        downloadReport: {
          ...downloadReport,
          percent: 100,
          finishedFiles: 1,
          state: downloadStates.completed
        }
      })

      expect(screen.getByText('Completed')).toHaveClass('status')
      expect(screen.getByText('100%')).toHaveClass('statusPercent')

      expect(screen.getByText('1 of 1 files completed in 0 seconds')).toHaveClass('progressFiles')
      expect(screen.queryAllByText('0 seconds remaining')).toHaveLength(0)

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel All' })).not.toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })
})
