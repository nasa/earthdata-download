import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloads from '../FileDownloads'

import FileDownloadsList from '../../../components/FileDownloadsList/FileDownloadsList'
import FileDownloadsHeader from '../../../components/FileDownloadsHeader/FileDownloadsHeader'

jest.mock('../../../components/FileDownloadsList/FileDownloadsList', () => jest.fn(
  () => <mock-FileDownloadsList>Mock FileDownloadsList</mock-FileDownloadsList>
))

jest.mock('../../../components/FileDownloadsHeader/FileDownloadsHeader', () => jest.fn(
  () => <mock-FileDownloadsHeader>Mock FileDownloadsHeader</mock-FileDownloadsHeader>
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
    // Renders the `fileDownloadsList`
    expect(FileDownloadsList).toHaveBeenCalledTimes(1)
    expect(screen.queryAllByText('Mock FileDownloadsList').length).toBe(1)

    // Renders the `fileDownloadsHeader`
    expect(FileDownloadsHeader).toHaveBeenCalledTimes(1)
    expect(screen.queryAllByText('Mock FileDownloadsHeader').length).toBe(1)
  })
})
