import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import DownloadListItemState from '../DownloadListItemState'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const props = {
    downloadId: 'download-id',
    state: downloadStates.active,
    percent: 42,
    numberErrors: 0,
    showMoreInfoDialog: jest.fn(),
    ...overrideProps
  }

  return render(
    <DownloadListItemState {...props} />
  )
}

describe('DownloadListItemState component', () => {
  describe('when the state is active', () => {
    test('returns the state', () => {
      setup()

      const status = screen.getByText('Downloading')
      expect(status).toBeInTheDocument('displayStatus')
    })
  })

  describe('when the state is completed', () => {
    test('returns the state', () => {
      setup({
        state: downloadStates.completed
      })

      const status = screen.getByText('Complete')
      expect(status).toHaveClass('displayStatus')
      expect(status.childNodes[0]).toHaveClass('statusDescriptionIcon')
    })
  })

  describe('when the download has errors', () => {
    test('shows the errors', () => {
      setup({
        state: downloadStates.active,
        numberErrors: 1
      })

      expect(screen.getByText('Downloading')).toBeInTheDocument()
      expect(screen.getByText('1 error')).toBeInTheDocument()
    })

    describe('when multiple errors exist', () => {
      test('shows the errors', () => {
        setup({
          state: downloadStates.active,
          numberErrors: 2
        })

        expect(screen.getByText('Downloading')).toBeInTheDocument()
        expect(screen.getByText('2 errors')).toBeInTheDocument()
      })
    })

    describe('when clicking the errors link', () => {
      test('opens the dialog', async () => {
        const showMoreInfoDialogMock = jest.fn()
        setup({
          state: downloadStates.active,
          numberErrors: 2,
          showMoreInfoDialog: showMoreInfoDialogMock
        })

        await userEvent.click(screen.getByText('2 errors'))

        expect(showMoreInfoDialogMock).toHaveBeenCalledTimes(1)
        expect(showMoreInfoDialogMock).toHaveBeenCalledWith({
          downloadId: 'download-id',
          numberErrors: 2,
          state: downloadStates.active
        })
      })
    })
  })
})
