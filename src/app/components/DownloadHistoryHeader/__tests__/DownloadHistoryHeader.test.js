import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import DownloadHistoryHeader from '../DownloadHistoryHeader'

import AppContext from '../../../context/AppContext'

const setup = () => {
  const clearDownloadHistory = jest.fn()
  const deleteAllToastsById = jest.fn()

  render(
    <ElectronApiContext.Provider value={
      {
        clearDownloadHistory
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
        <DownloadHistoryHeader />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    deleteAllToastsById,
    clearDownloadHistory
  }
}

describe('DownloadHistoryHeader component', () => {
  describe('when clicking the Clear Download History button', () => {
    test('calls clearDownloadHistory', async () => {
      const {
        clearDownloadHistory,
        deleteAllToastsById
      } = setup()

      const button = screen.getByRole('button', { name: 'Clear Download History' })
      await userEvent.click(button)

      expect(clearDownloadHistory).toHaveBeenCalledTimes(1)
      expect(clearDownloadHistory).toHaveBeenCalledWith({})
      expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
    })
  })
})
