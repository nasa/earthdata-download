import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Input from '../Input'

describe('Input component', () => {
  test('renders an Input', () => {
    const onChangeMock = jest.fn()
    const onBlur = jest.fn()
    const value = 'mock-value'
    const mockLabel = 'mockLabel'
    render(
      <Input
        type="number"
        onChange={onChangeMock}
        value={value}
        label={mockLabel}
        onBlur={onBlur}
      />
    )

    expect(screen.queryByText('mockLabel')).toBeInTheDocument()
  })
})
