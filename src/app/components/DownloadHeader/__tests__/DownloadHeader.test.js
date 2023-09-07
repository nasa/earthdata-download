import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import DownloadHeader from '../DownloadHeader'

import downloadStates from '../../../constants/downloadStates'
import AppContext from '../../../context/AppContext'

const setup = (overrideProps) => {
  // ElectronApiContext functions
  const cancelDownloadItem = jest.fn()
  const clearDownload = jest.fn()
  const pauseDownloadItem = jest.fn()
  const resumeDownloadItem = jest.fn()

  const deleteAllToastsById = jest.fn()

  // Props
  const setCurrentPage = jest.fn()

  const props = {
    allDownloadsCompleted: false,
    allDownloadsPaused: false,
    state: downloadStates.pending,
    totalCompletedFiles: 0,
    totalFiles: 0,
    ...overrideProps
  }

  render(
    <ElectronApiContext.Provider value={
      {
        cancelDownloadItem,
        clearDownload,
        pauseDownloadItem,
        resumeDownloadItem
      }
    }
    >
      <AppContext.Provider
        value={
          {
            deleteAllToastsById
          }
        }
      >
        <DownloadHeader
          {...props}
        />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    cancelDownloadItem,
    clearDownload,
    deleteAllToastsById,
    pauseDownloadItem,
    resumeDownloadItem,
    setCurrentPage
  }
}

describe('DownloadHeader component', () => {
  describe('when clicking the Pause All button', () => {
    test('calls pauseDownloadItem', async () => {
      const { pauseDownloadItem } = setup()

      const button = screen.getByRole('button', { name: 'Pause All' })
      await userEvent.click(button)

      expect(pauseDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking the Resume All button', () => {
    test('calls resumeDownloadItem', async () => {
      const { resumeDownloadItem } = setup({
        allDownloadsPaused: true
      })

      const button = screen.getByRole('button', { name: 'Resume All' })
      await userEvent.click(button)

      expect(resumeDownloadItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('when clicking the Cancel All button', () => {
    test('calls cancelDownloadItem and deleteAllToastsById', async () => {
      const { cancelDownloadItem, deleteAllToastsById } = setup()

      const button = screen.getByRole('button', { name: 'Cancel All' })
      await userEvent.click(button)

      expect(cancelDownloadItem).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith()
    })
  })

  describe('when clicking the Clear Downloads button', () => {
    test('calls cancelDownloadItem and deleteAllToastsById', async () => {
      const { clearDownload, deleteAllToastsById } = setup({
        allDownloadsCompleted: true,
        state: downloadStates.completed,
        totalCompletedFiles: 10,
        totalFiles: 10
      })

      const button = screen.getByRole('button', { name: 'Clear Downloads' })
      await userEvent.click(button)

      expect(clearDownload).toHaveBeenCalledTimes(1)
      expect(clearDownload).toHaveBeenCalledWith({})
      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
      expect(deleteAllToastsById).toHaveBeenCalledWith()
    })
  })

  describe('when there are active downloads', () => {
    test('displays the correct information', () => {
      setup({
        state: downloadStates.active,
        totalCompletedFiles: 5,
        totalFiles: 10
      })

      expect(screen.getByText('Downloading')).toHaveClass('derivedStatus')
      expect(screen.getByText('5 of 10 files done')).toHaveClass('humanizedStatus')

      expect(screen.getByRole('button', { name: 'Pause All' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()
    })
  })

  describe('when all downloads are completed', () => {
    test('displays the correct information', () => {
      setup({
        allDownloadsCompleted: true,
        state: downloadStates.completed,
        totalCompletedFiles: 10,
        totalFiles: 10
      })

      expect(screen.getByText('Completed')).toHaveClass('derivedStatus')
      expect(screen.getByText('10 of 10 files done')).toHaveClass('humanizedStatus')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Resume All' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Cancel All' })).not.toBeInTheDocument()
    })
  })

  describe('when all downloads are paused', () => {
    test('displays the correct information', () => {
      setup({
        allDownloadsPaused: true,
        state: downloadStates.paused,
        totalCompletedFiles: 5,
        totalFiles: 10
      })

      expect(screen.getByText('Paused')).toHaveClass('derivedStatus')
      expect(screen.getByText('5 of 10 files done')).toHaveClass('humanizedStatus')

      expect(screen.queryByRole('button', { name: 'Pause All' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Resume All' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel All' })).toBeInTheDocument()
    })
  })
})
