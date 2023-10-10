import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import FileListItemTimeRemaining from '../FileListItemTimeRemaining'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const props = {
    percent: 42,
    remainingTime: 123000,
    shouldShowTime: true,
    state: downloadStates.active,
    ...overrideProps
  }

  return render(
    <FileListItemTimeRemaining {...props} />
  )
}

describe('FileListItemTimeRemaining component', () => {
  test('returns the remaining time', () => {
    setup()

    expect(screen.getByText('2m, 3s remaining').parentElement).toHaveClass('statusDescription')
  })

  test('returns the state', () => {
    setup({
      remainingTime: 0,
      shouldShowTime: false,
      state: downloadStates.starting
    })

    expect(screen.getByText('Initializing').parentElement).toHaveClass('statusDescription')
  })

  describe('when shouldShowTime and shouldShowState is false', () => {
    test('returns null', () => {
      const { container } = setup({
        shouldShowTime: false
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the item is complete', () => {
    test('returns the remaining time', () => {
      const { container } = setup({
        state: downloadStates.completed
      })

      expect(container.querySelector('.statusDescriptionIcon')).toBeInTheDocument()
    })
  })
})
