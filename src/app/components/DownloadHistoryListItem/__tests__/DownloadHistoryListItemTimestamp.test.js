import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadHistoryListItemTimestamp from '../DownloadHistoryListItemTimestamp'

const setup = (overrideProps = {}) => {
  const props = {
    time: 1694020248695,
    ...overrideProps
  }

  return render(
    <DownloadHistoryListItemTimestamp {...props} />
  )
}

describe('DownloadHistoryListItemTimestamp component', () => {
  test('returns the time', () => {
    setup()

    expect(screen.getByText('Sep 6, 2023 at 1:10:48 PM')).toBeInTheDocument()
  })

  describe('when time does not exist', () => {
    test('returns null', () => {
      const { container } = setup({
        time: null
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
