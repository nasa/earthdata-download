import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import MoreErrorInfo from '../MoreErrorInfo'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = (overrideErrorInfo) => {
  const cancelDownloadItem = jest.fn()
  const retryDownloadItem = jest.fn()

  const collectionErrorInfo = overrideErrorInfo || [
    {
      itemName: 'mock-filename.png',
      url: 'http://example.com/mock-filename.png'
    }
  ]

  render(
    <ElectronApiContext.Provider value={{ cancelDownloadItem, retryDownloadItem }}>
      <MoreErrorInfo
        downloadId="mock-download-id"
        collectionErrorInfo={collectionErrorInfo}
      />
    </ElectronApiContext.Provider>
  )

  return {
    cancelDownloadItem,
    retryDownloadItem
  }
}

describe('MoreErrorInfo component', () => {
  test('renders the MoreErrorInfo modal page', () => {
    setup()

    expect(screen.getByText(
      /server responded with an error while downloading files/i
    )).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view errored file details/i })).toBeInTheDocument()
  })

  test('clicking the view errored files button opens the dropdown', async () => {
    setup()

    const user = userEvent.setup()
    const dropdown = screen.getByRole('button', { name: /view errored file details/i })

    expect(screen.getByText(
      /server responded with an error while downloading files/i
    )).toBeInTheDocument()
    expect(dropdown).toBeInTheDocument()

    await user.click(dropdown)

    expect(screen.getByRole('button', { name: /^retry$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  test('clicking the Retry File Download button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { retryDownloadItem } = setup()

    const dropdown = screen.getByRole('button', { name: /view errored file details/i })
    await user.click(dropdown)

    await user.click(screen.getByRole('button', { name: /^retry$/i }))

    expect(retryDownloadItem).toHaveBeenCalledTimes(1)
    expect(retryDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      name: 'mock-filename.png'
    })
  })

  test('clicking the Cancel File Download button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { cancelDownloadItem } = setup()

    const dropdown = screen.getByRole('button', { name: /view errored file details/i })
    await user.click(dropdown)

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
    expect(cancelDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      name: 'mock-filename.png'
    })
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

    await user.click(screen.getByRole('button', { name: /retry all errored/i }))

    expect(retryDownloadItem).toHaveBeenCalledTimes(2)
    expect(retryDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      name: 'mock-filename-1.png'
    })
    expect(retryDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      name: 'mock-filename-2.png'
    })
  })

  test('clicking the Cancel All Errored button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { cancelDownloadItem } = setup([
      {
        itemName: 'mock-filename-1.png',
        url: 'http://example.com/mock-filename-1.png'
      },
      {
        itemName: 'mock-filename-2.png',
        url: 'http://example.com/mock-filename-2.png'
      }
    ])

    await user.click(screen.getByRole('button', { name: /cancel all errored/i }))

    expect(cancelDownloadItem).toHaveBeenCalledTimes(2)
    expect(cancelDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      name: 'mock-filename-1.png'
    })
    expect(cancelDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id',
      name: 'mock-filename-2.png'
    })
  })
})
