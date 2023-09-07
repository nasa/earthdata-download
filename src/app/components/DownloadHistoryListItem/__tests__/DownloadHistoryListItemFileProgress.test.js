import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadHistoryListItemFileProgress from '../DownloadHistoryListItemFileProgress'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const props = {
    finishedFiles: 5,
    state: downloadStates.active,
    totalTime: 234000,
    ...overrideProps
  }

  return render(
    <DownloadHistoryListItemFileProgress {...props} />
  )
}

describe('DownloadHistoryListItemFileProgress component', () => {
  test('returns the progress', () => {
    setup()

    expect(screen.getByText('5 files in 3 minutes, 54 seconds')).toHaveClass('statusInformation')
  })

  describe('when the state is cancelled', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.cancelled
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the state is error', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.error
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the state is errorFetchingLinks', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.errorFetchingLinks
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
