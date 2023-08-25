import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloadsHeader from '../FileDownloadsHeader'

import { PAGES } from '../../../constants/pages'

import downloadStates from '../../../constants/downloadStates'

const headerReport = {
  downloadLocation: '/mock/location',
  elapsedTime: 0,
  errors: {},
  estimatedTotalTimeRemaining: 0,
  finishedFiles: 0,
  id: 'mock-download-id',
  loadingMoreFiles: 0,
  percent: 0,
  state: downloadStates.pending,
  totalFiles: 1
}

const setup = (overrideProps) => {
  // ElectronApiContext functions
  const cancelDownloadItem = jest.fn()
  const pauseDownloadItem = jest.fn()
  const resumeDownloadItem = jest.fn()

  // Props
  const setCurrentPage = jest.fn()
  const setHideCompleted = jest.fn()

  const props = {
    hideCompleted: false,
    setCurrentPage,
    setHideCompleted,
    headerReport,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        cancelDownloadItem,
        pauseDownloadItem,
        resumeDownloadItem
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
    resumeDownloadItem
  }
}

describe('FileDownloadsHeader component', () => {
  describe('when clicking the Back to Downloads button', () => {
    test('calls setCurrentPage', async () => {
      const { setCurrentPage } = setup()

      const button = screen.getByRole('button', { name: 'Back to Downloads' })
      await userEvent.click(button)

      expect(setCurrentPage).toHaveBeenCalledTimes(1)
      expect(setCurrentPage).toHaveBeenCalledWith(PAGES.downloads)
    })
  })

  describe('when clicking the Pause All button', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup({
        headerReport: {
          ...headerReport,
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
        headerReport: {
          ...headerReport,
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
        headerReport: {
          ...headerReport,
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
        headerReport: {
          ...headerReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('checkbox', { name: 'Hide Completed' })
      await userEvent.click(button)

      expect(setHideCompleted).toHaveBeenCalledTimes(1)
      expect(setHideCompleted).toHaveBeenCalledWith(true)
    })
  })

  describe('when the download is starting', () => {
    test('displays the correct information', () => {
      setup({
        headerReport: {
          ...headerReport,
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
        headerReport: {
          ...headerReport,
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

    describe('when the download is loading more files', () => {
      test('displays the correct information', () => {
        setup({
          headerReport: {
            ...headerReport,
            loadingMoreFiles: 1,
            percent: 42,
            state: downloadStates.active
          }
        })

        expect(screen.getByText('Downloading')).toHaveClass('status')
        expect(screen.getByText('42%')).toHaveClass('statusPercent')

        expect(screen.getByText('0 files completed in 0 seconds (determining file count)')).toHaveClass('progressFiles')
        expect(screen.getByText('0 seconds remaining')).toHaveClass('progressRemaining')

        expect(screen.getByRole('button', { name: 'Pause All' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()

        expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

        expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
      })
    })
  })

  describe('when the download is paused', () => {
    test('displays the correct information', () => {
      setup({
        headerReport: {
          ...headerReport,
          percent: 42,
          elapsedTime: 234,
          estimatedTotalTimeRemaining: 123,
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
        headerReport: {
          ...headerReport,
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
        headerReport: {
          ...headerReport,
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

  describe('when the download has errors', () => {
    test('displays the correct information', () => {
      setup({
        headerReport: {
          ...headerReport,
          errors: {
            'mock-download-id': {
              numberErrors: 1
            }
          },
          percent: 50,
          finishedFiles: 1,
          totalFiles: 2,
          state: downloadStates.active
        }
      })

      expect(screen.getByText('Downloading with errors')).toHaveClass('status')
      expect(screen.getByText('50%')).toHaveClass('statusPercent')

      expect(screen.getByText('1 of 2 files completed in 0 seconds')).toHaveClass('progressFiles')
      expect(screen.getByText('0 seconds remaining')).toHaveClass('progressRemaining')

      expect(screen.getByRole('button', { name: 'Pause All' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()

      expect(screen.getAllByText('Downloading to /mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Completed' })).toBeInTheDocument()
    })
  })
})
