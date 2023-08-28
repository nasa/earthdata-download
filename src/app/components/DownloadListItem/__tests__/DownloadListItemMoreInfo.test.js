import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import DownloadListItemMoreInfo from '../DownloadListItemMoreInfo'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const showMoreInfoDialog = jest.fn()

  const props = {
    downloadId: 'mock-download-id',
    numberErrors: 0,
    state: downloadStates.active,
    showMoreInfoDialog,
    ...overrideProps
  }

  const { container } = render(
    <DownloadListItemMoreInfo {...props} />
  )

  return {
    container,
    showMoreInfoDialog
  }
}

describe('DownloadListItemMoreInfo component', () => {
  describe('no errors exist', () => {
    test('returns null', () => {
      const { container } = setup()

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the state is error', () => {
    test('returns null', () => {
      setup({
        state: downloadStates.error,
        numberErrors: 3
      })

      expect(screen.getByText('More Info')).toBeInTheDocument()
    })
  })

  describe('when the state is errorFetchingLinks', () => {
    test('returns null', () => {
      setup({
        state: downloadStates.errorFetchingLinks
      })

      expect(screen.getByText('More Info')).toBeInTheDocument()
    })
  })

  describe('when clicking on More Info', () => {
    test('calls showMoreInfoDialog', async () => {
      const { showMoreInfoDialog } = setup({
        state: downloadStates.error,
        numberErrors: 3
      })

      const button = screen.getByText('More Info')
      await userEvent.click(button)

      expect(showMoreInfoDialog).toHaveBeenCalledTimes(1)
      expect(showMoreInfoDialog).toHaveBeenCalledWith({
        downloadId: 'mock-download-id',
        numberErrors: 3,
        state: downloadStates.error
      })
    })
  })
})
