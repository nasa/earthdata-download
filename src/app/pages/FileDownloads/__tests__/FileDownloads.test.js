import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloads from '../FileDownloads'

import downloadStates from '../../../constants/downloadStates'
import AppContext from '../../../context/AppContext'
import addErrorToasts from '../../../utils/addErrorToasts'

jest.mock('react-virtualized-auto-sizer')

jest.mock('../../../utils/addErrorToasts', () => ({
  __esModule: true,
  default: jest.fn()
}))

const setup = (withErrors, overrideProps) => {
  const addToast = jest.fn()
  const deleteAllToastsById = jest.fn()
  const setCurrentPage = jest.fn()
  const showMoreInfoDialog = jest.fn()

  const errors = {
    'mock-download-id-1': {
      numberErrors: 3
    }
  }

  const requestFilesProgress = jest.fn().mockResolvedValue({
    headerReport: {
      createdAt: 1692631408517,
      downloadLocation: '/mock/download/location/mock-download-id',
      elapsedTime: 3980,
      errors: withErrors ? errors : {},
      estimatedTotalTimeRemaining: 49015.28940864738,
      filesWithProgress: 7,
      finishedFiles: 4,
      id: 'mock-download-id',
      percent: 8,
      percentSum: 538,
      receivedBytesSum: 123957815,
      state: downloadStates.active,
      timeEnd: null,
      timeStart: 1692631432432,
      totalBytesSum: 159494477,
      totalFiles: 67
    },
    filesReport: {
      files: [
        {
          downloadId: 'mock-download-id',
          filename: '20230722065501-JPL-L2P_GHRSST-SSTskin-MODIS_A-N-v02.0-fv01.0.nc',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0
        },
        {
          downloadId: 'mock-download-id',
          filename: '20230722180000-JPL-L2P_GHRSST-SSTskin-MODIS_A-D-v02.0-fv01.0.nc',
          state: downloadStates.completed,
          percent: 100,
          receivedBytes: 21887153,
          totalBytes: 21887153,
          remainingTime: 0
        }
      ],
      totalFiles: 67
    }
  })

  // Props
  const props = {
    downloadId: 'mock-download-id',
    setCurrentPage,
    showMoreInfoDialog,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        requestFilesProgress
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
        <FileDownloads
          {...props}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    deleteAllToastsById,
    requestFilesProgress,
    setCurrentPage,
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

describe('FileDownloads component', () => {
  test('renders the ListPage', async () => {
    const { requestFilesProgress } = setup()

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        hideCompleted: false,
        limit: 11,
        offset: 0
      })
    })
  })

  test('renders the ListPage with a new report every second', async () => {
    const { requestFilesProgress } = setup()

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        hideCompleted: false,
        limit: 11,
        offset: 0
      })
    })

    jest.clearAllMocks()
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        hideCompleted: false,
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
        requestFilesProgress,
        retryErroredDownloadItem,
        showMoreInfoDialog
      } = setup(true)

      // `waitFor` is necessary because the useEffects are triggering updates to the
      // component after the initial render
      await waitFor(() => {
        expect(requestFilesProgress).toHaveBeenCalledTimes(1)
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
