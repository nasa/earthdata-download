import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Button from '../Button'

jest.mock('@radix-ui/react-visually-hidden', () => ({
  // eslint-disable-next-line react/prop-types
  Root: ({ children }) => <span data-testid="visually-hidden">{children}</span>
}))

describe('Button component', () => {
  describe('when an href is not defined', () => {
    test('renders the component as a button', () => {
      render(
        <Button
          onClick={() => {}}
        >
          Button Text
        </Button>
      )

      expect(screen.getByText('Button Text').nodeName.toLowerCase()).toBe('button')
    })
  })

  describe('when an href is defined', () => {
    test('renders the button as a link', () => {
      render(
        <Button
          href="test-href"
          rel="noreferrer"
          target="_blank"
        >
          Button Text
        </Button>
      )

      expect(screen.getByText('Button Text').nodeName.toLowerCase()).toBe('a')
      expect(screen.getByText('Button Text')).toHaveAttribute('href', 'test-href')
      expect(screen.getByText('Button Text')).toHaveAttribute('rel', 'noreferrer')
      expect(screen.getByText('Button Text')).toHaveAttribute('target', '_blank')
    })
  })

  describe('when an icon is defined', () => {
    test('renders an icon', () => {
      const IconMock = jest.fn()

      render(
        <Button
          onClick={() => {}}
          Icon={IconMock}
        >
          Button Text
        </Button>
      )

      expect(IconMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the label is not hidden', () => {
    test('renders the label visible', async () => {
      render(
        <Button
          onClick={() => {}}
        >
          Button Text
        </Button>
      )

      expect(screen.queryByTestId('visually-hidden')).not.toBeInTheDocument()
    })
  })

  describe('when the label is hidden', () => {
    test('renders the label visually hidden', () => {
      render(
        <Button
          onClick={() => {}}
          hideLabel
        >
          Button Text
        </Button>
      )

      expect(screen.queryByTestId('visually-hidden')).toBeInTheDocument()
    })
  })
})
