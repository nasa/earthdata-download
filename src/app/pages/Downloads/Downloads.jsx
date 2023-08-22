import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import { FaDownload, FaSearch } from 'react-icons/fa'

import downloadStates from '../../constants/downloadStates'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import Button from '../../components/Button/Button'
import ListPage from '../../components/ListPage/ListPage'
import DownloadHeader from '../../components/DownloadHeader/DownloadHeader'

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
  setHasActiveDownload,
  setSelectedDownloadId,
  showMoreInfoDialog
}) => {
  const {
    requestDownloadsProgress
  } = useContext(ElectronApiContext)

  const listRef = useRef()

  const [items, setItems] = useState([])
  const [windowState, setWindowState] = useState({})
  const [allDownloadsPaused, setAllDownloadsPaused] = useState(false)
  const [allDownloadsCompleted, setAllDownloadsCompleted] = useState(false)
  const [totalFiles, setTotalFiles] = useState(0)
  const [totalDownloads, setTotalDownloads] = useState(null)
  const [totalCompletedFiles, setTotalCompletedFiles] = useState(0)
  const [
    derivedStateFromDownloads,
    setDerivedStateFromDownloads
  ] = useState(downloadStates.completed)

  const buildItems = (report, newWindowState) => {
    const {
      downloadsReport,
      totalDownloads: newTotalDownloads
    } = report

    const {
      overscanStartIndex,
      overscanStopIndex
    } = newWindowState

    // Build real items
    const realItems = downloadsReport.map((download) => ({
      download,
      setCurrentPage,
      setSelectedDownloadId,
      showMoreInfoDialog,
      type: 'download'
    }))

    setItems([
      ...Array.from({ length: overscanStartIndex }),
      ...realItems,
      ...Array.from({ length: newTotalDownloads - overscanStopIndex - 1 })
    ])

    setTotalDownloads(newTotalDownloads)
  }

  useEffect(() => {
    const loadItems = async () => {
      const {
        overscanStartIndex = 0,
        // Default to 10 items
        overscanStopIndex = 10
      } = windowState

      const stopIndex = totalDownloads || overscanStopIndex
      const limit = stopIndex - overscanStartIndex
      const offset = overscanStartIndex

      const report = await requestDownloadsProgress({
        limit,
        offset
      })

      const { downloadsReport } = report

      const parsedReport = parseDownloadReport(downloadsReport)

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

      buildItems(report, windowState)
    }

    loadItems()

    const interval = setInterval(() => {
      loadItems()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [windowState])

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
        !!items.length && (
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
      items={items}
      listRef={listRef}
      setWindowState={setWindowState}
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
