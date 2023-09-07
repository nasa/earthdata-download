import React, {
  useContext,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import { FaDownload } from 'react-icons/fa'

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
  const [headerReport, setHeaderReport] = useState({})
  const [totalFiles, setTotalFiles] = useState(0)

  const listRef = useRef(null)

  const onSetHideCompleted = (value) => {
    setHideCompleted(value)
    listRef.current.scrollToItem(0)
  }

  const buildItems = (windowState, report) => {
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
      headerReport: newHeaderReport,
      filesReport: newFilesReport
    } = report || {}

    const {
      totalFiles: reportTotalFiles
    } = newFilesReport

    const { errors } = newHeaderReport

    setItems(buildItems(windowState, report))
    setTotalFiles(reportTotalFiles)
    setHeaderReport(newHeaderReport)

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
      emptyMessage="No file downloads in progress"
      fetchReport={fetchReport}
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
      itemSize={97}
      listRef={listRef}
      totalItemCount={totalFiles}
    />
  )
}

FileDownloads.propTypes = {
  downloadId: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default FileDownloads
