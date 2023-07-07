import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Input from '../Input'

describe('Input component', () => {
  test('renders an Input', () => {
    const onChangeMock = jest.fn()
    const onBlur = jest.fn()
    const value = 'mock-value'
    render(
      <Input
        id="test-input"
        label="Test Input"
        type="text"
        onChange={onChangeMock}
        value={value}
        onBlur={onBlur}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Test Input' })).toBeInTheDocument()
  })
})
