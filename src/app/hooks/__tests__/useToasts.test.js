import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import useToasts from '../useToasts'

jest.mock('nanoid', () => ({
  nanoid: jest.fn()
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(4)
}))

afterEach(() => {
  jest.clearAllMocks()
})

const TestComponent = () => {
  const { toasts, addToast, dismissToast } = useToasts()
  return (
    <div>
      {toasts.map(({ message, id }) => (
        <div key={id}>
          {`${message} for toast id: ${id}`}
          <button
            type="button"
            onClick={() => dismissToast(id)}
          >
            Dismiss
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={() => addToast({ message: 'This is a message' })}
        >
          Add
        </button>
      </div>
    </div>
  )
}

describe('useToasts', () => {
  describe('when no toast exist', () => {
    test('does not render a toast', () => {
      render(<TestComponent />)

      expect(screen.queryByRole('text')).not.toBeInTheDocument()
    })
  })

  describe('when adding a toast', () => {
    test('adds the toast', async () => {
      render(<TestComponent />)

      const addButton = screen.queryByRole('button', { name: 'Add' })

      await userEvent.click(addButton)

      expect(screen.queryByText('This is a message for toast id: 1')).toBeInTheDocument()
    })
  })

  describe('when removing a toast', () => {
    test('removes the toast', async () => {
      render(<TestComponent />)

      const addButton = screen.queryByRole('button', { name: 'Add' })

      await userEvent.click(addButton)

      const dismissButton = screen.queryByRole('button', { name: 'Dismiss' })

      await userEvent.click(dismissButton)

      expect(screen.queryByText('This is a message for toast id: 1')).not.toBeInTheDocument()
    })

    // TODO why is the mockimplementation not resetting here
    describe('when multiple toasts exist', () => {
      test('removes the correct toast', async () => {
        render(<TestComponent />)

        const addButton = screen.queryByRole('button', { name: 'Add' })

        await userEvent.click(addButton)
        await userEvent.click(addButton)

        const dismissButton = screen.queryAllByRole('button', { name: 'Dismiss' })

        expect(screen.queryByText('This is a message for toast id: 3')).toBeInTheDocument()

        await userEvent.click(dismissButton[0])

        expect(screen.queryByText('This is a message for toast id: 3')).not.toBeInTheDocument()
      })
    })
  })
})
