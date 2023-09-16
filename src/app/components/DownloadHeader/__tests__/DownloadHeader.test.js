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
import DownloadHeader from '../DownloadHeader'

import downloadStates from '../../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../../constants/undoTimeout'

import AppContext from '../../../context/AppContext'

const setup = (overrideProps) => {
  const toasts = []
  const addToast = jest.fn((toast) => toasts.push(toast))
  const cancelDownloadItem = jest.fn()
  const clearDownload = jest.fn()
  const deleteAllToastsById = jest.fn()
  const pauseDownloadItem = jest.fn()
  const resumeDownloadItem = jest.fn()
  const setCancellingDownload = jest.fn()
  const setCurrentPage = jest.fn()
  const undoCancellingDownload = jest.fn()
  const undoClearDownload = jest.fn()

  const props = {
    allDownloadsCompleted: false,
    allDownloadsPaused: false,
    state: downloadStates.pending,
    totalCompletedFiles: 0,
    totalFiles: 0,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        cancelDownloadItem,
        clearDownload,
        pauseDownloadItem,
        resumeDownloadItem,
        setCancellingDownload,
        undoCancellingDownload,
        undoClearDownload
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
        <DownloadHeader
          {...props}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    cancelDownloadItem,
    clearDownload,
    deleteAllToastsById,
    pauseDownloadItem,
    resumeDownloadItem,
    setCancellingDownload,
    setCurrentPage,
    toasts,
    undoCancellingDownload,
    undoClearDownload
  }
}

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

afterEach(() => {
  jest.useRealTimers()
})

describe('DownloadHeader component', () => {
  describe('when clicking the Pause All button', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup()

      const button = screen.getByRole('button', { name: 'Pause All' })
      await userEvent.click(button)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking the Resume All button', () => {
    test('calls resumeDownloadItem', async () => {
      const { resumeDownloadItem } = setup({
        allDownloadsPaused: true
      })

      const button = screen.getByRole('button', { name: 'Resume All' })
      await userEvent.click(button)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when there are active downloads', () => {
    test('displays the correct information', () => {
      setup({
        state: downloadStates.active,
        totalCompletedFiles: 5,
        totalFiles: 10
      })

      expect(screen.getByText('Downloading')).toHaveClass('derivedStatus')
      expect(screen.getByText('5 of 10 files done')).toHaveClass('humanizedStatus')

      expect(screen.getByRole('button', { name: 'Pause All' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()
    })
  })

  describe('when all downloads are completed', () => {
    test('displays the correct information', () => {
      setup({
        allDownloadsCompleted: true,
        state: downloadStates.completed,
        totalCompletedFiles: 10,
        totalFiles: 10
      })

      expect(screen.getByText('Completed')).toHaveClass('derivedStatus')
      expect(screen.getByText('10 of 10 files done')).toHaveClass('humanizedStatus')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel All' })).not.toBeInTheDocument()
    })
  })

  describe('when all downloads are paused', () => {
    test('displays the correct information', () => {
      setup({
        allDownloadsPaused: true,
        state: downloadStates.paused,
        totalCompletedFiles: 5,
        totalFiles: 10
      })

      expect(screen.getByText('Paused')).toHaveClass('derivedStatus')
      expect(screen.getByText('5 of 10 files done')).toHaveClass('humanizedStatus')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Resume All' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()
    })
  })

  describe('when clicking `Clear Downloads`', () => {
    test('calls clearDownload and displays a toast', async () => {
      const {
        addToast,
        clearDownload,
        deleteAllToastsById
      } = setup({
        allDownloadsCompleted: true,
        state: downloadStates.completed,
        totalCompletedFiles: 10,
        totalFiles: 10
      })

      const button = screen.getByRole('button', { name: 'Clear Downloads' })
      await userEvent.click(button)

      expect(clearDownload).toHaveBeenCalledTimes(1)
      expect(clearDownload).toHaveBeenCalledWith({
        clearId: 'clear-downloads-1684029600000'
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
        id: 'undo-clear-downloads',
        message: 'Downloads Cleared',
        variant: 'spinner'
      })
    })

    describe('when calling the undo callback', () => {
      test('calls undoClearDownload', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {
          deleteAllToastsById,
          toasts,
          undoClearDownload
        } = setup({
          allDownloadsCompleted: true,
          state: downloadStates.completed,
          totalCompletedFiles: 10,
          totalFiles: 10
        })

        const button = screen.getByRole('button', { name: 'Clear Downloads' })
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

        expect(undoClearDownload).toHaveBeenCalledTimes(1)
        expect(undoClearDownload).toHaveBeenCalledWith({ clearId: 'clear-downloads-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-downloads')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById
        } = setup({
          allDownloadsCompleted: true,
          state: downloadStates.completed,
          totalCompletedFiles: 10,
          totalFiles: 10
        })

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByRole('button', { name: 'Clear Downloads' })
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-downloads')
      })
    })
  })

  describe('when clicking `Cancel Download`', () => {
    test('calls setCancellingDownload and displays a toast', async () => {
      const {
        addToast,
        setCancellingDownload,
        deleteAllToastsById
      } = setup()

      const button = screen.getByRole('button', { name: 'Cancel All' })
      await userEvent.click(button)

      expect(setCancellingDownload).toHaveBeenCalledTimes(1)
      expect(setCancellingDownload).toHaveBeenCalledWith({
        cancelId: 'cancel-downloads-1684029600000'
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
        variant: 'spinner'
      })
    })

    describe('when calling the undo callback', () => {
      test('calls undoCancellingDownload', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {
          deleteAllToastsById,
          toasts,
          undoCancellingDownload
        } = setup()

        const button = screen.getByRole('button', { name: 'Cancel All' })
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
        expect(undoCancellingDownload).toHaveBeenCalledWith({ cancelId: 'cancel-downloads-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-downloads')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          cancelDownloadItem
        } = setup()

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByRole('button', { name: 'Cancel All' })
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
