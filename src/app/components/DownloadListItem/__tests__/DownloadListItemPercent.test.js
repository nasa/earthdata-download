import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadListItemPercent from '../DownloadListItemPercent'

const setup = (overrideProps = {}) => {
  const props = {
    percent: 42,
    ...overrideProps
  }

  return render(
    <DownloadListItemPercent {...props} />
  )
}

describe('DownloadListItemPercent component', () => {
  test('returns the percent', () => {
    setup()

    expect(screen.getByText('42%')).toHaveClass('percentComplete')
  })

  describe('when percent does not exist', () => {
    test('returns null', () => {
      const { container } = setup({
        percent: 0
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
