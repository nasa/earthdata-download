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

import FileListItem from '../FileListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../../constants/undoTimeout'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

jest.mock('../../DownloadItem/DownloadItem')

const file = {
  id: 123,
  downloadId: 'mock-download-id',
  filename: 'mock-file.png',
  state: downloadStates.active,
  percent: 42,
  createdAt: 691690191124,
  timeStart: 1691690280763,
  timeEnd: null,
  receivedBytes: 61587289,
  totalBytes: 61587289,
  remainingTime: 0
}

const setup = (overrideProps = {}) => {
  const toasts = []
  const addToast = jest.fn((toast) => toasts.push(toast))
  const cancelDownloadItem = jest.fn()
  const copyDownloadPath = jest.fn()
  const deleteAllToastsById = jest.fn()
  const openDownloadFolder = jest.fn()
  const restartDownload = jest.fn()
  const setCancellingDownload = jest.fn()
  const setRestartingDownload = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()
  const undoCancellingDownload = jest.fn()
  const undoRestartingDownload = jest.fn()

  const props = {
    file,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider
      value={
        {
          cancelDownloadItem,
          copyDownloadPath,
          openDownloadFolder,
          restartDownload,
          setCancellingDownload,
          setRestartingDownload,
          showWaitingForEulaDialog,
          showWaitingForLoginDialog,
          undoCancellingDownload,
          undoRestartingDownload
        }
      }
    >
      <AppContext.Provider value={
        {
          addToast,
          deleteAllToastsById
        }
      }
      >
        <FileListItem {...props} />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    cancelDownloadItem,
    copyDownloadPath,
    deleteAllToastsById,
    openDownloadFolder,
    restartDownload,
    setCancellingDownload,
    setRestartingDownload,
    toasts,
    undoCancellingDownload,
    undoRestartingDownload
  }
}

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')

  DownloadItem.mockImplementation(jest.requireActual('../../DownloadItem/DownloadItem').default)
})

afterEach(() => {
  jest.useRealTimers()
})

describe('FileListItem component', () => {
  test('renders a DownloadItem', () => {
    DownloadItem.mockImplementation(() => <div />)

    setup()

    expect(DownloadItem).toHaveBeenCalledTimes(1)
    expect(DownloadItem).toHaveBeenCalledWith(expect.objectContaining({
      actionsList: [
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: true,
            label: 'Cancel File',
            variant: 'danger'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: false,
            isPrimary: false,
            label: 'Open File'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Copy File Path'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Restart File'
          })
        ])
      ],
      downloadId: 'mock-download-id',
      itemName: 'mock-file.png',
      percent: 42,
      state: downloadStates.active
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<FileListItemPercent percent={42} />)
      //   // secondary: <FileListItemTimeRemaining percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <FileListItemSizeProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })

  describe('when clicking `Open File`', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup({
        file: {
          ...file,
          state: downloadStates.completed
        }
      })

      const button = screen.getByText('Open File')
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Copy File Path`', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup({
        file: {
          ...file,
          state: downloadStates.completed
        }
      })

      const button = screen.getByText('Copy File Path')
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Restart File`', () => {
    test('calls setRestartingDownload and displays a toast', async () => {
      const {
        addToast,
        setRestartingDownload,
        deleteAllToastsById
      } = setup({
        file: {
          ...file,
          state: downloadStates.completed
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Restart File')
      await userEvent.click(button)

      expect(setRestartingDownload).toHaveBeenCalledTimes(1)
      expect(setRestartingDownload).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-file.png',
        restartId: 'mock-file.png-1684029600000'
      })

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')

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
        id: 'undo-restart-file-mock-file.png',
        message: 'File Restarted',
        variant: 'spinner'
      })
    })

    describe('when calling the undo callback', () => {
      test('calls undoRestartingDownload', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {
          deleteAllToastsById,
          toasts,
          undoRestartingDownload
        } = setup({
          file: {
            ...file,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        const button = screen.getByText('Restart File')
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

        expect(undoRestartingDownload).toHaveBeenCalledTimes(1)
        expect(undoRestartingDownload).toHaveBeenCalledWith({ restartId: 'mock-file.png-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-restart-file-mock-file.png')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          restartDownload
        } = setup({
          file: {
            ...file,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByText('Restart File')
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(restartDownload).toHaveBeenCalledTimes(1)
        expect(restartDownload).toHaveBeenCalledWith({
          downloadId: 'mock-download-id',
          filename: 'mock-file.png',
          restartId: 'mock-file.png-1684029600100'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-restart-file-mock-file.png')
      })
    })
  })

  describe('when clicking `Cancel File`', () => {
    test('calls setCancellingDownload and displays a toast', async () => {
      const {
        addToast,
        setCancellingDownload,
        deleteAllToastsById
      } = setup({
        file: {
          ...file,
          state: downloadStates.active
        }
      })

      const button = screen.getByText('Cancel File')
      await userEvent.click(button)

      expect(setCancellingDownload).toHaveBeenCalledTimes(1)
      expect(setCancellingDownload).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        filename: 'mock-file.png',
        cancelId: 'mock-file.png-1684029600000'
      })

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')

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
        id: 'undo-cancel-file-mock-file.png',
        message: 'File Cancelled',
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
        } = setup({
          file: {
            ...file,
            state: downloadStates.active
          }
        })

        const button = screen.getByText('Cancel File')
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
        expect(undoCancellingDownload).toHaveBeenCalledWith({ cancelId: 'mock-file.png-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-file-mock-file.png')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          cancelDownloadItem
        } = setup({
          file: {
            ...file,
            state: downloadStates.active
          }
        })

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByText('Cancel File')
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
        expect(cancelDownloadItem).toHaveBeenCalledWith({
          downloadId: 'mock-download-id',
          filename: 'mock-file.png',
          cancelId: 'mock-file.png-1684029600100'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-file-mock-file.png')
      })
    })
  })
})
