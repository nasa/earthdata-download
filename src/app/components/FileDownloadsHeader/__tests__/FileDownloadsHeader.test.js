import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import FileDownloadsHeader from '../FileDownloadsHeader'

import { PAGES } from '../../../constants/pages'

const setup = (overrideProps) => {
  // ElectronApiContext functions
  const startReportingDownloads = jest.fn()

  // Props
  const setCurrentPage = jest.fn()
  const setCheckboxState = jest.fn()

  const props = {
    checked: false,
    setCurrentPage,
    setCheckboxState,
    downloadReport: {
      percentSum: null,
      totalFiles: 0,
      finishedFiles: 0,
      erroredFiles: 0,
      downloadLocation: '/mock/location',
      id: '7010 collection_1.5-20230718_162025'
    },
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        startReportingDownloads

      }
    }
    >
      <FileDownloadsHeader
        {...props}
      />
    </ElectronApiContext.Provider>
  )

  return {
    setCheckboxState,
    setCurrentPage,
    startReportingDownloads
  }
}

describe('FileDownloadsHeader component', () => {
  test('renders the downloads page and checkbox toggle', async () => {
    const { setCheckboxState } = setup()
    const hideCompletedCheckbox = screen.getByRole('checkbox', { name: 'Hide completed' })
    expect(hideCompletedCheckbox).toBeInTheDocument()

    await userEvent.click(hideCompletedCheckbox)

    expect(setCheckboxState).toHaveBeenCalledTimes(1)
    expect(setCheckboxState).toHaveBeenCalledWith(true)
  })

  test('Return back to downloads starts downloadProgress interval and changes page back to downloads', async () => {
    const { setCurrentPage, startReportingDownloads } = setup()
    const backToDownloadsButton = screen.getByRole('button', { name: 'Back to View Downloads' })
    expect(backToDownloadsButton).toBeInTheDocument()

    await userEvent.click(backToDownloadsButton)

    // Start polling for download progress
    expect(startReportingDownloads).toHaveBeenCalledTimes(1)

    // Change pages is triggered
    expect(setCurrentPage).toHaveBeenCalledTimes(1)
    expect(setCurrentPage).toHaveBeenCalledWith(PAGES.downloads)
  })
})
