import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaClipboard,
  FaFolderOpen,
  FaInfoCircle
} from 'react-icons/fa'

import DownloadItem from '../DownloadItem/DownloadItem'

import DownloadHistoryListItemFileProgress from './DownloadHistoryListItemFileProgress'
import { ElectronApiContext } from '../../context/ElectronApiContext'
import useAppContext from '../../hooks/useAppContext'
import DownloadHistoryListItemState from './DownloadHistoryListItemState'
import DownloadHistoryListItemTimestamp from './DownloadHistoryListItemTimestamp'

/**
 * @typedef {Object} DownloadListItemProps
 * @property {Object} download State of the download item.
 * @property {Function} showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.
 */

/**
 * Renders a `DownloadListItem` component
 * @param {DownloadListItemProps} props
 *
 * @example <caption>Renders a `DownloadListItem` component</caption>
 * return (
 *   <DownloadListItem
 *     download={download}
 *     showMoreInfoDialog={showMoreInfoDialog}
 *   />
 * )
 */
const DownloadHistoryListItem = ({
  download,
  showMoreInfoDialog
}) => {
  const appContext = useAppContext()
  const {
    deleteAllToastsById
  } = appContext
  const {
    copyDownloadPath,
    openDownloadFolder,
    restartDownload
  } = useContext(ElectronApiContext)

  const {
    downloadId,
    numberErrors = 0,
    progress,
    state,
    timeStart
  } = download

  const {
    percent = 0,
    finishedFiles,
    totalTime
  } = progress

  const actionsList = [
    [
      {
        label: 'Open Folder',
        isActive: true,
        isPrimary: true,
        callback: () => openDownloadFolder({ downloadId }),
        icon: FaFolderOpen
      },
      {
        label: 'Copy Folder Path',
        isActive: true,
        isPrimary: true,
        callback: () => copyDownloadPath({ downloadId }),
        icon: FaClipboard
      }
    ],
    [
      {
        label: 'Restart Download',
        isActive: true,
        isPrimary: false,
        callback: () => {
          deleteAllToastsById(downloadId)
          restartDownload({ downloadId })
        },
        icon: FaInfoCircle
      }
    ]
  ]

  return (
    <DownloadItem
      actionsList={actionsList}
      downloadId={downloadId}
      showMoreInfoDialog={showMoreInfoDialog}
      shouldBeClickable={false}
      state={state}
      itemName={downloadId}
      percent={percent}
      primaryStatus={
        (
          <DownloadHistoryListItemState
            state={state}
            percent={percent}
            hasErrors={numberErrors > 0}
          />
        )
      }
      secondaryStatus={
        (
          <DownloadHistoryListItemFileProgress
            finishedFiles={finishedFiles}
            state={state}
            totalTime={totalTime}
          />
        )
      }
      subStatus={
        (
          <DownloadHistoryListItemTimestamp
            time={timeStart}
          />
        )
      }
    />
  )
}

DownloadHistoryListItem.propTypes = {
  download: PropTypes.shape({
    downloadId: PropTypes.string,
    numberErrors: PropTypes.number,
    loadingMoreFiles: PropTypes.bool,
    progress: PropTypes.shape({
      percent: PropTypes.number,
      finishedFiles: PropTypes.number,
      totalFiles: PropTypes.number,
      totalTime: PropTypes.number
    }),
    state: PropTypes.string,
    timeStart: PropTypes.number
  }).isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default DownloadHistoryListItem
