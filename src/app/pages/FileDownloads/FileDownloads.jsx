import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'
import { FaDownload } from 'react-icons/fa'

import { PAGES } from '../../constants/pages'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import FileDownloadsHeader from '../../components/FileDownloadsHeader/FileDownloadsHeader'
import FileListItem from '../../components/FileListItem/FileListItem'
import ListPage from '../../components/ListPage/ListPage'

/**
 * @typedef {Object} FileDownloadsProps
 * @property {function} setCurrentPage A function which sets the active page.

/**
 * Renders a FileDownloads
 * @param {FileDownloadsProps} props
 *
 * @example <caption>Render a FileDownloads page.</caption>
 *
 * return (
 *   <FileDownloads
 *     setCurrentPage={setCurrentPage}
 *   />
 * )
 */
const FileDownloads = ({
  setCurrentPage
}) => {
  const {
    initializeDownload,
    reportFilesProgress,
    startReportingDownloads,
    cancelDownloadItem,
    copyDownloadPath,
    openDownloadFolder,
    restartDownload
  } = useContext(ElectronApiContext)

  const [hideCompleted, setHideCompleted] = useState(false)

  const onCancelDownloadItem = (downloadId, filename) => {
    cancelDownloadItem({
      downloadId,
      filename
    })
  }

  const onOpenDownloadFolder = (downloadId, filename) => {
    openDownloadFolder({
      downloadId,
      filename
    })
  }

  const onCopyDownloadPath = (downloadId, filename) => {
    copyDownloadPath({
      downloadId,
      filename
    })
  }

  const onRestartDownload = (downloadId, filename) => {
    restartDownload({
      downloadId,
      filename
    })
  }

  const [downloadReport, setDownloadReport] = useState({})
  const [filesReport, setFilesReport] = useState([])

  const onReportFilesProgressReport = (event, info) => {
    const {
      downloadReport: newDownloadReport,
      filesReport: newFilesReport
    } = info

    setFilesReport(newFilesReport)
    setDownloadReport(newDownloadReport)
  }

  const onInitializeDownload = () => {
    startReportingDownloads()
    // If there is a new download return to the downloads page
    setCurrentPage(PAGES.downloads)
  }

  useEffect(() => {
    reportFilesProgress(true, onReportFilesProgressReport)
    initializeDownload(true, onInitializeDownload)

    return () => {
      reportFilesProgress(false, onReportFilesProgressReport)
      initializeDownload(false, onInitializeDownload)
    }
  }, [])

  return (
    <ListPage
      emptyMessage="No file downloads in progress"
      header={
        (
          <FileDownloadsHeader
            hideCompleted={hideCompleted}
            downloadReport={downloadReport}
            setHideCompleted={setHideCompleted}
            setCurrentPage={setCurrentPage}
          />
        )
      }
      Icon={FaDownload}
      items={
        filesReport.map((file) => (
          <FileListItem
            key={file.filename}
            onCancelDownloadItem={onCancelDownloadItem}
            onOpenDownloadFolder={onOpenDownloadFolder}
            onCopyDownloadPath={onCopyDownloadPath}
            onRestartDownload={onRestartDownload}
            file={file}
            hideCompleted={hideCompleted}
          />
        ))
      }
    />
  )
}

FileDownloads.propTypes = {
  setCurrentPage: PropTypes.func.isRequired
}

export default FileDownloads
