import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import {
  FaArrowLeft,
  FaBan,
  FaPause,
  FaPlay
} from 'react-icons/fa'
import Button from '../Button/Button'
import Checkbox from '../Checkbox/Checkbox'

import { ElectronApiContext } from '../../context/ElectronApiContext'
import { PAGES } from '../../constants/pages'

// TODO EDD-26 add styling to component
/**
 * @typedef {Object} FileDownloadsHeaderProps
 * @property {Boolean} checked State of the hide completed checkbox.
 * @property {Function} setCheckboxState A function to update the state of the  `hide completed` checkbox.
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Object} downloadsProgressReport An Object containing the progress of the download in view.

/**
 * Renders a `FileDownloadsHeader`
 * @param {FileDownloadsHeaderProps} props
 *
 * @example <caption>Renders an `FileDownloadsHeader` component.</caption>
 *
 * return (
 *   <FileDownloadsHeader
 *     checked={hideCompleted}
 *     setCheckboxState={setHideCompleted}
 *     setCurrentPage={setCurrentPage}
 *     downloadsProgressReport={downloadsProgressReport}
 *   />
 * )
 */

const FileDownloadsHeader = ({
  checked,
  downloadReport,
  setCheckboxState,
  setCurrentPage
}) => {
  const {
    cancelDownloadItem,
    pauseDownloadItem,
    resumeDownloadItem,
    startReportingDownloads
  } = useContext(ElectronApiContext)

  // Todo EDD-26 the destructure and parse progress for downloads
  const { downloadLocation, id: downloadId } = downloadReport

  const [allFilesPaused, setAllFilesPaused] = useState(false)

  const onCancelDownloadItem = () => {
    cancelDownloadItem({ downloadId })
  }

  const onPauseDownloadItem = () => {
    setAllFilesPaused(true)
    pauseDownloadItem({ downloadId })
  }

  const onResumeDownloadItem = () => {
    setAllFilesPaused(false)
    resumeDownloadItem({ downloadId })
  }

  return (
    <div>
      <h3>
        {downloadId}
      </h3>
      <Button
        Icon={FaArrowLeft}
        size="lg"
        onClick={
          () => {
            // We start interval to poll the state of the downloads
            startReportingDownloads()
            setCurrentPage(PAGES.downloads)
          }
        }
      >
        Back to View Downloads
      </Button>
      <Checkbox
        id="hideCompleted"
        label="Hide completed"
        onChange={
          () => {
            setCheckboxState(!checked)
          }
        }
        checked={checked}
      />
      {/* TODO EDD-26 todo this currently implementation of pause all does not allow us to leave the
      fileDownloads page and then navigate back in to `fileDownloads` to resume all */}
      {
        !allFilesPaused
          ? (
            <Button
              size="sm"
              Icon={FaPause}
              onClick={() => onPauseDownloadItem(downloadId)}
            >
              Pause All
            </Button>
          )
          : (
            <Button
              size="sm"
              Icon={FaPlay}
              onClick={() => onResumeDownloadItem(downloadId)}
            >
              Resume All
            </Button>
          )
      }

      <Button
        size="sm"
        Icon={FaBan}
        variant="danger"
        onClick={() => onCancelDownloadItem(downloadId)}
      >
        Cancel All
      </Button>
      <p>
        Downloading to
        {downloadLocation}
      </p>
      {/* Todo EDD-26 Add Pause all button */}
      {/* Todo EDD-26 Add Cancel all button */}
      {/* Todo EDD-26 We need to recalculate progress here because we are not polling the downloads anymore
      */}
    </div>
  )
}

// Todo `downloadReport` maybe should be required EDD-26
FileDownloadsHeader.defaultProps = {
  downloadReport: {}
}

FileDownloadsHeader.propTypes = {
  checked: PropTypes.bool.isRequired,
  // Todo EDD-26 this type need to be improved
  downloadReport: PropTypes.shape({
    id: PropTypes.string,
    downloadLocation: PropTypes.string
  }),

  setCurrentPage: PropTypes.func.isRequired,
  setCheckboxState: PropTypes.func.isRequired
}

export default FileDownloadsHeader
