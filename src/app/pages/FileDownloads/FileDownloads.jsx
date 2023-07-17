import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'

import FileDownloadsHeader from '../../components/FileDownloadsHeader/FileDownloadsHeader'
import FileDownloadsList from '../../components/FileDownloadsList/FileDownloadsList'
import { PAGES } from '../../constants/pages'

import { ElectronApiContext } from '../../context/ElectronApiContext'

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
    startReportingDownloads
  } = useContext(ElectronApiContext)

  const [fileDownloadsProgressReport, setFileDownloadsProgressReport] = useState([])

  // Todo EDD-26 this is state var controlling the download report
  const [downloadReport, setDownloadReport] = useState({})

  const [hideCompleted, setHideCompleted] = useState(false)

  const onReportFilesProgressReport = (event, info) => {
    // eslint-disable-next-line no-shadow
    const { fileDownloadsProgressReport, downloadReport } = info

    // Update fileDownloads report.
    setFileDownloadsProgressReport(fileDownloadsProgressReport)

    // Update download report to send to the `fileDownloadsHeader`.
    setDownloadReport(downloadReport)
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
    <>
      {/* TODO expand on this FileDownloadsHeader component in EDD-26.
       */}
      <FileDownloadsHeader
        checked={hideCompleted}
        downloadReport={downloadReport}
        setCheckboxState={setHideCompleted}
        setCurrentPage={setCurrentPage}
      />
      <FileDownloadsList
        fileDownloadsProgressReport={fileDownloadsProgressReport}
        hideCompleted={hideCompleted}
      />
    </>
  )
}

FileDownloads.defaultProps = {}

FileDownloads.propTypes = {
  setCurrentPage: PropTypes.func.isRequired
}

export default FileDownloads
