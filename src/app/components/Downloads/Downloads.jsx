import React, { useEffect, useState } from 'react'
import InitializeDownload from './InitializeDownload'

// ipcRenderer is setup in preload.js and functions are exposed within `window.electronAPI`
// ?? Should we only call this in App.jsx and pass it down as a prop?
const { electronAPI } = window

/**
 * Renders the `Downloads` page
 */
const Downloads = () => {
  const [downloadId, setDownloadId] = useState(null)
  const [downloadLocation, setDownloadLocation] = useState(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)

  // When a new downloadLocation has been selected from the main process, update the state
  const onSetDownloadLocation = (event, info) => {
    const { downloadLocation: newDownloadLocation } = info
    setDownloadLocation(newDownloadLocation)
  }

  // When a download needs to be initialized (show the starting modal, or start the download)
  const onInitializeDownload = (event, info) => {
    const {
      downloadId: newDownloadId,
      downloadLocation: newDownloadLocation,
      shouldUseDefaultLocation
    } = info

    setDownloadId(newDownloadId)
    setDownloadLocation(newDownloadLocation)
    setUseDefaultLocation(shouldUseDefaultLocation)
  }

  // Setup event listeners
  useEffect(() => {
    electronAPI.setDownloadLocation(true, onSetDownloadLocation)
    electronAPI.initializeDownload(true, onInitializeDownload)

    return () => {
      electronAPI.setDownloadLocation(false, onSetDownloadLocation)
      electronAPI.initializeDownload(false, onInitializeDownload)
    }
  }, [])

  return (
    <>
      {
        !useDefaultLocation && downloadId && (
          <InitializeDownload
            downloadId={downloadId}
            downloadLocation={downloadLocation}
            useDefaultLocation={useDefaultLocation}
            setDownloadId={setDownloadId}
          />
        )
      }
      {
        useDefaultLocation && downloadId && (
          <>
            <p>Download will use the default download location and begin downloading</p>
            <a href="https://search.earthdata.nasa.gov/" target="_blank" rel="noreferrer">Find data in Earthdata Search</a>
          </>
        )
      }
      {
        !downloadId && (
          <>
            <p>List of downloads goes here</p>
            <a href="https://search.earthdata.nasa.gov/" target="_blank" rel="noreferrer">Find data in Earthdata Search</a>
          </>
        )
      }
    </>
  )
}

export default Downloads
