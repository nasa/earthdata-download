import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadListItemFileProgress from '../DownloadListItemFileProgress'
import downloadStates from '../../../constants/downloadStates'

const setup = (overrideProps = {}) => {
  const props = {
    finishedFiles: 5,
    loadingMoreFiles: false,
    shouldShowProgress: true,
    shouldShowTime: true,
    state: downloadStates.active,
    totalFiles: 10,
    totalTime: 234,
    ...overrideProps
  }

  return render(
    <DownloadListItemFileProgress {...props} />
  )
}

describe('DownloadListItemFileProgress component', () => {
  test('returns the percent', () => {
    setup()

    expect(screen.getByText('5 of 10 files done in 3 minutes, 54 seconds')).toHaveClass('statusInformation')
  })

  describe('when loadingMoreFiles is true', () => {
    test('shows determining file count', () => {
      setup({
        loadingMoreFiles: true
      })

      expect(screen.getByText('5 files done in 3 minutes, 54 seconds (determining file count)')).toHaveClass('statusInformation')
    })
  })

  describe('when shouldShowTime is false', () => {
    test('does not show timing', () => {
      setup({
        shouldShowTime: false
      })

      expect(screen.getByText('5 of 10 files')).toHaveClass('statusInformation')
    })
  })

  describe('when shouldShowProgress is false', () => {
    test('does not show timing', () => {
      setup({
        shouldShowProgress: false
      })

      expect(screen.getByText('done in 3 minutes, 54 seconds')).toHaveClass('statusInformation')
    })
  })

  describe('when the state is waitingForAuth', () => {
    test('does not show timing', () => {
      setup({
        state: downloadStates.waitingForAuth,
        shouldShowTime: false,
        shouldShowProgress: false
      })

      expect(screen.getByText('Waiting for log in with Earthdata Login')).toHaveClass('statusInformation')
    })
  })

  describe('when the state is waitingForEula', () => {
    test('does not show timing', () => {
      setup({
        state: downloadStates.waitingForEula,
        shouldShowTime: false,
        shouldShowProgress: false
      })

      expect(screen.getByText('Accept license agreement to continue')).toHaveClass('statusInformation')
    })
  })

  describe('when the state is pending', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.pending
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the state is error', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.error
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the state is errorFetchingLinks', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.errorFetchingLinks
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
