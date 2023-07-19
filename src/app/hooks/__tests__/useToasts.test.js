import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import useToasts from '../useToasts'

afterEach(() => {
  jest.clearAllMocks()
})

const TestComponent = () => {
  const {
    toasts,
    addToast,
    deleteAllToastsById,
    dismissToast
  } = useToasts()

  const { activeToasts } = toasts

  return (
    <div>
      {
        Object.values(activeToasts).filter(Boolean).map(({ message, id }) => (
          <div key={id}>
            {`${message} for toast id: ${id}`}
            <button
              type="button"
              onClick={() => dismissToast(id)}
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => deleteAllToastsById(id)}
            >
              Delete
            </button>
          </div>
        ))
      }
      <div>
        <button
          type="button"
          onClick={() => addToast({
            id: 'mock-id',
            message: 'This is a message'
          })}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => addToast({
            id: 'mock-id-2',
            message: 'This is a second message'
          })}
        >
          Add 2
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

      expect(screen.queryByText('This is a message for toast id: mock-id')).toBeInTheDocument()
    })
  })

  describe('when removing a toast', () => {
    test('removes the toast', async () => {
      render(<TestComponent />)

      const addButton = screen.queryByRole('button', { name: 'Add' })

      await userEvent.click(addButton)

      const dismissButton = screen.queryByRole('button', { name: 'Dismiss' })

      await userEvent.click(dismissButton)

      expect(screen.queryByText('This is a message for toast id: mock-id')).not.toBeInTheDocument()
    })

    describe('when multiple toasts exist', () => {
      test('removes the correct toast', async () => {
        render(<TestComponent />)

        const addButton = screen.queryByRole('button', { name: 'Add' })

        await userEvent.click(addButton)

        const addSecondButton = screen.queryByRole('button', { name: 'Add 2' })
        await userEvent.click(addSecondButton)

        const dismissButton = screen.queryAllByRole('button', { name: 'Dismiss' })

        expect(screen.queryByText('This is a message for toast id: mock-id')).toBeInTheDocument()
        expect(screen.queryByText('This is a second message for toast id: mock-id-2')).toBeInTheDocument()

        await userEvent.click(dismissButton[0])

        expect(screen.queryByText('This is a message for toast id: mock-id')).not.toBeInTheDocument()
        expect(screen.queryByText('This is a second message for toast id: mock-id-2')).toBeInTheDocument()
      })
    })
  })

  describe('when deleting all toasts by id', () => {
    test('removes the toast', async () => {
      render(<TestComponent />)

      const addButton = screen.queryByRole('button', { name: 'Add' })

      await userEvent.click(addButton)

      const deleteButton = screen.queryByRole('button', { name: 'Delete' })

      await userEvent.click(deleteButton)

      expect(screen.queryByText('This is a message for toast id: mock-id')).not.toBeInTheDocument()
    })
  })
})
