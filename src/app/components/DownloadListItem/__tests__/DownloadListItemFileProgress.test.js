import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import DownloadListItemFileProgress from '../DownloadListItemFileProgress'
import downloadStates from '../../../constants/downloadStates'

const fileIconLabel = 'A document with a downward facing arrow'

const setup = (overrideProps = {}) => {
  const props = {
    finishedFiles: 5,
    loadingMoreFiles: false,
    shouldShowProgress: true,
    shouldShowTime: true,
    state: downloadStates.active,
    totalFiles: 10,
    totalTime: 234000,
    ...overrideProps
  }

  return render(
    <DownloadListItemFileProgress {...props} />
  )
}

describe('DownloadListItemFileProgress component', () => {
  test('returns the percent', () => {
    setup()

    expect(screen.getByText('5 of 10 done in 3m, 54s')).toHaveClass('statusInformation')
  })

  describe('when loadingMoreFiles is true', () => {
    test('shows determining file count', () => {
      setup({
        loadingMoreFiles: true
      })

      expect(screen.getByText('5 done in 3m, 54s (determining file count)')).toHaveClass('statusInformation')
    })

    test('shows the file icon', () => {
      setup({
        loadingMoreFiles: true
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).toBeInTheDocument()
    })
  })

  describe('when shouldShowTime is false', () => {
    test('does not show timing', () => {
      setup({
        shouldShowTime: false
      })

      expect(screen.getByText('5 of 10')).toHaveClass('statusInformation')
    })

    test('shows the file icon', () => {
      setup({
        loadingMoreFiles: true
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).toBeInTheDocument()
    })
  })

  describe('when shouldShowProgress is false', () => {
    test('does not show timing', () => {
      setup({
        shouldShowProgress: false
      })

      expect(screen.getByText('done in 3m, 54s')).toHaveClass('statusInformation')
    })
  })

  describe('when the state is waitingForAuth', () => {
    test('does not show timing', () => {
      setup({
        state: downloadStates.waitingForAuth,
        shouldShowTime: false,
        shouldShowProgress: false
      })

      expect(screen.getByText('Waiting for log in').parentElement).toHaveClass('statusInformation')
    })

    test('does not show the file icon', () => {
      setup({
        state: downloadStates.waitingForAuth,
        shouldShowTime: false,
        shouldShowProgress: false
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).not.toBeInTheDocument()
    })
  })

  describe('when the state is waitingForEula', () => {
    test('does not show timing', () => {
      setup({
        state: downloadStates.waitingForEula,
        shouldShowTime: false,
        shouldShowProgress: false
      })

      expect(screen.getByText('Accept license agreement')).toHaveClass('statusInformation')
    })

    test('does not show the file icon', () => {
      setup({
        state: downloadStates.waitingForEula,
        shouldShowTime: false,
        shouldShowProgress: false
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).not.toBeInTheDocument()
    })
  })

  describe('when the state is pending', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.pending
      })

      expect(container).toBeEmptyDOMElement()
    })

    test('does not show the file icon', () => {
      setup({
        state: downloadStates.pending
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).not.toBeInTheDocument()
    })
  })

  describe('when the state is error', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.error
      })

      expect(container).toBeEmptyDOMElement()
    })

    test('does not show the file icon', () => {
      setup({
        state: downloadStates.error
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).not.toBeInTheDocument()
    })
  })

  describe('when the state is errorFetchingLinks', () => {
    test('returns null', () => {
      const { container } = setup({
        state: downloadStates.errorFetchingLinks
      })

      expect(container).toBeEmptyDOMElement()
    })

    test('does not show the file icon', () => {
      setup({
        state: downloadStates.errorFetchingLinks
      })

      const fileIcon = screen.queryByLabelText(fileIconLabel)

      expect(fileIcon).not.toBeInTheDocument()
    })
  })
})
