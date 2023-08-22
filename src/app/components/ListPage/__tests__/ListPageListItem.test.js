import { render } from '@testing-library/react'
import React from 'react'
import ListPageListItem from '../ListPageListItem'
import FileListItem from '../../FileListItem/FileListItem'
import DownloadListItem from '../../DownloadListItem/DownloadListItem'

jest.mock('../../DownloadListItem/DownloadListItem')
jest.mock('../../FileListItem/FileListItem')

const setup = (overrideProps = {}) => {
  const props = {
    data: [],
    index: 0,
    style: {},
    ...overrideProps
  }

  render(
    <ListPageListItem {...props} />
  )
}

describe('ListPageListItem', () => {
  describe('when the ListItem is a download', () => {
    test('renders a DownloadListItem', () => {
      const setCurrentPage = jest.fn()
      const setSelectedDownloadId = jest.fn()
      const showMoreInfoDialog = jest.fn()

      setup({
        data: [{
          type: 'download',
          download: { mock: 'download' },
          setCurrentPage,
          setSelectedDownloadId,
          showMoreInfoDialog
        }]
      })

      expect(DownloadListItem).toHaveBeenCalledTimes(1)
      expect(DownloadListItem).toHaveBeenCalledWith({
        download: {
          mock: 'download'
        },
        setCurrentPage,
        setSelectedDownloadId,
        showMoreInfoDialog
      }, {})

      expect(FileListItem).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the ListItem is a file', () => {
    test('renders a FileListItem', () => {
      setup({
        data: [{
          type: 'file',
          file: { mock: 'file' }
        }]
      })

      expect(DownloadListItem).toHaveBeenCalledTimes(0)

      expect(FileListItem).toHaveBeenCalledTimes(1)
      expect(FileListItem).toHaveBeenCalledWith({
        file: {
          mock: 'file'
        }
      }, {})
    })
  })

  describe('when the item is not found in the data', () => {
    test('renders a skeleton', () => {
      setup({
        data: [{
          type: 'file',
          file: { mock: 'file' }
        }],
        index: 2
      })

      expect(DownloadListItem).toHaveBeenCalledTimes(0)

      expect(FileListItem).toHaveBeenCalledTimes(0)
    })
  })
})
