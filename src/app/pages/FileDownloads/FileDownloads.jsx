import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import PropTypes from 'prop-types'
import { FaDownload } from 'react-icons/fa'

import { PAGES } from '../../constants/pages'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import FileDownloadsHeader from '../../components/FileDownloadsHeader/FileDownloadsHeader'
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
  downloadId,
  setCurrentPage
}) => {
  const {
    initializeDownload,
    requestFilesProgress
  } = useContext(ElectronApiContext)

  const [hideCompleted, setHideCompleted] = useState(false)
  const [items, setItems] = useState([])
  const [windowState, setWindowState] = useState({})
  const [headerReport, setHeaderReport] = useState({})
  const [totalFiles, setTotalFiles] = useState(null)

  const listRef = useRef(null)

  const onInitializeDownload = () => {
    // If there is a new download return to the downloads page
    setCurrentPage(PAGES.downloads)
  }

  const onSetHideCompleted = (value) => {
    setHideCompleted(value)
    listRef.current.scrollToItem(0)
  }

  useEffect(() => {
    initializeDownload(true, onInitializeDownload)

    return () => {
      initializeDownload(false, onInitializeDownload)
    }
  }, [])

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
      totalFiles: newTotalFiles
    } = newFilesReport

    // Build real items
    const realItems = files.map((file) => ({
      file,
      type: 'file'
    }))

    setItems([
      ...Array.from({ length: overscanStartIndex }),
      ...realItems,
      ...Array.from({ length: newTotalFiles - overscanStopIndex - 1 })
    ])

    setTotalFiles(newTotalFiles)
  }

  useEffect(() => {
    const loadItems = async () => {
      const {
        overscanStartIndex = 0,
        // Default to 10 items
        overscanStopIndex = 10
      } = windowState

      const stopIndex = totalFiles || overscanStopIndex
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

      buildItems(report)
      setHeaderReport(newHeaderReport)
    }

    loadItems()

    const interval = setInterval(() => {
      loadItems()
    }, 1000)

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
          />
        )
      }
      hideCompleted={hideCompleted}
      Icon={FaDownload}
      items={items}
      listRef={listRef}
      setWindowState={setWindowState}
    />
  )
}

FileDownloads.propTypes = {
  downloadId: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired
}

export default FileDownloads
