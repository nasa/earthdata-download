import { render, screen } from '@testing-library/react'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import '@testing-library/jest-dom'

import ListPage from '../ListPage'
import downloadStates from '../../../constants/downloadStates'

// AutoSizer has problems in jest, so we'll just test that the AutoSize component
// is rendered when it is supposed to be https://github.com/bvaughn/react-virtualized-auto-sizer/issues/69
jest.mock('react-virtualized-auto-sizer')

const setup = (overrideProps = {}) => {
  const setWindowState = jest.fn()

  const props = {
    actions: [],
    emptyMessage: 'Mock Empty Message',
    header: null,
    hideCompleted: false,
    Icon: null,
    items: [],
    setWindowState,
    ...overrideProps
  }

  render(
    <ListPage {...props} />
  )

  return {
    setWindowState
  }
}

describe('ListPage', () => {
  describe('when no items are provided', () => {
    test('renders the empty message', () => {
      setup()

      expect(screen.getByText('Mock Empty Message')).toBeInTheDocument()

      expect(AutoSizer).toHaveBeenCalledTimes(0)
    })
  })

  describe('when items are provided', () => {
    test('renders the header and list', () => {
      setup({
        header: (
          <div data-testid="mock-header">Mock Header</div>
        ),
        items: [{
          file: {
            downloadId: 'mock-download-id',
            filename: 'file1.png',
            state: downloadStates.completed,
            percent: 100,
            receivedBytes: 24902726,
            totalBytes: 24902726,
            remainingTime: 0
          },
          type: 'file'
        }]
      })

      expect(screen.getByTestId('mock-header')).toBeInTheDocument()

      expect(AutoSizer).toHaveBeenCalledTimes(1)
    })
  })
})
