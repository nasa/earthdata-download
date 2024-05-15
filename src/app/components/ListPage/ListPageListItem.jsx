import React from 'react'
import PropTypes from 'prop-types'

import FileListItem from '../FileListItem/FileListItem'
import DownloadHistoryListItem from '../DownloadHistoryListItem/DownloadHistoryListItem'
import DownloadListItem from '../DownloadListItem/DownloadListItem'
import Skeleton from '../Skeleton/Skeleton'

const downloadItemSkeleton = [
  {
    shape: 'rectangle',
    left: 8,
    top: 14,
    height: 22.8,
    width: 400,
    radius: 2
  },
  {
    shape: 'rectangle',
    left: 8,
    top: 48,
    height: 22.8,
    width: 250,
    radius: 2
  }
]

/**
 * Renders a `react-window` list item
 * @param {Object} params
 * @param {Object} params.data Data for all list items
 * @param {Number} params.index Index within data to find the item data
 * @param {Object} params.style Style to apply to each list item
 */
const ListPageListItem = ({
  data,
  index,
  style
}) => {
  const item = data[index]

  if (!item || Object.keys(item).length === 0) {
    return (
      <div style={style}>
        <Skeleton
          shapes={downloadItemSkeleton}
          containerStyle={
            {
              height: '84.8px'
            }
          }
        />
      </div>
    )
  }

  const {
    download,
    downloadLinks,
    file,
    setCurrentPage,
    setSelectedDownloadId,
    showMoreInfoDialog,
    showWaitingForEulaDialog,
    showWaitingForLoginDialog,
    type
  } = item

  if (type === 'file') {
    return (
      <div style={style}>
        <FileListItem
          file={file}
        />
      </div>
    )
  }

  if (type === 'downloadHistory') {
    return (
      <div style={style}>
        <DownloadHistoryListItem
          download={download}
          showMoreInfoDialog={showMoreInfoDialog}
        />
      </div>
    )
  }

  // If type is `download`
  return (
    <div style={style}>
      <DownloadListItem
        download={download}
        downloadLinks={downloadLinks}
        setCurrentPage={setCurrentPage}
        setSelectedDownloadId={setSelectedDownloadId}
        showMoreInfoDialog={showMoreInfoDialog}
        showWaitingForEulaDialog={showWaitingForEulaDialog}
        showWaitingForLoginDialog={showWaitingForLoginDialog}
      />
    </div>
  )
}

ListPageListItem.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      download: PropTypes.shape({}),
      downloadLinks: PropTypes.objectOf(
        PropTypes.arrayOf(PropTypes.string)
      ),
      file: PropTypes.shape({}),
      setCurrentPage: PropTypes.func,
      setSelectedDownloadId: PropTypes.func,
      showMoreInfoDialog: PropTypes.func,
      showWaitingForEulaDialog: PropTypes.func,
      showWaitingForLoginDialog: PropTypes.func,
      type: PropTypes.string
    })
  ).isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.shape({}).isRequired
}

export default ListPageListItem
