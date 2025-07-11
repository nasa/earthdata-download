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

import DownloadListItem from '../DownloadListItem'
import DownloadItem from '../../DownloadItem/DownloadItem'

import downloadStates from '../../../constants/downloadStates'
import { UNDO_TIMEOUT } from '../../../constants/undoTimeout'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

jest.mock('../../DownloadItem/DownloadItem')

const download = {
  duplicateCount: 0,
  errors: null,
  invalidLinksCount: 0,
  loadingMoreFiles: false,
  progress: {
    percent: 50,
    finishedFiles: 5,
    totalFiles: 10,
    totalTime: 567
  },
  downloadId: 'mock-download-id',
  state: downloadStates.active
}

const setup = (overrideProps = {}) => {
  const toasts = []
  const addToast = jest.fn((toast) => toasts.push(toast))
  const deleteAllToastsById = jest.fn()
  const cancelDownloadItem = jest.fn()
  const clearDownload = jest.fn()
  const copyDownloadPath = jest.fn()
  const openDownloadFolder = jest.fn()
  const pauseDownloadItem = jest.fn()
  const restartDownload = jest.fn()
  const resumeDownloadItem = jest.fn()
  const retryErroredDownloadItem = jest.fn()
  const sendToEula = jest.fn()
  const sendToLogin = jest.fn()
  const setCancellingDownload = jest.fn()
  const setCurrentPage = jest.fn()
  const setSelectedDownloadId = jest.fn()
  const setRestartingDownload = jest.fn()
  const showAdditionalDetailsDialog = jest.fn()
  const showMoreInfoDialog = jest.fn()
  const showWaitingForEulaDialog = jest.fn()
  const showWaitingForLoginDialog = jest.fn()
  const undoCancellingDownload = jest.fn()
  const undoClearDownload = jest.fn()
  const undoRestartingDownload = jest.fn()

  const props = {
    setCurrentPage,
    setSelectedDownloadId,
    showAdditionalDetailsDialog,
    showMoreInfoDialog,
    download,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider
      value={
        {
          cancelDownloadItem,
          clearDownload,
          copyDownloadPath,
          openDownloadFolder,
          pauseDownloadItem,
          restartDownload,
          resumeDownloadItem,
          retryErroredDownloadItem,
          sendToEula,
          sendToLogin,
          setCancellingDownload,
          setRestartingDownload,
          showWaitingForEulaDialog,
          showWaitingForLoginDialog,
          undoCancellingDownload,
          undoClearDownload,
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
        <DownloadListItem {...props} />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    deleteAllToastsById,
    cancelDownloadItem,
    clearDownload,
    copyDownloadPath,
    openDownloadFolder,
    pauseDownloadItem,
    restartDownload,
    resumeDownloadItem,
    retryErroredDownloadItem,
    sendToEula,
    sendToLogin,
    setCancellingDownload,
    setRestartingDownload,
    showAdditionalDetailsDialog,
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    setSelectedDownloadId,
    toasts,
    undoCancellingDownload,
    undoClearDownload,
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

describe('DownloadListItem component', () => {
  test('renders a DownloadItem', () => {
    DownloadItem.mockImplementation(() => <div />)

    setup()

    expect(DownloadItem).toHaveBeenCalledTimes(1)
    expect(DownloadItem).toHaveBeenCalledWith(expect.objectContaining({
      actionsList: [
        expect.arrayContaining([
          expect.objectContaining({
            isActive: false,
            isPrimary: false,
            label: 'View Additional Details'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: false,
            isPrimary: false,
            label: 'Log In with Earthdata Login'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'View & Accept License Agreement'
          }, {
            isActive: true,
            isPrimary: true,
            label: 'Pause Download'
          }, {
            isActive: false,
            isPrimary: false,
            label: 'Resume Download'
          }, {
            isActive: true,
            isPrimary: true,
            label: 'Cancel Download'
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            isPrimary: false,
            label: 'Open Folder'
          }, {
            isActive: true,
            isPrimary: false,
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
      percent: 50,
      shouldBeClickable: true,
      state: downloadStates.active
      // TODO how can I verify props here
      // status: expect.objectContaining({
      //   // primary: expect.anything(),
      //   primary: expect.any(<DownloadListItemPercent percent={42} />)
      //   // secondary: <DownloadListItemState percent={42} remainingTime={0} shouldShowTime={false} state="ACTIVE" />,
      //   // tertiary: <DownloadListItemFileProgress receivedBytes={61587289} shouldShowBytes totalBytes={61587289} />
      // })
    }), {})
  })

  describe('when clicking `View Additional Details`', () => {
    test('calls showAdditionalDetailsDialog', async () => {
      const { showAdditionalDetailsDialog } = setup({
        download: {
          ...download,
          duplicateCount: 1
        }
      })

      const button = screen.getByText('View Additional Details')
      await userEvent.click(button)

      expect(showAdditionalDetailsDialog).toHaveBeenCalledTimes(1)
      expect(showAdditionalDetailsDialog).toHaveBeenCalledWith('mock-download-id')
    })
  })

  describe('when clicking `Log In with Earthdata Login`', () => {
    test('calls sendToLogin', async () => {
      const { sendToLogin } = setup({
        download: {
          ...download,
          state: downloadStates.waitingForAuth
        }
      })

      const button = screen.getByText('Log In with Earthdata Login')
      await userEvent.click(button)

      expect(sendToLogin).toHaveBeenCalledTimes(1)
      expect(sendToLogin).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        forceLogin: true
      })
    })
  })

  describe('when clicking `View & Accept License Agreement`', () => {
    test('calls sendToEula', async () => {
      const { sendToEula } = setup({
        download: {
          ...download,
          state: downloadStates.waitingForEula
        }
      })

      const button = screen.getByText('View & Accept License Agreement')
      await userEvent.click(button)

      expect(sendToEula).toHaveBeenCalledTimes(1)
      expect(sendToEula).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        forceLogin: true
      })
    })
  })

  describe('when clicking `Pause Download`', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const button = screen.getByText('Pause Download')
      await userEvent.click(button)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
      expect(pauseDownloadItem).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      })
    })
  })

  describe('when clicking `Resume Download`', () => {
    test('calls resumeDownloadItem', async () => {
      const { resumeDownloadItem } = setup({
        download: {
          ...download,
          state: downloadStates.paused
        }
      })

      const button = screen.getByText('Resume Download')
      await userEvent.click(button)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
      expect(resumeDownloadItem).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      })
    })
  })

  describe('when clicking `Open Folder`', () => {
    test('calls openDownloadFolder', async () => {
      const { openDownloadFolder } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Open Folder')
      await userEvent.click(button)

      expect(openDownloadFolder).toHaveBeenCalledTimes(1)
      expect(openDownloadFolder).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      })
    })
  })

  describe('when clicking `Copy Folder Path`', () => {
    test('calls copyDownloadPath', async () => {
      const { copyDownloadPath } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Copy Folder Path')
      await userEvent.click(button)

      expect(copyDownloadPath).toHaveBeenCalledTimes(1)
      expect(copyDownloadPath).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      })
    })
  })

  describe('when clicking `Clear Download`', () => {
    test('calls clearDownload and displays a toast', async () => {
      const {
        addToast,
        clearDownload,
        deleteAllToastsById
      } = setup({
        download: {
          ...download,
          state: downloadStates.completed
        }
      })

      const moreActions = screen.getByText('More Actions')
      await userEvent.click(moreActions)

      const button = screen.getByText('Clear Download')
      await userEvent.click(button)

      expect(clearDownload).toHaveBeenCalledTimes(1)
      expect(clearDownload).toHaveBeenCalledWith({
        clearId: 'mock-download-id-1684029600000',
        downloadId: 'mock-download-id'
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
        id: 'undo-clear-mock-download-id',
        message: 'Download Cleared',
        variant: 'none'
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
          download: {
            ...download,
            state: downloadStates.completed
          }
        })

        const moreActions = screen.getByText('More Actions')
        await userEvent.click(moreActions)

        const button = screen.getByText('Clear Download')
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
        expect(undoClearDownload).toHaveBeenCalledWith({
          clearId: 'mock-download-id-1684029600000'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-mock-download-id')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          undoClearDownload
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
          const button = screen.getByText('Clear Download')
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(undoClearDownload).toHaveBeenCalledTimes(0)

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-mock-download-id')
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
        variant: 'none'
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

  describe('when clicking `Cancel Download`', () => {
    test('calls setCancellingDownload and displays a toast', async () => {
      const {
        addToast,
        setCancellingDownload,
        deleteAllToastsById
      } = setup({
        download: {
          ...download,
          state: downloadStates.active
        }
      })

      const button = screen.getByText('Cancel Download')
      await userEvent.click(button)

      expect(setCancellingDownload).toHaveBeenCalledTimes(1)
      expect(setCancellingDownload).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        cancelId: 'mock-download-id-1684029600000'
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
        id: 'undo-cancel-download-mock-download-id',
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
          download: {
            ...download,
            state: downloadStates.active
          }
        })

        const button = screen.getByText('Cancel Download')
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
          cancelId: 'mock-download-id-1684029600000',
          downloadId: 'mock-download-id'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-download-mock-download-id')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('removes the toast', async () => {
        const {
          deleteAllToastsById,
          cancelDownloadItem
        } = setup({
          download: {
            ...download,
            state: downloadStates.active
          }
        })

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByText('Cancel Download')
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
        expect(cancelDownloadItem).toHaveBeenCalledWith({
          downloadId: 'mock-download-id',
          cancelId: 'mock-download-id-1684029600100'
        })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-cancel-download-mock-download-id')
      })
    })
  })
})
