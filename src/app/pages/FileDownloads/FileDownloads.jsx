import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import { FaDownload } from 'react-icons/fa'

import { REPORT_INTERVAL } from '../../constants/reportInterval'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import FileDownloadsHeader from '../../components/FileDownloadsHeader/FileDownloadsHeader'
import ListPage from '../../components/ListPage/ListPage'
import addErrorToasts from '../../utils/addErrorToasts'
import useAppContext from '../../hooks/useAppContext'

/**
 * @typedef {Object} FileDownloadsProps
 * @property {String} downloadId The downloadId of the files.
 * @property {Function} setCurrentPage A function which sets the active page.
 * @property {Function} showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.

/**
 * Renders a FileDownloads
 * @param {FileDownloadsProps} props
 *
 * @example <caption>Render a FileDownloads page.</caption>
 *
 * return (
 *   <FileDownloads
 *     downloadId={downloadId}
 *     setCurrentPage={setCurrentPage}
 *   />
 * )
 */
const FileDownloads = ({
  downloadId,
  setCurrentPage,
  showMoreInfoDialog
}) => {
  const appContext = useAppContext()
  const {
    addToast,
    deleteAllToastsById
  } = appContext
  const {
    requestFilesProgress,
    retryErroredDownloadItem
  } = useContext(ElectronApiContext)

  const [hideCompleted, setHideCompleted] = useState(false)
  const [items, setItems] = useState([])
  const [windowState, setWindowState] = useState({})
  const [headerReport, setHeaderReport] = useState({})
  const [totalFiles, setTotalFiles] = useState(0)

  const listRef = useRef(null)

  const onSetHideCompleted = (value) => {
    setHideCompleted(value)
    listRef.current.scrollToItem(0)
  }

  const buildItems = (report) => {
    const {
      overscanStartIndex,
      overscanStopIndex
    } = windowState

    const {
      filesReport: newFilesReport
    } = report || {}

    const {
      files,
      totalFiles: reportTotalFiles
    } = newFilesReport

    // Build real items
    const realItems = files.map((file) => ({
      file,
      type: 'file'
    }))

    const preArrayLength = overscanStartIndex
    const postArrayLength = reportTotalFiles - overscanStopIndex + 1
    const preArray = preArrayLength > 0 ? Array.from({ length: preArrayLength }) : []
    const postArray = postArrayLength > 0 ? Array.from({ length: postArrayLength }) : []

    setItems([
      ...preArray,
      ...realItems,
      ...postArray
    ])

    setTotalFiles(reportTotalFiles)
  }

  useEffect(() => {
    const loadItems = async () => {
      const {
        overscanStartIndex = 0,
        // Default to 10 items
        overscanStopIndex = 10
      } = windowState

      const stopIndex = Math.max(10, overscanStopIndex + 1)
      const limit = stopIndex - overscanStartIndex
      const offset = overscanStartIndex

      const report = await requestFilesProgress({
        downloadId,
        limit,
        offset,
        hideCompleted
      })

      const {
        headerReport: newHeaderReport
      } = report || {}

      const { errors } = newHeaderReport

      buildItems(report)
      setHeaderReport(newHeaderReport)

      addErrorToasts({
        errors,
        addToast,
        deleteAllToastsById,
        retryErroredDownloadItem,
        showMoreInfoDialog
      })
    }

    loadItems()

    const interval = setInterval(() => {
      loadItems()
    }, REPORT_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [windowState, hideCompleted])

  return (
    <ListPage
      emptyMessage="No file downloads in progress"
      header={
        (
          <FileDownloadsHeader
            hideCompleted={hideCompleted}
            headerReport={headerReport}
            setHideCompleted={onSetHideCompleted}
            setCurrentPage={setCurrentPage}
            showMoreInfoDialog={showMoreInfoDialog}
          />
        )
      }
      hideCompleted={hideCompleted}
      Icon={FaDownload}
      items={items}
      listRef={listRef}
      totalItemCount={totalFiles}
      setWindowState={setWindowState}
    />
  )
}

FileDownloads.propTypes = {
  downloadId: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default FileDownloads
