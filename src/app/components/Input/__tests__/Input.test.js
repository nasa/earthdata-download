import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import Input from '../Input'

describe('Input component', () => {
  test('renders an Input', () => {
    const onChangeMock = jest.fn()
    const onBlurMock = jest.fn()
    const value = 'mock-value'

    render(
      <Input
        id="test-input"
        label="Test Input"
        type="text"
        onChange={onChangeMock}
        onBlur={onBlurMock}
        value={value}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Test Input' })).toBeInTheDocument()
  })

  describe('when changing the value', () => {
    test('fires the onChange callback with the correct value', async () => {
      const onChangeMock = jest.fn()
      const onBlurMock = jest.fn()
      const value = 'mock-value'

      render(
        <Input
          id="test-input"
          label="Test Input"
          type="text"
          onChange={onChangeMock}
          onBlur={onBlurMock}
          value={value}
        />
      )

      const input = await screen.findByRole('textbox', { name: 'Test Input' })

      await userEvent.type(input, '1')

      expect(onChangeMock).toHaveBeenCalledTimes(1)
      expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining(
        {
          target: expect.objectContaining({
            id: 'test-input'
          })
        }
      ))
    })
  })

  describe('when blurring out of the field', () => {
    test('fires the onBlur callback', async () => {
      const onChangeMock = jest.fn()
      const onBlurMock = jest.fn()
      const value = 'mock-value'

      render(
        <Input
          id="test-input"
          label="Test Input"
          type="text"
          onChange={onChangeMock}
          onBlur={onBlurMock}
          value={value}
        />
      )

      const input = await screen.findByRole('textbox', { name: 'Test Input' })

      await userEvent.click(input)
      await userEvent.click(document.body)

      expect(onBlurMock).toHaveBeenCalledTimes(1)
      expect(onBlurMock).toHaveBeenCalledWith(expect.objectContaining(
        {
          target: expect.objectContaining({
            id: 'test-input'
          })
        }
      ))
    })
  })
})
