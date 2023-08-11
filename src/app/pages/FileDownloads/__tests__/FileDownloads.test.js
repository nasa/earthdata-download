import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloads from '../FileDownloads'

import ListPage from '../../../components/ListPage/ListPage'

jest.mock('../../../components/ListPage/ListPage', () => jest.fn(
  () => <mock-ListPage>Mock ListPage</mock-ListPage>
))

const setup = (overrideProps) => {
  // Context functions
  const initializeDownload = jest.fn()
  const reportFilesProgress = jest.fn()
  const startReportingDownloads = jest.fn()
  const setCurrentPage = jest.fn()

  // Props
  const props = {
    setCurrentPage,
    hideCompleted: false,
    setHideCompleted: jest.fn(),
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        initializeDownload,
        reportFilesProgress,
        startReportingDownloads
      }
    }
    >
      <FileDownloads
        {...props}
      />
    </ElectronApiContext.Provider>
  )
}

describe('FileDownloads component', () => {
  test('renders the downloads page', async () => {
    setup()

    expect(ListPage).toHaveBeenCalledTimes(1)
  })
})
