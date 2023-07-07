import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Alert from '../Alert'

describe('Alert component', () => {
  test('renders the component', () => {
    render(
      <Alert
        variant="warning"
      >
        Alert Text
      </Alert>
    )

    expect(screen.getByText('Alert Text')).toBeInTheDocument()
  })

  describe('when a className is defined', () => {
    test('renders the component', () => {
      render(
        <Alert
          className="test-class"
          variant="warning"
        >
          Alert Text
        </Alert>
      )

      expect(screen.getByText('Alert Text')).toHaveClass('test-class')
    })
  })
})
