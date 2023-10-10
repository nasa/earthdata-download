import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import MoreErrorInfo from '../MoreErrorInfo'
import { ElectronApiContext } from '../../../context/ElectronApiContext'
import AppContext from '../../../context/AppContext'
import { PAGES } from '../../../constants/pages'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const cancelErroredDownloadItem = jest.fn()
  const deleteAllToastsById = jest.fn()
  const setCurrentPage = jest.fn()
  const setSelectedDownloadId = jest.fn()
  const onCloseMoreErrorInfoDialog = jest.fn()
  const retryErroredDownloadItem = jest.fn()

  const props = {
    downloadId: 'mock-download-id',
    numberErrors: 3,
    state: undefined,
    setCurrentPage,
    setSelectedDownloadId,
    onCloseMoreErrorInfoDialog,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        cancelErroredDownloadItem,
        retryErroredDownloadItem
      }
    }
    >
      <AppContext.Provider value={
        {
          deleteAllToastsById
        }
      }
      >
        <MoreErrorInfo
          {...props}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    cancelErroredDownloadItem,
    deleteAllToastsById,
    retryErroredDownloadItem,
    setCurrentPage,
    onCloseMoreErrorInfoDialog,
    setSelectedDownloadId
  }
}

describe('MoreErrorInfo component', () => {
  describe('when the state is errorFetchingLinks', () => {
    test('displays the error message', () => {
      setup({
        state: downloadStates.errorFetchingLinks
      })

      expect(screen.getByText(
        'The links associated with the download were not able to be retrieved. Try initializing the download again to download your files.'
      )).toBeInTheDocument()
    })
  })

  describe('when the state is not errorFetchingLinks', () => {
    test('displays the error message and button to the files', () => {
      setup()

      expect(screen.getByText('3 files were not able to be downloaded. If the problem persists, try initializing the download again to download your files.')).toBeInTheDocument()

      expect(screen.getByRole('button', { name: 'View Download' })).toBeInTheDocument()
    })

    test('clicking the downloadId button calls setCurrentPage, setSelectedDownloadId and closes the dialog', async () => {
      const user = userEvent.setup()

      const {
        setCurrentPage,
        setSelectedDownloadId,
        onCloseMoreErrorInfoDialog
      } = setup([
        {
          itemName: 'mock-filename-1.png',
          url: 'http://example.com/mock-filename-1.png'
        },
        {
          itemName: 'mock-filename-2.png',
          url: 'http://example.com/mock-filename-2.png'
        }
      ])

      await user.click(screen.getByRole('button', { name: 'View Download' }))

      expect(setCurrentPage).toHaveBeenCalledTimes(1)
      expect(setCurrentPage).toHaveBeenCalledWith(PAGES.fileDownloads)

      expect(setSelectedDownloadId).toHaveBeenCalledTimes(1)
      expect(setSelectedDownloadId).toHaveBeenCalledWith('mock-download-id')

      expect(onCloseMoreErrorInfoDialog).toHaveBeenCalledTimes(1)
    })

    test('clicking the Retry All Errored button sends a message to the main process', async () => {
      const user = userEvent.setup()

      const { deleteAllToastsById, retryErroredDownloadItem } = setup([
        {
          itemName: 'mock-filename-1.png',
          url: 'http://example.com/mock-filename-1.png'
        },
        {
          itemName: 'mock-filename-2.png',
          url: 'http://example.com/mock-filename-2.png'
        }
      ])

      await user.click(screen.getByRole('button', { name: /Retry/i }))

      expect(retryErroredDownloadItem).toHaveBeenCalledTimes(1)
      expect(retryErroredDownloadItem).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      })

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')
    })

    test('clicking the Cancel button sends a message to the main process', async () => {
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

      await user.click(screen.getByRole('button', { name: /Cancel/i }))

      expect(cancelErroredDownloadItem).toHaveBeenCalledTimes(1)
      expect(cancelErroredDownloadItem).toHaveBeenCalledWith({
        downloadId: 'mock-download-id'
      })

      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id')
    })
  })
})
