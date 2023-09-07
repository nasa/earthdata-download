import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadHistoryListItemState from '../DownloadHistoryListItemState'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const props = {
    state: downloadStates.completed,
    percent: 100,
    hasErrors: false,
    ...overrideProps
  }

  return render(
    <DownloadHistoryListItemState {...props} />
  )
}

describe('DownloadHistoryListItemState component', () => {
  describe('when the state is completed', () => {
    test('returns the state', () => {
      setup()

      const status = screen.getByText('Completed')
      expect(status).toHaveClass('displayStatus')
      expect(status.childNodes[0]).toHaveClass('statusDescriptionIcon')
    })
  })

  describe('when the download has errors', () => {
    test('returns the state', () => {
      setup({
        hasErrors: true
      })

      const status = screen.getByText('Completed with errors')
      expect(status).toHaveClass('displayStatus')
      expect(status.childNodes[0]).toHaveClass('statusDescriptionIcon')
      expect(status.childNodes[1]).toHaveClass('hasErrorsIcon')
    })
  })
})
