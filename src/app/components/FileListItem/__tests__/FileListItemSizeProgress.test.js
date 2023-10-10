import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import FileListItemSizeProgress from '../FileListItemSizeProgress'

const setup = (overrideProps = {}) => {
  const props = {
    receivedBytes: 123,
    shouldShowBytes: true,
    totalBytes: 5000,
    ...overrideProps
  }

  return render(
    <FileListItemSizeProgress {...props} />
  )
}

describe('FileListItemSizeProgress component', () => {
  test('returns the size progress', () => {
    setup()

    expect(screen.getByText('123 b/5 kb')).toHaveClass('statusInformationByteStats')
  })

  describe('when shouldShowBytes is false', () => {
    test('returns null', () => {
      const { container } = setup({
        shouldShowBytes: false
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
