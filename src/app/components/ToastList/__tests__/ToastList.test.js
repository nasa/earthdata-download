import React from 'react'
import { render, screen } from '@testing-library/react'

import Toast from '../../Toast/Toast'
import ToastList from '../ToastList'

jest.mock('../../Toast/Toast', () => jest.fn(
  () => <mock-Toast>Mock Toast</mock-Toast>
))

describe('ToastList', () => {
  describe('when no toasts are provided', () => {
    test('does not render any toasts', () => {
      render(<ToastList toasts={[]} dismissToast={() => {}} />)

      expect(screen.queryAllByText('Mock Toast').length).toBe(0)
    })
  })

  describe('when a toast are provided', () => {
    test('renders a toast', () => {
      const toasts = [
        {
          id: 'mock-id',
          message: 'mock message',
          actions: [{
            id: 'mock id'
          }],
          title: 'mock title',
          variant: 'mock variant'
        }
      ]
      render(<ToastList toasts={toasts} dismissToast={() => {}} />)

      expect(screen.queryAllByText('Mock Toast').length).toBe(1)
      expect(Toast).toHaveBeenCalledTimes(1)
      expect(Toast).toHaveBeenCalledWith(expect.objectContaining({
        id: 'mock-id'
      }), {})
    })
  })

  describe('when a multiple toasts provided', () => {
    test('renders a toast', () => {
      const toasts = [
        {
          id: 'mock-id',
          message: 'mock message',
          actions: [{
            id: 'mock id'
          }],
          title: 'mock title',
          variant: 'mock variant'
        },
        {
          id: 'mock-id-2',
          message: 'mock message',
          actions: [{
            id: 'mock id'
          }],
          title: 'mock title',
          variant: 'mock variant'
        }
      ]

      render(<ToastList toasts={toasts} dismissToast={() => {}} />)

      expect(screen.queryAllByText('Mock Toast').length).toBe(2)
    })
  })
})
