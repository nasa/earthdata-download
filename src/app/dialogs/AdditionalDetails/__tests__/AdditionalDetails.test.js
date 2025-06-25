import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import AdditionalDetails from '../AdditionalDetails'
import { ElectronApiContext } from '../../../context/ElectronApiContext'

const setup = (mockReport) => {
  const requestAddionalDetailsReport = jest.fn().mockResolvedValue(mockReport)

  const props = {
    activeAdditionalDetailsInfo: {
      downloadId: 'mock-download-id'
    }
  }

  render(
    <ElectronApiContext.Provider value={
      {
        requestAddionalDetailsReport
      }
    }
    >
      <AdditionalDetails
        {...props}
      />
    </ElectronApiContext.Provider>
  )

  return {
  }
}

describe('AdditionalDetails component', () => {
  describe('when there are duplicate download links', () => {
    test('displays the duplicate download links message', async () => {
      setup({
        duplicateCount: 3,
        invalidLinksCount: 0
      })

      expect(await screen.findByText(
        '3 files were a duplicate of another file in the download. Each file will be downloaded once, and the number of files shown does not include the duplicate files.'
      )).toBeInTheDocument()
    })
  })

  describe('when there are invalid download links', () => {
    test('displays the invalid download links message', async () => {
      setup({
        duplicateCount: 0,
        invalidLinksCount: 2
      })

      expect(await screen.findByText(
        '2 files did not have a valid "https" link and could not be downloaded. The number of files shown does not include invalid links.'
      )).toBeInTheDocument()
    })
  })
})
