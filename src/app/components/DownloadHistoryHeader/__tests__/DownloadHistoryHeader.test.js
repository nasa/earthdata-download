import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { FaUndo } from 'react-icons/fa'
import MockDate from 'mockdate'

import { ElectronApiContext } from '../../../context/ElectronApiContext'
import DownloadHistoryHeader from '../DownloadHistoryHeader'

import AppContext from '../../../context/AppContext'
import { UNDO_TIMEOUT } from '../../../constants/undoTimeout'

const setup = () => {
  const toasts = []
  const addToast = jest.fn((toast) => toasts.push(toast))
  const deleteAllToastsById = jest.fn()
  const deleteDownloadHistory = jest.fn()
  const setPendingDeleteDownloadHistory = jest.fn()
  const undoDeleteDownloadHistory = jest.fn()

  render(
    <ElectronApiContext.Provider value={
      {
        deleteDownloadHistory,
        setPendingDeleteDownloadHistory,
        undoDeleteDownloadHistory
      }
    }
    >
      <AppContext.Provider
        value={
          {
            addToast,
            deleteAllToastsById
          }
        }
      >
        <DownloadHistoryHeader />
      </AppContext.Provider>
    </ElectronApiContext.Provider>
  )

  return {
    addToast,
    deleteAllToastsById,
    deleteDownloadHistory,
    setPendingDeleteDownloadHistory,
    toasts,
    undoDeleteDownloadHistory
  }
}

beforeEach(() => {
  MockDate.set('2023-05-13T22:00:00')
})

afterEach(() => {
  jest.useRealTimers()
})

describe('DownloadHistoryHeader component', () => {
  describe('when clicking the Clear Download History button', () => {
    test('calls setPendingDeleteDownloadHistory and displays a toast', async () => {
      const {
        addToast,
        setPendingDeleteDownloadHistory
      } = setup()

      const button = screen.getByRole('button', { name: 'Clear Download History' })
      await userEvent.click(button)

      expect(setPendingDeleteDownloadHistory).toHaveBeenCalledTimes(1)
      expect(setPendingDeleteDownloadHistory).toHaveBeenCalledWith({ deleteId: 'clear-history-1684029600000' })

      expect(addToast).toHaveBeenCalledTimes(1)
      expect(addToast).toHaveBeenCalledWith({
        actions: [{
          altText: 'Undo',
          buttonProps: {
            Icon: FaUndo,
            onClick: expect.any(Function)
          },
          buttonText: 'Undo'
        }],
        id: 'undo-clear-history',
        message: 'Download History Cleared',
        variant: 'spinner'
      })
    })

    describe('when calling the undo callback', () => {
      test('calls undoDeleteDownloadHistory', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {
          deleteAllToastsById,
          toasts,
          undoDeleteDownloadHistory
        } = setup()

        const button = screen.getByRole('button', { name: 'Clear Download History' })
        await userEvent.click(button)

        expect(toasts).toHaveLength(1)

        const [toast] = toasts
        const { actions } = toast
        const [undoAction] = actions
        const { buttonProps } = undoAction
        const { onClick } = buttonProps

        jest.clearAllMocks()

        // Click the undo button
        onClick()

        expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
        expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number))

        expect(undoDeleteDownloadHistory).toHaveBeenCalledTimes(1)
        expect(undoDeleteDownloadHistory).toHaveBeenCalledWith({ deleteId: 'clear-history-1684029600000' })

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-history')
      })
    })

    describe('when the undo timeout runs out', () => {
      test('deletes the downloads and removes the toast', async () => {
        const {
          deleteAllToastsById,
          deleteDownloadHistory
        } = setup()

        jest.useFakeTimers({
          now: 1684029600000
        })

        await waitFor(async () => {
          const button = screen.getByRole('button', { name: 'Clear Download History' })
          await userEvent.click(button)
        })

        jest.clearAllMocks()
        jest.advanceTimersByTime(UNDO_TIMEOUT)

        expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
        expect(deleteAllToastsById).toHaveBeenCalledWith('undo-clear-history')

        expect(deleteDownloadHistory).toHaveBeenCalledTimes(1)
        expect(deleteDownloadHistory).toHaveBeenCalledWith({ deleteId: 'clear-history-1684029600100' })
      })
    })
  })
})
