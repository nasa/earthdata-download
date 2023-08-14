import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'
import { FaDownload, FaSearch } from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import Button from '../../components/Button/Button'
import ListPage from '../../components/ListPage/ListPage'
import DownloadHeader from '../../components/DownloadHeader/DownloadHeader'
import DownloadListItem from '../../components/DownloadListItem/DownloadListItem'

import parseDownloadReport from '../../utils/parseDownloadReport'

import * as styles from './Downloads.module.scss'

/**
 * @typedef {Object} DownloadsProps
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Function} showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.
 * @property {Function} setHasActiveDownload A function to set whether a download is active.

/**
 * Renders a `Downloads` page.
 * @param {DownloadsProps} props
 *
 * @example <caption>Render a Downloads page.</caption>
 *
 * return (
 *   <Downloads
 *     setCurrentPage={setCurrentPage}
 *     showMoreInfoDialog={showMoreInfoDialog}
 *     setHasActiveDownload={setHasActiveDownload}
 *   />
 * )
 */
const Downloads = ({
  setCurrentPage,
  showMoreInfoDialog,
  setHasActiveDownload
}) => {
  const {
    reportDownloadsProgress
  } = useContext(ElectronApiContext)

  const [downloadsReport, setDownloadsReport] = useState([])
  const [allDownloadsPaused, setAllDownloadsPaused] = useState(false)
  const [allDownloadsCompleted, setAllDownloadsCompleted] = useState(false)
  const [totalFiles, setTotalFiles] = useState(0)
  const [totalCompletedFiles, setTotalCompletedFiles] = useState(0)
  const [
    derivedStateFromDownloads,
    setDerivedStateFromDownloads
  ] = useState(downloadStates.completed)

  const onReportDownloadsProgress = (event, info) => {
    const { progressReport } = info

    setDownloadsReport(progressReport)

    const parsedReport = parseDownloadReport(progressReport)

    const {
      allDownloadsCompleted: reportAllDownloadsCompleted,
      allDownloadsPaused: reportAllDownloadsPaused,
      derivedStateFromDownloads: reportDerivedStateFromDownloads,
      hasActiveDownload: reportHasActiveDownload,
      totalCompletedFiles: reportTotalCompletedFiles,
      totalFiles: reportTotalFiles
    } = parsedReport

    setAllDownloadsPaused(reportAllDownloadsPaused)
    setAllDownloadsCompleted(reportAllDownloadsCompleted)
    setHasActiveDownload(reportHasActiveDownload)
    setTotalFiles(reportTotalFiles)
    setTotalCompletedFiles(reportTotalCompletedFiles)
    setDerivedStateFromDownloads(reportDerivedStateFromDownloads)
  }

  // Setup event listeners
  useEffect(() => {
    reportDownloadsProgress(true, onReportDownloadsProgress)

    return () => {
      reportDownloadsProgress(false, onReportDownloadsProgress)
    }
  }, [])

  return (
    <ListPage
      actions={
        (
          <>
            <Button
              className={styles.emptyActionButton}
              size="lg"
              Icon={FaSearch}
              href="https://search.earthdata.nasa.gov/"
              target="_blank"
              rel="noreferrer"
            >
              Find data in Earthdata Search
            </Button>
            {/* Hiding nav buttons until EDD-18 */}
            {/* <Button
              className={styles.button}
              size="lg"
              Icon={FaHistory}
              onClick={() => setCurrentPage(PAGES.downloadHistory)}
            >
              View Download History
            </Button> */}
          </>
        )
      }
      emptyMessage="No downloads in progress"
      header={
        !!downloadsReport.length && (
          <DownloadHeader
            allDownloadsCompleted={allDownloadsCompleted}
            allDownloadsPaused={allDownloadsPaused}
            state={derivedStateFromDownloads}
            totalCompletedFiles={totalCompletedFiles}
            totalFiles={totalFiles}
          />
        )
      }
      Icon={FaDownload}
      items={
        downloadsReport.map((download) => (
          <DownloadListItem
            key={download.downloadId}
            download={download}
            setCurrentPage={setCurrentPage}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        ))
      }
    />
  )
}

Downloads.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  setHasActiveDownload: PropTypes.func.isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default Downloads
