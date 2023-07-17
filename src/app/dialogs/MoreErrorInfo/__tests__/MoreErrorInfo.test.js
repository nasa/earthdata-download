import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import MoreErrorInfo from '../MoreErrorInfo'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

const setup = (overrideErrorInfo) => {
  const cancelErroredDownloadItem = jest.fn()
  const retryDownloadItem = jest.fn()

  const collectionErrorInfo = overrideErrorInfo || [
    {
      itemName: 'mock-filename.png',
      url: 'http://example.com/mock-filename.png'
    }
  ]

  render(
    <ElectronApiContext.Provider value={{ cancelErroredDownloadItem, retryDownloadItem }}>
      <AppContext.Provider value={{
        toasts: {}
      }}
      >
        <MoreErrorInfo
          downloadId="mock-download-id"
          collectionErrorInfo={collectionErrorInfo}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    cancelErroredDownloadItem,
    retryDownloadItem
  }
}

describe('MoreErrorInfo component', () => {
  test('renders the MoreErrorInfo modal page', () => {
    setup()

    expect(screen.getByText(
      /An error occurred while downloading files to/i
    )).toBeInTheDocument()
  })

  test('clicking the Retry All Errored button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { retryDownloadItem } = setup([
      {
        itemName: 'mock-filename-1.png',
        url: 'http://example.com/mock-filename-1.png'
      },
      {
        itemName: 'mock-filename-2.png',
        url: 'http://example.com/mock-filename-2.png'
      }
    ])

    await user.click(screen.getByRole('button', { name: /Retry Downloading Files/i }))

    expect(retryDownloadItem).toHaveBeenCalledTimes(1)
    expect(retryDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id'
    })
  })

  test('clicking the Cancel All Errored button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { cancelErroredDownloadItem } = setup([
      {
        itemName: 'mock-filename-1.png',
        url: 'http://example.com/mock-filename-1.png'
      },
      {
        itemName: 'mock-filename-2.png',
        url: 'http://example.com/mock-filename-2.png'
      }
    ])

    await user.click(screen.getByRole('button', { name: /Cancel Downloading Files/i }))

    expect(cancelErroredDownloadItem).toHaveBeenCalledTimes(1)
    expect(cancelErroredDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id'
    })
  })
})
