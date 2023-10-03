import React, {
  useContext,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import {
  FaDownload,
  FaHistory,
  FaSearch
} from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'
import { PAGES } from '../../constants/pages'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import Button from '../../components/Button/Button'
import DownloadHeader from '../../components/DownloadHeader/DownloadHeader'

import parseDownloadReport from '../../utils/parseDownloadReport'

import * as styles from './Downloads.module.scss'
import addErrorToasts from '../../utils/addErrorToasts'
import useAppContext from '../../hooks/useAppContext'
import ListPage from '../../components/ListPage/ListPage'

/**
 * @typedef {Object} DownloadsProps
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Function} setHasActiveDownload A function to set whether a download is active.
 * @property {Function} setSelectedDownloadId A function to set the selectedDownloadId.
 * @property {Function} showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.

/**
 * Renders a `Downloads` page.
 * @param {DownloadsProps} props
 *
 * @example <caption>Render a Downloads page.</caption>
 *
 * return (
 *   <Downloads
 *     setCurrentPage={setCurrentPage}
 *     setHasActiveDownload={setHasActiveDownload}
 *     setSelectedDownloadId={setSelectedDownloadId}
 *     showMoreInfoDialog={showMoreInfoDialog}
 *   />
 * )
 */
const Downloads = ({
  setCurrentPage,
  setHasActiveDownload,
  setSelectedDownloadId,
  showMoreInfoDialog
}) => {
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    requestDownloadsProgress,
    retryErroredDownloadItem
  } = useContext(ElectronApiContext)

  const [items, setItems] = useState([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [totalDownloads, setTotalDownloads] = useState(0)
  const [totalCompletedFiles, setTotalCompletedFiles] = useState(0)
  const [
    derivedStateFromDownloads,
    setDerivedStateFromDownloads
  ] = useState(downloadStates.completed)

  const listRef = useRef()

  const buildItems = (windowState, report) => {
    const {
      overscanStartIndex,
      overscanStopIndex
    } = windowState

    const {
      downloadsReport,
      errors,
      totalDownloads: reportTotalDownloads
    } = report

    // Build real items
    const realItems = downloadsReport.map((download) => {
      const { downloadId } = download

      return {
        download: {
          ...download,
          numberErrors: errors[downloadId]?.numberErrors
        },
        setCurrentPage,
        setSelectedDownloadId,
        showMoreInfoDialog,
        type: 'download'
      }
    })

    const preArrayLength = overscanStartIndex
    const postArrayLength = reportTotalDownloads - overscanStopIndex + 1
    const preArray = preArrayLength > 0 ? Array.from({ length: preArrayLength }) : []
    const postArray = postArrayLength > 0 ? Array.from({ length: postArrayLength }) : []

    return [
      ...preArray,
      ...realItems,
      ...postArray
    ]
  }

  const fetchReport = async (windowState) => {
    const {
      overscanStartIndex = 0,
      // Default to 10 items
      overscanStopIndex = 10
    } = windowState

    // React window doesn't handle lists smaller than the window very well, and sets the overscanStopIndex lower than the list of items. Never set the limit to less than 10
    const stopIndex = Math.max(10, overscanStopIndex + 1)
    const limit = stopIndex - overscanStartIndex
    const offset = overscanStartIndex

    const report = await requestDownloadsProgress({
      active: true,
      limit,
      offset
    })

    const {
      downloadsReport,
      totalDownloads: reportTotalDownloads,
      totalFiles: reportTotalFiles,
      totalCompletedFiles: reportTotalCompletedFiles,
      errors
    } = report

    const parsedReport = parseDownloadReport(downloadsReport)

    const {
      derivedStateFromDownloads: reportDerivedStateFromDownloads,
      hasActiveDownload: reportHasActiveDownload
    } = parsedReport

    setHasActiveDownload(reportHasActiveDownload)
    setTotalFiles(reportTotalFiles)
    setTotalCompletedFiles(reportTotalCompletedFiles)
    setDerivedStateFromDownloads(reportDerivedStateFromDownloads)

    setItems(buildItems(windowState, report))

    setTotalDownloads(reportTotalDownloads)

    addErrorToasts({
      errors,
      addToast,
      deleteAllToastsById,
      retryErroredDownloadItem,
      showMoreInfoDialog
    })
  }

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

            <Button
              className={styles.button}
              size="lg"
              Icon={FaHistory}
              onClick={() => setCurrentPage(PAGES.downloadHistory)}
            >
              View Download History
            </Button>
          </>
        )
      }
      emptyMessage="No downloads in progress"
      fetchReport={fetchReport}
      header={
        !!items.length && (
          <DownloadHeader
            state={derivedStateFromDownloads}
            totalCompletedFiles={totalCompletedFiles}
            totalFiles={totalFiles}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )
      }
      Icon={FaDownload}
      items={items}
      itemSize={97}
      listRef={listRef}
      totalItemCount={totalDownloads}
    />
  )
}

Downloads.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  setHasActiveDownload: PropTypes.func.isRequired,
  setSelectedDownloadId: PropTypes.func.isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default Downloads
