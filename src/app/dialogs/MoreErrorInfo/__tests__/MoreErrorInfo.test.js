import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import MoreErrorInfo from '../MoreErrorInfo'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'

const setup = () => {
  const cancelErroredDownloadItem = jest.fn()
  const deleteAllToastsById = jest.fn()
  const onCloseMoreErrorInfoDialog = jest.fn()
  const retryDownloadItem = jest.fn()

  render(
    <ElectronApiContext.Provider value={{ cancelErroredDownloadItem, retryDownloadItem }}>
      <AppContext.Provider value={{
        deleteAllToastsById
      }}
      >
        <MoreErrorInfo
          downloadId="mock-download-id"
          numberErrors={3}
          onCloseMoreErrorInfoDialog={onCloseMoreErrorInfoDialog}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    cancelErroredDownloadItem,
    deleteAllToastsById,
    retryDownloadItem
  }
}

describe('MoreErrorInfo component', () => {
  test('renders the MoreErrorInfo modal page', () => {
    setup()

    expect(screen.getByText(
      '3 files failed to download in mock-download-id.'
    )).toBeInTheDocument()
  })

  test('clicking the Retry All Errored button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { deleteAllToastsById, retryDownloadItem } = setup([
      {
        itemName: 'mock-filename-1.png',
        url: 'http://example.com/mock-filename-1.png'
      },
      {
        itemName: 'mock-filename-2.png',
        url: 'http://example.com/mock-filename-2.png'
      }
    ])

    await user.click(screen.getByRole('button', { name: /Retry Failed Files/i }))

    expect(retryDownloadItem).toHaveBeenCalledTimes(1)
    expect(retryDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id'
    })

    expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
    expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')
  })

  test('clicking the Cancel All Errored button sends a message to the main process', async () => {
    const user = userEvent.setup()

    const { cancelErroredDownloadItem, deleteAllToastsById } = setup([
      {
        itemName: 'mock-filename-1.png',
        url: 'http://example.com/mock-filename-1.png'
      },
      {
        itemName: 'mock-filename-2.png',
        url: 'http://example.com/mock-filename-2.png'
      }
    ])

    await user.click(screen.getByRole('button', { name: /Cancel Failed Files/i }))

    expect(cancelErroredDownloadItem).toHaveBeenCalledTimes(1)
    expect(cancelErroredDownloadItem).toHaveBeenCalledWith({
      downloadId: 'mock-download-id'
    })

    expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
    expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')
  })
})
