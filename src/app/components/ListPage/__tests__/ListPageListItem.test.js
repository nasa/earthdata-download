import { render } from '@testing-library/react'
import React from 'react'
import ListPageListItem from '../ListPageListItem'
import FileListItem from '../../FileListItem/FileListItem'
import DownloadListItem from '../../DownloadListItem/DownloadListItem'
import DownloadHistoryListItem from '../../DownloadHistoryListItem/DownloadHistoryListItem'

jest.mock('../../DownloadListItem/DownloadListItem')
jest.mock('../../DownloadHistoryListItem/DownloadHistoryListItem')
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
      const downloadLinks = {}

      setup({
        data: [{
          type: 'download',
          download: { mock: 'download' },
          downloadLinks: {},
          setCurrentPage,
          setSelectedDownloadId
        }]
      })

      expect(DownloadListItem).toHaveBeenCalledTimes(1)
      expect(DownloadListItem).toHaveBeenCalledWith({
        download: {
          mock: 'download'
        },
        downloadLinks,
        setCurrentPage,
        setSelectedDownloadId
      }, {})

      expect(FileListItem).toHaveBeenCalledTimes(0)
    })
  })

  describe('when the ListItem is an inactive download', () => {
    test('renders a DownloadHistoryListItem', () => {
      const showMoreInfoDialog = jest.fn()

      setup({
        data: [{
          type: 'downloadHistory',
          download: { mock: 'download' },
          showMoreInfoDialog
        }]
      })

      expect(DownloadHistoryListItem).toHaveBeenCalledTimes(1)
      expect(DownloadHistoryListItem).toHaveBeenCalledWith({
        download: {
          mock: 'download'
        },
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
