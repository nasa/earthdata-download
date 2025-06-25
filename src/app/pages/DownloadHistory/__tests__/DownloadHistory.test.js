import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import DownloadHistory from '../DownloadHistory'
import downloadStates from '../../../constants/downloadStates'
import AppContext from '../../../context/AppContext'
import addErrorToasts from '../../../utils/addErrorToasts'

jest.mock('react-virtualized-auto-sizer')

jest.mock('../../../utils/addErrorToasts', () => ({
  __esModule: true,
  default: jest.fn()
}))

const setup = (withErrors, overrideReport) => {
  const addToast = jest.fn()
  const deleteAllToastsById = jest.fn()
  const retryErroredDownloadItem = jest.fn()
  const setCurrentPage = jest.fn()
  const setHasActiveDownload = jest.fn()
  const setSelectedDownloadId = jest.fn()
  const showAdditionalDetailsDialog = jest.fn()
  const showMoreInfoDialog = jest.fn()

  const errors = {
    'mock-download-id-1': {
      numberErrors: 3
    }
  }

  const requestDownloadsProgress = jest.fn().mockResolvedValue({
    downloadsReport: [
      {
        downloadId: 'mock-download-id-2',
        loadingMoreFiles: false,
        progress: {
          percent: 100,
          finishedFiles: 7,
          totalFiles: 7,
          totalTime: 101
        },
        state: downloadStates.completed
      },
      {
        downloadId: 'mock-download-id-1',
        loadingMoreFiles: false,
        progress: {
          percent: 100,
          finishedFiles: 7,
          totalFiles: 7,
          totalTime: 100
        },
        state: downloadStates.completed
      }
    ],
    errors: withErrors ? errors : {},
    totalCompletedFiles: 14,
    totalDownloads: 2,
    totalFiles: 14,
    ...overrideReport
  })

  // Props
  const props = {
    setCurrentPage,
    setHasActiveDownload,
    setSelectedDownloadId,
    showAdditionalDetailsDialog,
    showMoreInfoDialog
  }

  render(
    <ElectronApiContext.Provider value={
      {
        requestDownloadsProgress,
        retryErroredDownloadItem
      }
    }
    >
      <AppContext.Provider value={
        {
          addToast,
          deleteAllToastsById,
          toasts: {}
        }
      }
      >
        <DownloadHistory
          {...props}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    deleteAllToastsById,
    requestDownloadsProgress,
    retryErroredDownloadItem,
    setCurrentPage,
    showAdditionalDetailsDialog,
    showMoreInfoDialog
  }
}

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('Downloads component', () => {
  test('renders the ListPage', async () => {
    const { requestDownloadsProgress } = setup({
      overscanStartIndex: 0,
      overscanStopIndex: 10
    })

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        active: false,
        limit: 11,
        offset: 0
      })
    })
  })

  test('renders the ListPage with a new report every second', async () => {
    const { requestDownloadsProgress } = setup()

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        active: false,
        limit: 11,
        offset: 0
      })
    })

    jest.clearAllMocks()
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        active: false,
        limit: 11,
        offset: 0
      })
    })
  })

  describe('when errors are returned in the report', () => {
    test('calls addErrorToasts', async () => {
      const {
        addToast,
        deleteAllToastsById,
        requestDownloadsProgress,
        retryErroredDownloadItem,
        showMoreInfoDialog
      } = setup(true)

      // `waitFor` is necessary because the useEffects are triggering updates to the
      // component after the initial render
      await waitFor(() => {
        expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      })

      expect(addErrorToasts).toHaveBeenCalledTimes(1)
      expect(addErrorToasts).toHaveBeenCalledWith({
        errors: {
          'mock-download-id-1': {
            numberErrors: 3
          }
        },
        addToast,
        deleteAllToastsById,
        retryErroredDownloadItem,
        showMoreInfoDialog
      })
    })
  })
})
