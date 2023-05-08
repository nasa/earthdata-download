import React, { useState } from 'react'
import PropTypes from 'prop-types'

// ipcRenderer is setup in preload.js and functions are exposed within `window.electronAPI`
const { electronAPI } = window

const InitializeDownload = ({
  downloadId,
  downloadLocation,
  useDefaultLocation,
  setDownloadId
}) => {
  const [makeDefaultDownloadLocation, setMakeDefaultDownloadLocation] = useState(true)

  // Send a message to the main process to show the open dialog
  const handleChooseDownloadButton = () => {
    electronAPI.chooseDownloadLocation()
  }

  // Send a message to the main process to begin the download
  const handleBeginDownload = () => {
    electronAPI.beginDownload({
      downloadId,
      downloadLocation,
      makeDefaultDownloadLocation
    })

    setDownloadId(null)
  }

  return (
    <div>
      <div>
        <p>Initialize Download Modal</p>
        <p>
          Download ID:
          {' '}
          {downloadId}
        </p>
      </div>
      {
        useDefaultLocation ? (
          <span>Download will use the default download location and begin downloading</span>
        ) : (
          <>
            <div className="card">
              <span>
                Location:
                {' '}
                {downloadLocation}
              </span>
              <button
                onClick={handleChooseDownloadButton}
                type="button"
              >
                Choose another location
              </button>
            </div>
            <div className="card">
              <label>
                <input
                  checked={makeDefaultDownloadLocation}
                  onChange={() => setMakeDefaultDownloadLocation(!makeDefaultDownloadLocation)}
                  type="checkbox"
                />
                Make this my default download location
              </label>
            </div>
            <div className="card">
              <button
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleBeginDownload}
                type="button"
              >
                Begin download
              </button>
            </div>
          </>
        )
      }
    </div>
  )
}

InitializeDownload.propTypes = {
  downloadId: PropTypes.string.isRequired,
  downloadLocation: PropTypes.string.isRequired,
  useDefaultLocation: PropTypes.bool.isRequired,
  setDownloadId: PropTypes.func.isRequired
}

export default InitializeDownload
