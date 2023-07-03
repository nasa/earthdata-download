import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import Toast from '../Toast'

/**
 * JSDOM doesn't implement PointerEvent so we need to mock our own implementation
 * Default to mouse left click interaction
 * This implementation is taken from
 * https://github.com/radix-ui/primitives/issues/1822#issuecomment-1474172897
 */
class MockPointerEvent extends Event {
  constructor(type, props) {
    super(type, props)
    this.pointerType = props.pointerType || 'mouse'
  }
}

window.PointerEvent = MockPointerEvent
window.HTMLElement.prototype.hasPointerCapture = jest.fn()

describe('Toast component', () => {
  describe('when the toast is not triggered', () => {
    test('does not render the toast', () => {
      render(
        <Toast open={false}>
          Test Toast Content
        </Toast>
      )

      expect(screen.queryByText('Test Toast Content')).not.toBeInTheDocument()
    })
  })

  describe('when the toast is triggered', () => {
    test('renders the toast', () => {
      render(
        <Toast open>
          Test Toast Content
        </Toast>
      )

      expect(screen.queryByText('Test Toast Content')).toBeInTheDocument()
    })
  })

  describe('when closeButton is set', () => {
    test('renders a close button', async () => {
      render(
        <Toast
          open
          closeButton
        >
          Test Toast Content
        </Toast>
      )

      const user = userEvent.setup()

      const closeButton = screen.queryByTestId('toast-close-button')
      expect(closeButton).toBeInTheDocument()

      await user.click(closeButton)
      expect(screen.queryByText('Test Toast Content')).not.toBeInTheDocument()
    })
  })
})
