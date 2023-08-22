import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import Downloads from '../Downloads'
import ListPage from '../../../components/ListPage/ListPage'
import downloadStates from '../../../constants/downloadStates'

jest.mock('../../../components/ListPage/ListPage', () => jest.fn(
  () => <mock-ListPage>Mock ListPage</mock-ListPage>
))

const setup = (overrideProps) => {
  const setCurrentPage = jest.fn()
  const setHasActiveDownload = jest.fn()
  const setSelectedDownloadId = jest.fn()
  const showMoreInfoDialog = jest.fn()

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
        requestDownloadsProgress
      }
    }
    >
      <Downloads
        {...props}
      />
    </ElectronApiContext.Provider>
  )

  return {
    requestDownloadsProgress
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
      expect(ListPage).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      })
    })
  })

  test('renders the ListPage with a new report every second', async () => {
    const { requestDownloadsProgress } = setup()

    // `waitFor` is necessary because the useEffects are triggering updates to the
    // component after the initial render
    await waitFor(() => {
      expect(ListPage).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      })
    })

    jest.clearAllMocks()
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(ListPage).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledTimes(1)
      expect(requestDownloadsProgress).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      })
    })
  })
})
