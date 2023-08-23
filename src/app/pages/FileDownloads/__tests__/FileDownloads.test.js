import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloads from '../FileDownloads'

import ListPage from '../../../components/ListPage/ListPage'
import downloadStates from '../../../constants/downloadStates'

jest.mock('../../../components/ListPage/ListPage', () => jest.fn(
  () => <mock-ListPage>Mock ListPage</mock-ListPage>
))

const setup = (overrideProps) => {
  // Context functions
  const initializeDownload = jest.fn()
  const setCurrentPage = jest.fn()

  const requestFilesProgress = jest.fn().mockResolvedValue({
    headerReport: {
      id: 'mock-download-id',
      downloadLocation: '/mock/download/location/mock-download-id',
      state: downloadStates.active,
      createdAt: 1692631408517,
      timeEnd: null,
      timeStart: 1692631432432,
      percentSum: 538,
      receivedBytesSum: 123957815,
      totalBytesSum: 159494477,
      totalFiles: 67,
      filesWithProgress: 7,
      finishedFiles: 4,
      erroredFiles: 0,
      percent: 8,
      elapsedTime: 3980,
      estimatedTotalTimeRemaining: 49015.28940864738
    },
    filesReport: {
      files: [
        {
          downloadId: 'mock-download-id',
          filename: '20230722065501-JPL-L2P_GHRSST-SSTskin-MODIS_A-N-v02.0-fv01.0.nc',
          state: 'COMPLETED',
          percent: 100,
          receivedBytes: 24902726,
          totalBytes: 24902726,
          remainingTime: 0
        },
        {
          downloadId: 'mock-download-id',
          filename: '20230722180000-JPL-L2P_GHRSST-SSTskin-MODIS_A-D-v02.0-fv01.0.nc',
          state: 'COMPLETED',
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
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        initializeDownload,
        requestFilesProgress
      }
    }
    >
      <FileDownloads
        {...props}
      />
    </ElectronApiContext.Provider>
  )

  return {
    requestFilesProgress
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
      expect(ListPage).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        hideCompleted: false,
        limit: 10,
        offset: 0
      })
    })
  })

  test('renders the ListPage with a new report every second', async () => {
    const { requestFilesProgress } = setup()

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      expect(ListPage).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        hideCompleted: false,
        limit: 10,
        offset: 0
      })
    })

    jest.clearAllMocks()
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(ListPage).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledTimes(1)
      expect(requestFilesProgress).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        hideCompleted: false,
        limit: 10,
        offset: 0
      })
    })
  })
})
