import React from 'react'
import PropTypes from 'prop-types'

import FileListItem from '../FileListItem/FileListItem'
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
 *
 * @param {*} param0
 * @returns
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
    file,
    setCurrentPage,
    setSelectedDownloadId,
    showMoreInfoDialog,
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

  // If type is `download`
  return (
    <div style={style}>
      <DownloadListItem
        download={download}
        setCurrentPage={setCurrentPage}
        setSelectedDownloadId={setSelectedDownloadId}
        showMoreInfoDialog={showMoreInfoDialog}
      />
    </div>
  )
}

ListPageListItem.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      download: PropTypes.shape({}),
      file: PropTypes.shape({}),
      setCurrentPage: PropTypes.func,
      setSelectedDownloadId: PropTypes.func,
      showMoreInfoDialog: PropTypes.func,
      type: PropTypes.string
    })
  ).isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.shape({}).isRequired
}

export default ListPageListItem
