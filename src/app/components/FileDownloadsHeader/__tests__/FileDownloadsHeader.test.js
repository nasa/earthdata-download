import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { FaUndo } from 'react-icons/fa'
import MockDate from 'mockdate'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloadsHeader from '../FileDownloadsHeader'

import { PAGES } from '../../../constants/pages'

import downloadStates from '../../../constants/downloadStates'
import AppContext from '../../../context/AppContext'
import { UNDO_TIMEOUT } from '../../../constants/undoTimeout'

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
  const toasts = []
  const addToast = jest.fn((toast) => toasts.push(toast))
  const cancelDownloadItem = jest.fn()
  const pauseDownloadItem = jest.fn()
  const resumeDownloadItem = jest.fn()
  const openDownloadFolder = jest.fn()
  const copyDownloadPath = jest.fn()
  const setCurrentPage = jest.fn()
  const setHideCompleted = jest.fn()
  const deleteAllToastsById = jest.fn()
  const setCancellingDownload = jest.fn()
  const undoCancellingDownload = jest.fn()

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
        copyDownloadPath,
        openDownloadFolder,
        pauseDownloadItem,
        resumeDownloadItem,
        setCancellingDownload,
        undoCancellingDownload
      }
    }
    >
      <AppContext.Provider
        value={
          {
            addToast,
            deleteAllToastsById
          }
        }
      >
        <FileDownloadsHeader
          {...props}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    cancelDownloadItem,
    copyDownloadPath,
    deleteAllToastsById,
    openDownloadFolder,
    pauseDownloadItem,
    resumeDownloadItem,
    setCancellingDownload,
    setCurrentPage,
    setHideCompleted,
    toasts,
    undoCancellingDownload
  }
}

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

