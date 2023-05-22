import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import Checkbox from '../Checkbox'

describe('Checkbox component', () => {
  test('renders a checkbox', () => {
    render(
      <Checkbox
        id="test-checkbox-id"
        label="Test Checkbox"
        onChange={() => {}}
      />
    )

    expect(screen.queryByText('Test Checkbox')).toBeInTheDocument()
  })

  describe('when a label note is defined', () => {
    test('renders the label note', () => {
      render(
        <Checkbox
          id="test-checkbox-id"
          label="Test Checkbox"
          labelNote="Test Label Note"
          onChange={() => {}}
        />
      )

      expect(screen.queryByText('Test Label Note')).toBeInTheDocument()
    })
  })

  describe('when checked is not defined', () => {
    describe('when the checkbox is clicked', () => {
      test('fires the onChange with the expected arguments', async () => {
        const onChangeMock = jest.fn()

        render(
          <Checkbox
            id="test-checkbox-id"
            label="Test Checkbox"
            onChange={onChangeMock}
          />
        )

        const checkbox = screen.queryByText('Test Checkbox')

        await userEvent.click(checkbox)

        expect(onChangeMock).toHaveBeenCalledTimes(1)
        expect(onChangeMock).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('when checked is false', () => {
    describe('when the checkbox is clicked', () => {
      test('fires the onChange with the expected arguments', async () => {
        const onChangeMock = jest.fn()

        render(
          <Checkbox
            id="test-checkbox-id"
            label="Test Checkbox"
            onChange={onChangeMock}
          />
        )

        const checkbox = screen.queryByText('Test Checkbox')

        await userEvent.click(checkbox)

        expect(onChangeMock).toHaveBeenCalledTimes(1)
        expect(onChangeMock).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('when checked is true', () => {
    describe('when the checkbox is clicked', () => {
      test('fires the onChange with the expected arguments', async () => {
        const onChangeMock = jest.fn()

        render(
          <Checkbox
            id="test-checkbox-id"
            label="Test Checkbox"
            checked
            onChange={onChangeMock}
          />
        )

        const checkbox = screen.queryByText('Test Checkbox')

        await userEvent.click(checkbox)

        expect(onChangeMock).toHaveBeenCalledTimes(1)
        expect(onChangeMock).toHaveBeenCalledWith(false)
      })
    })
  })
})
