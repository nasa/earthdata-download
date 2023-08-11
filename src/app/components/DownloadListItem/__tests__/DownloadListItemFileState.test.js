import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadListItemState from '../DownloadListItemState'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const props = {
    state: downloadStates.active,
    percent: 42,
    hasErrors: false,
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
      expect(status).toHaveClass('displayStatus')
      expect(status.childNodes[0]).toHaveClass('statusDescriptionIcon spinner')
    })
  })

  describe('when the state is completed', () => {
    test('returns the state', () => {
      setup({
        state: downloadStates.completed
      })

      const status = screen.getByText('Completed')
      expect(status).toHaveClass('displayStatus')
      expect(status.childNodes[0]).toHaveClass('statusDescriptionIcon')
    })
  })

  describe('when the download has errors', () => {
    test('returns the state', () => {
      setup({
        state: downloadStates.active,
        hasErrors: true
      })

      const status = screen.getByText('Downloading with errors')
      expect(status).toHaveClass('displayStatus')
      expect(status.childNodes[0]).toHaveClass('statusDescriptionIcon spinner')
      expect(status.childNodes[1]).toHaveClass('hasErrorsIcon')
    })
  })
})
