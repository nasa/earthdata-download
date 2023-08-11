import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import {
  FaBan,
  FaClipboard,
  FaFolderOpen,
  FaInfoCircle
} from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import DownloadItem from '../DownloadItem/DownloadItem'
import FileListItemPercent from './FileListItemPercent'
import FileListItemTimeRemaining from './FileListItemTimeRemaining'
import FileListItemSizeProgress from './FileListItemSizeProgress'

/* {
  "id": 424,
  "downloadId": "MODIS_A-JPL-L2P-v2019.0_2019.0-20230810_175626",
  "filename": "STScI-01GK2KMYS6HADS6ND8NRHG53RP.png",
  "state": "COMPLETED",
  "url": "https://stsci-opo.org/STScI-01GK2KMYS6HADS6ND8NRHG53RP.png",
  "percent": 100,
  "createdAt": 1691690191124,
  "timeStart": 1691690280763,
  "timeEnd": 1691690286388,
  "errors": null,
  "receivedBytes": 61587289,
  "totalBytes": 61587289,
  "remainingTime": 0
}
*/
const FileListItem = ({
  file
}) => {
  const {
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload
  } = useContext(ElectronApiContext)

  const {
    downloadId,
    filename,
    state,
    percent,
    receivedBytes,
    totalBytes,
    remainingTime
  } = file

  const shouldShowCancel = [
    downloadStates.pending,
    downloadStates.paused,
    downloadStates.active,
    downloadStates.error,
    downloadStates.interrupted
  ].includes(state)

  // Disable copy filepath if the download has not completed.
  const shouldDisableCopyFilePath = state !== downloadStates.completed

  // Disable open file if the download has not completed.
  const shouldDisableOpenFile = state !== downloadStates.completed

  const shouldDisableFileRestart = state === downloadStates.starting
    && state === downloadStates.pending

  const isComplete = state === downloadStates.completed

  // Show the time if the file is not pending or completed.
  const shouldShowTime = remainingTime > 0
    && state === downloadStates.active

  const shouldShowBytes = receivedBytes !== 0
    && state !== downloadStates.pending
    && state !== downloadStates.starting
    && state !== downloadStates.cancelled

  const actionsList = [
    [
      {
        label: 'Cancel File',
        isActive: shouldShowCancel,
        isPrimary: !isComplete,
        variant: 'danger',
        callback: () => cancelDownloadItem({
          downloadId,
          filename
        }),
        icon: FaBan
      }
    ],
    [
      {
        label: 'Open File',
        isActive: !shouldDisableOpenFile,
        isPrimary: isComplete,
        callback: () => openDownloadFolder({
          downloadId,
          filename
        }),
        icon: FaFolderOpen
      },
      {
        label: 'Copy File Path',
        isActive: !shouldDisableCopyFilePath,
        isPrimary: isComplete,
        callback: () => copyDownloadPath({
          downloadId,
          filename
        }),
        icon: FaClipboard
      },
      {
        label: 'Restart File',
        isActive: !shouldDisableFileRestart,
        isPrimary: false,
        callback: () => restartDownload({
          downloadId,
          filename
        }),
        icon: FaInfoCircle
      }
    ]
  ]

  return (
    <DownloadItem
      actionsList={actionsList}
      downloadId={downloadId}
      filename={filename}
      itemName={filename}
      percent={percent}
      state={state}
      status={
        {
          primary: (
            <FileListItemPercent
              percent={percent}
            />
          ),
          secondary: (
            <FileListItemTimeRemaining
              percent={percent}
              remainingTime={remainingTime}
              shouldShowTime={shouldShowTime}
              state={state}
            />
          ),
          tertiary: (
            <FileListItemSizeProgress
              receivedBytes={receivedBytes}
              shouldShowBytes={shouldShowBytes}
              totalBytes={totalBytes}
            />
          )
        }
      }
    />
  )
}

FileListItem.propTypes = {
  file: PropTypes.shape({
    downloadId: PropTypes.string,
    filename: PropTypes.string,
    state: PropTypes.string,
    percent: PropTypes.number,
    receivedBytes: PropTypes.number,
    totalBytes: PropTypes.number,
    remainingTime: PropTypes.number
  }).isRequired
}

export default FileListItem
