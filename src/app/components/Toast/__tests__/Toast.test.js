import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ToastProvider, ToastViewport } from '@radix-ui/react-toast'
import { FaExclamationCircle, FaInfoCircle } from 'react-icons/fa'

import AppContext from '../../../context/AppContext'

import Toast from '../Toast'

jest.mock('react-icons/fa', () => ({
  FaExclamationCircle: jest.fn(() => (
    <mock-FaExclamationCircle data-testid="FaExclamationCircle" />
  )),
  FaInfoCircle: jest.fn(() => (
    <mock-FaInfoCircle data-testid="FaInfoCircle" />
  ))
}))

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
  test('renders the message', () => {
    render(
      <AppContext.Provider value={
        {
          toasts: {}
        }
      }
      >
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            message="This is a mock message"
          />
          <ToastViewport />
        </ToastProvider>
      </AppContext.Provider>
    )

    expect(screen.getByText('This is a mock message')).toBeInTheDocument()
  })

  test('renders the correct icon', () => {
    render(
      <AppContext.Provider value={
        {
          toasts: {}
        }
      }
      >
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            message="This is a mock message"
          />
          <ToastViewport />
        </ToastProvider>
      </AppContext.Provider>
    )

    expect(FaInfoCircle).toHaveBeenCalledTimes(1)
  })

  describe('when a title is defined', () => {
    test('renders the title', () => {
      render(
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            title="Mock title"
            message="This is a mock message"
          />
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Mock title')).toBeInTheDocument()
    })
  })

  describe('when a variant is defined', () => {
    test('renders adds the class name', () => {
      render(
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            message="This is a mock message"
            variant="danger"
          />
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getAllByRole('status')[0]).toHaveClass('isDanger')
    })
  })

  describe('when a the danger variant is defined', () => {
    test('renders adds the class name', () => {
      render(
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            message="This is a mock message"
            variant="danger"
          />
          <ToastViewport />
        </ToastProvider>
      )

      expect(FaExclamationCircle).toHaveBeenCalledTimes(1)
    })
  })

  describe('when actions are defined', () => {
    test('renders the actions', () => {
      const actionOnClickMock = jest.fn()

      render(
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            message="This is a mock message"
            actions={
              [{
                altText: 'Mock alt text',
                buttonProps: {
                  variant: 'danger',
                  onClick: actionOnClickMock
                },
                buttonText: 'Mock action'
              }]
            }
          />
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByRole('button', { name: 'Mock action' })).toBeInTheDocument()
    })
  })

  describe('when actions are defined', () => {
    test('renders the actions', async () => {
      const actionOnClickMock = jest.fn()

      render(
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={() => {}}
            message="This is a mock message"
            actions={
              [{
                altText: 'Mock alt text',
                buttonProps: {
                  variant: 'danger',
                  onClick: actionOnClickMock
                },
                buttonText: 'Mock action'
              }]
            }
          />
          <ToastViewport />
        </ToastProvider>
      )

      const actionButton = screen.getByRole('button', { name: 'Mock action' })

      await userEvent.click(actionButton)

      expect(actionOnClickMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the dismiss toast button is clicked', () => {
    test('calls the callback on the context', async () => {
      const dismissToastMock = jest.fn()

      render(
        <ToastProvider>
          <Toast
            id="mock-toast-id"
            dismissToast={dismissToastMock}
            message="This is a mock message"
          />
          <ToastViewport />
        </ToastProvider>
      )

      const actionButton = screen.getByRole('button', { name: 'Dismiss' })

      await userEvent.click(actionButton)

      expect(dismissToastMock).toHaveBeenCalledTimes(1)
    })
  })
})
