import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import Downloads from '../Downloads'
import ListPage from '../../../components/ListPage/ListPage'
import downloadStates from '../../../constants/downloadStates'
import AppContext from '../../../context/AppContext'
import addErrorToasts from '../../../utils/addErrorToasts'

jest.mock('../../../components/ListPage/ListPage', () => jest.fn(
  () => <mock-ListPage>Mock ListPage</mock-ListPage>
))

jest.mock('../../../utils/addErrorToasts', () => ({
  __esModule: true,
  default: jest.fn()
}))

const setup = (withErrors, overrideProps) => {
  const addToast = jest.fn()
  const deleteAllToastsById = jest.fn()
  const retryErroredDownloadItem = jest.fn()
  const setCurrentPage = jest.fn()
  const setHasActiveDownload = jest.fn()
  const setSelectedDownloadId = jest.fn()
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
    totalDownloads: 2
  })

  // Props
  const props = {
    setCurrentPage,
    setHasActiveDownload,
    setSelectedDownloadId,
    showMoreInfoDialog,
    ...overrideProps
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
          deleteAllToastsById
        }
      }
      >
        <Downloads
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
    showMoreInfoDialog
  }
}

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('Downloads component', () => {
  test('renders the ListPage', async () => {
    const { requestDownloadsProgress } = setup()

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      // Called two times because the totalItemCount changes after the request is returned
      expect(ListPage).toHaveBeenCalledTimes(2)

      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
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
      // Called two times because the totalItemCount changes after the request is returned
      expect(ListPage).toHaveBeenCalledTimes(2)

      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        limit: 11,
        offset: 0
      })
    })

    jest.clearAllMocks()
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      // Called two times because the totalItemCount changes after the request is returned
      expect(ListPage).toHaveBeenCalledTimes(2)

      expect(requestDownloadsProgress).toHaveBeenCalledTimes(2)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
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
        retryErroredDownloadItem,
        showMoreInfoDialog
      } = setup(true)

      // `waitFor` is necessary because the useEffects are triggering updates to the
      // component after the initial render
      await waitFor(() => {
        expect(ListPage).toHaveBeenCalledTimes(1)
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
