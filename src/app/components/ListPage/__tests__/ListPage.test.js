import { render, screen } from '@testing-library/react'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import '@testing-library/jest-dom'

import ListPage from '../ListPage'
import downloadStates from '../../../constants/downloadStates'
import AppContext from '../../../context/AppContext'

// AutoSizer has problems in jest, so we'll just test that the AutoSize component
// is rendered when it is supposed to be https://github.com/bvaughn/react-virtualized-auto-sizer/issues/69
jest.mock('react-virtualized-auto-sizer')

const setup = (overrideProps = {}) => {
  const setWindowState = jest.fn()
  const fetchReport = jest.fn()

  const props = {
    actions: [],
    emptyMessage: 'Mock Empty Message',
    fetchReport,
    header: null,
    hideCompleted: false,
    Icon: null,
    items: [],
    itemSize: 97,
    totalItemCount: 0,
    setWindowState,
    ...overrideProps
  }

  render(
    <AppContext.Provider
      value={
        {
          toasts: {}
        }
      }
    >
      <ListPage {...props} />
    </AppContext.Provider>
  )

  return {
    fetchReport,
    setWindowState
  }
}

beforeEach(() => {
  jest.useFakeTimers()
})

describe('ListPage', () => {
  test('calls fetchReport to get items', () => {
    const { fetchReport } = setup()

    expect(fetchReport).toHaveBeenCalledTimes(1)
    // Empty windowState because we are mocking AutoSizer
    expect(fetchReport).toHaveBeenCalledWith({})
  })

  test('calls fetchReport every REPORT_INTERVAL', () => {
    const { fetchReport } = setup()

    expect(fetchReport).toHaveBeenCalledTimes(1)
    // Empty windowState because we are mocking AutoSizer
    expect(fetchReport).toHaveBeenCalledWith({})

    jest.clearAllMocks()
    jest.advanceTimersByTime(1000)

    expect(fetchReport).toHaveBeenCalledTimes(1)
    // Empty windowState because we are mocking AutoSizer
    expect(fetchReport).toHaveBeenCalledWith({})
  })

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
        }],
        totalItemCount: 1
      })

      expect(screen.getByTestId('mock-header')).toBeInTheDocument()

      expect(AutoSizer).toHaveBeenCalledTimes(1)
    })
  })

  describe('when there are items, but none to display', () => {
    test('renders the header and list', () => {
      setup({
        header: (
          <div data-testid="mock-header">Mock Header</div>
        ),
        items: [],
        totalItemCount: 1
      })

      expect(screen.getByText('All items complete')).toBeInTheDocument()
    })
  })
})