afterEach(() => {
  jest.useRealTimers()
})

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

  describe('when clicking the Pause button', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup({
        headerReport: {
          ...headerReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('button', { name: 'Pause' })
      await userEvent.click(button)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
      expect(pauseDownloadItem).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when clicking the Copy Path button', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup({
        headerReport: {
          ...headerReport,
          state: downloadStates.completed
        }
      })

      const button = screen.getByRole('button', { name: 'Copy Path' })
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
      expect(copyDownloadPath).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when clicking the Open Folder button', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup({
        headerReport: {
          ...headerReport,
          state: downloadStates.completed
        }
      })

      const button = screen.getByRole('button', { name: 'Open Folder' })
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
      expect(openDownloadFolder).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when clicking the Resume button', () => {
    test('calls resumeDownloadItem', async () => {
      const { resumeDownloadItem } = setup({
        headerReport: {
          ...headerReport,
          state: downloadStates.paused
        }
      })

      const button = screen.getByRole('button', { name: 'Resume' })
      await userEvent.click(button)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
      expect(resumeDownloadItem).toHaveBeenCalledWith({ downloadId: 'mock-download-id' })
    })
  })

  describe('when checking the Hide Complete checkbox', () => {
    test('calls setHideCompleted', async () => {
      const { setHideCompleted } = setup({
        headerReport: {
          ...headerReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('checkbox', { name: 'Hide Complete' })
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

      expect(screen.getByText('0 of 1 files downloaded in 0s')).toHaveClass('progressFiles')
      expect(screen.getByText('0s remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()

      expect(screen.getAllByText('/mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
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

      expect(screen.getByText('0 of 1 files downloaded in 0s')).toHaveClass('progressFiles')
      expect(screen.getByText('0s remaining')).toHaveClass('progressRemaining')

      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

      expect(screen.getAllByText('/mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
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

        expect(screen.getByText('0 files downloaded in 0s (determining file count)')).toHaveClass('progressFiles')
        expect(screen.getByText('0s remaining')).toHaveClass('progressRemaining')

        expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

        expect(screen.getAllByText('/mock/location')).toHaveLength(2)

        expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
      })
    })
  })

  describe('when the download is paused', () => {
    test('displays the correct information', () => {
      setup({
        headerReport: {
          ...headerReport,
          percent: 42,
          elapsedTime: 234000,
          estimatedTotalTimeRemaining: 123000,
          state: downloadStates.paused
        }
      })

      expect(screen.getByText('Paused')).toHaveClass('status')
      expect(screen.getByText('42%')).toHaveClass('statusPercent')

      expect(screen.getByText('0 of 1 files downloaded in 3m, 54s')).toHaveClass('progressFiles')
      expect(screen.getByText('2m, 3s remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

      expect(screen.getAllByText('/mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
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

      expect(screen.getByText('0 of 1 files downloaded in 0s')).toHaveClass('progressFiles')
      expect(screen.getByText('0s remaining')).toHaveClass('progressRemaining')

      expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()

      expect(screen.getAllByText('/mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
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

      expect(screen.getByText('Complete')).toHaveClass('status')
      expect(screen.getByText('100%')).toHaveClass('statusPercent')

      expect(screen.getByText('1 of 1 files downloaded in 0s')).toHaveClass('progressFiles')
      expect(screen.queryAllByText('0s remaining')).toHaveLength(0)

      expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()

      expect(screen.getAllByText('/mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
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

      expect(screen.getByText('Downloading')).toHaveClass('status')
      expect(screen.getByText('50%')).toHaveClass('statusPercent')

      expect(screen.getByText('1 of 2 files downloaded in 0s')).toHaveClass('progressFiles')
      expect(screen.getByText('0s remaining')).toHaveClass('progressRemaining')

      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

      expect(screen.getAllByText('/mock/location')).toHaveLength(2)

      expect(screen.getByRole('checkbox', { name: 'Hide Complete' })).toBeInTheDocument()
    })
  })

  describe('when clicking `Cancel`', () => {
    test('calls setCancellingDownload and displays a toast', async () => {
      const {
        addToast,
        setCancellingDownload,
        deleteAllToastsById
      } = setup({
        headerReport: {
          ...headerReport,
          state: downloadStates.active
        }
      })

      const button = screen.getByRole('button', { name: 'Cancel' })
      await userEvent.click(button)

      expect(setCancellingDownload).toHaveBeenCalledTimes(1)
      expect(setCancellingDownload).toHaveBeenCalledWith({
        cancelId: 'cancel-downloads-1684029600000',
        downloadId: 'mock-download-id'
      })

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith()

      expect(addToast).toHaveBeenCalledTimes(1)
      expect(addToast).toHaveBeenCalledWith({
        actions: [{
          altText: 'Undo',
          buttonProps: {
            Icon: FaUndo,
            onClick: expect.any(Function)
          },
          buttonText: 'Undo'
        }],
        id: 'undo-cancel-downloads',
        message: 'Download Cancelled',
        variant: 'none'
      })
    })

    describe('when calling the undo callback', () => {
      test('calls undoCancellingDownload', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {
          deleteAllToastsById,
          toasts,
          undoCancellingDownload
        } = setup({
          headerReport: {
            ...headerReport,
            state: downloadStates.active
          }
        })

        const button = screen.getByRole('button', { name: 'Cancel' })
        await userEvent.click(button)

        expect(toasts).toHaveLength(1)

        const [toast] = toasts
        const { actions } = toast
        const [undoAction] = actions
        const { buttonProps } = undoAction
        const { onClick } = buttonProps

        jest.clearAllMocks()

        // Click the undo button
        onClick()

        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
        expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number))

        expect(undoCancellingDownload).toHaveBeenCalledTimes(1)
        expect(undoCancellingDownload).toHaveBeenCalledWith({
          cancelId: 'cancel-downloads-1684029600000',
          downloadId: 'mock-download-id'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-downloads')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          cancelDownloadItem
        } = setup({
          headerReport: {
            ...headerReport,
            state: downloadStates.active
          }
        })

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByRole('button', { name: 'Cancel' })
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
        expect(cancelDownloadItem).toHaveBeenCalledWith({
          cancelId: 'cancel-downloads-1684029600100'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-downloads')
      })
    })
  })
})
