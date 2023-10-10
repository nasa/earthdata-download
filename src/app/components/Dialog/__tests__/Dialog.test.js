import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Dialog from '../Dialog'

jest.mock('@radix-ui/react-visually-hidden', () => ({
  // eslint-disable-next-line react/prop-types
  Root: ({ children }) => <span data-testid="visually-hidden">{children}</span>
}))

describe('Dialog component', () => {
  describe('when the modal is not open', () => {
    test('does not render the dialog', () => {
      render(
        <Dialog open={false}>
          Test Dialog Content
        </Dialog>
      )

      expect(screen.queryByText('Test Dialog Content')).not.toBeInTheDocument()
    })
  })

  describe('when the modal is open', () => {
    test('renders the dialog', () => {
      render(
        <Dialog open>
          Test Dialog Content
        </Dialog>
      )

      expect(screen.queryByText('Test Dialog Content')).toBeInTheDocument()
    })

    test('does not focus on the first element in the modal', () => {
      render(
        <Dialog open>
          <button type="button">No focus</button>
        </Dialog>
      )

      expect(screen.queryByRole('button')).not.toHaveFocus()
    })
  })

  describe('when showTitle is set', () => {
    test('renders the title', () => {
      render(
        <Dialog
          open
          title="Test Title"
          showTitle
        >
          Test Dialog Content
        </Dialog>
      )

      expect(screen.queryByTestId('visually-hidden')).not.toBeInTheDocument()
    })
  })

  describe('when showTitle is not set', () => {
    test('renders a hidden title', () => {
      render(
        <Dialog
          open
          title="Test Title"
        >
          Test Dialog Content
        </Dialog>
      )

      expect(screen.queryByTestId('visually-hidden')).toBeInTheDocument()
    })
  })

  describe('when an title icon is defined', () => {
    test('renders an icon', () => {
      const IconMock = jest.fn()

      render(
        <Dialog
          open
          TitleIcon={IconMock}
          showTitle
        >
          Test Dialog Content
        </Dialog>
      )

      expect(IconMock).toHaveBeenCalledTimes(1)
    })

    test('adds the classname to the content', () => {
      const IconMock = jest.fn()

      render(
        <Dialog
          open
          TitleIcon={IconMock}
          showTitle
        >
          Test Dialog Content
        </Dialog>
      )

      const dialog = screen.queryByRole('dialog')

      expect(dialog).toHaveClass('hasHeaderIcon')
    })
  })

  describe('when a description is defined', () => {
    test('renders a description', () => {
      render(
        <Dialog
          open
          description="Test Description Content"
        >
          Test Dialog Content
        </Dialog>
      )

      expect(screen.queryByText('Test Description Content')).toBeInTheDocument()
    })
  })

  describe('when closeButton is defined', () => {
    test('renders a close button', () => {
      render(
        <Dialog
          closeButton
          open
        >
          Test Dialog Content
        </Dialog>
      )

      expect(screen.queryByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })
})
