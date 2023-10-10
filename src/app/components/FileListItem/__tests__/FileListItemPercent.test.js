import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import FileListItemPercent from '../FileListItemPercent'

const setup = (overrideProps = {}) => {
  const props = {
    percent: 42,
    ...overrideProps
  }

  return render(
    <FileListItemPercent {...props} />
  )
}

describe('FileListItemPercent component', () => {
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

  describe('when the percent contains a decimal', () => {
    test('returns the a rounded percent', () => {
      setup({
        percent: 42.2
      })

      expect(screen.getByText('42%')).toHaveClass('percentComplete')
    })
  })
})
