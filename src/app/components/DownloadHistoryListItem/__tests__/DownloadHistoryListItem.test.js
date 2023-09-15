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

import DownloadHistoryListItem from '../DownloadHistoryListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../../constants/undoTimeout'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

jest.mock('../../DownloadItem/DownloadItem')

const download = {
  errors: null,
  loadingMoreFiles: false,
  progress: {
    percent: 100,
    finishedFiles: 10,
    totalFiles: 10,
    totalTime: 567000
  },
  downloadId: 'mock-download-id',
  state: downloadStates.completed,
  timeStart: 123000
}

const setup = (overrideProps = {}) => {
  const toasts = []
  const addToast = jest.fn((toast) => toasts.push(toast))
  const copyDownloadPath = jest.fn()
  const deleteAllToastsById = jest.fn()
  const deleteDownloadHistory = jest.fn()
  const openDownloadFolder = jest.fn()
  const restartDownload = jest.fn()
  const setPendingDeleteDownloadHistory = jest.fn()
  const setRestartingDownload = jest.fn()
  const showMoreInfoDialog = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()
  const undoDeleteDownloadHistory = jest.fn()
  const undoRestartingDownload = jest.fn()

  const props = {
    showMoreInfoDialog,
    download,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider
      value={
        {
          deleteDownloadHistory,
          copyDownloadPath,
          openDownloadFolder,
          restartDownload,
          setPendingDeleteDownloadHistory,
          setRestartingDownload,
          showWaitingForEulaDialog,
          showWaitingForLoginDialog,
          undoDeleteDownloadHistory,
          undoRestartingDownload
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
        <DownloadHistoryListItem {...props} />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    deleteAllToastsById,
    deleteDownloadHistory,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload,
    setPendingDeleteDownloadHistory,
    setRestartingDownload,
    toasts,
    undoDeleteDownloadHistory,
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

describe('DownloadHistoryListItem component', () => {
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
            label: 'Open Folder'
          }, {
            isActive: true,
            isPrimary: true,
            label: 'Copy Folder Path'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: false,
            label: 'Restart Download'
          })
        ])
      ],
      downloadId: 'mock-download-id',
      itemName: 'mock-download-id',
      percent: 100,
      shouldBeClickable: false,
      state: downloadStates.completed
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<DownloadHistoryListItemPercent percent={42} />)
      //   // secondary: <DownloadHistoryListItemState percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <DownloadHistoryListItemFileProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })

  describe('when clicking `Open Folder`', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup()

      const button = screen.getByText('Open Folder')
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking `Copy Folder Path`', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup()

      const button = screen.getByText('Copy Folder Path')
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the state is `errorFetchingLinks`', () => {
    test('does not render unsupported actions', async () => {
      setup({
        download: {
          ...download,
          state: downloadStates.errorFetchingLinks
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      // Ensure the other buttons are not rendering
      expect(screen.queryAllByText('Open Folder').length).toEqual(0)
      expect(screen.queryAllByText('Copy Folder Path').length).toEqual(0)
      expect(screen.queryAllByText('Copy Folder Path').length).toEqual(0)
      expect(screen.queryAllByText('Restart Download').length).toEqual(0)
    })
  })

  describe('when clicking `Delete Download`', () => {
    test('calls setPendingDeleteDownloadHistory and displays a toast', async () => {
      const {
        addToast,
        setPendingDeleteDownloadHistory,
        deleteAllToastsById
      } = setup({
        download: {
          ...download,
          state: downloadStates.completed
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Delete Download')
      await userEvent.click(button)

      expect(setPendingDeleteDownloadHistory).toHaveBeenCalledTimes(1)
      expect(setPendingDeleteDownloadHistory).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        deleteId: 'mock-download-id-1684029600000'
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
        id: 'undo-clear-history-mock-download-id',
        message: 'Download Deleted',
        variant: 'spinner'
      })
    })

    describe('when calling the undo callback', () => {
      test('calls undoDeleteDownloadHistory', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {
          deleteAllToastsById,
          toasts,
          undoDeleteDownloadHistory
        } = setup({
          download: {
            ...download,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        const button = screen.getByText('Delete Download')
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

        expect(undoDeleteDownloadHistory).toHaveBeenCalledTimes(1)
        expect(undoDeleteDownloadHistory).toHaveBeenCalledWith({ deleteId: 'mock-download-id-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-history-mock-download-id')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          undoDeleteDownloadHistory
        } = setup({
          download: {
            ...download,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        jest.useFakeTimers()

        await waitFor(async () => {
          const button = screen.getByText('Delete Download')
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(undoDeleteDownloadHistory).toHaveBeenCalledTimes(0)

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-history-mock-download-id')
      })
    })
  })

  describe('when clicking `Restart Download`', () => {
    test('calls setRestartingDownload and displays a toast', async () => {
      const {
        addToast,
        setRestartingDownload,
        deleteAllToastsById
      } = setup({
        download: {
          ...download,
          state: downloadStates.completed
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Restart Download')
      await userEvent.click(button)

      expect(setRestartingDownload).toHaveBeenCalledTimes(1)
      expect(setRestartingDownload).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        restartId: 'mock-download-id-1684029600000'
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
        id: 'undo-restart-download-mock-download-id',
        message: 'Download Restarted',
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
          download: {
            ...download,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        const button = screen.getByText('Restart Download')
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
        expect(undoRestartingDownload).toHaveBeenCalledWith({ restartId: 'mock-download-id-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-restart-download-mock-download-id')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          restartDownload
        } = setup({
          download: {
            ...download,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByText('Restart Download')
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(restartDownload).toHaveBeenCalledTimes(1)
        expect(restartDownload).toHaveBeenCalledWith({
          downloadId: 'mock-download-id',
          restartId: 'mock-download-id-1684029600100'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-restart-download-mock-download-id')
      })
    })
  })
})
