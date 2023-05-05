import React from 'react'
import PropTypes from 'prop-types'

import { PAGES } from '../../constants/pages'

/**
 * Renders the `Download History` page
 * @param {Object} props
 * @param {Function} props.setCurrentPage Callback to update the current page
 */
const DownloadHistory = ({ setCurrentPage }) => (
  <div>
    <p>
      Your download history is empty.
    </p>
    <button
      onClick={() => setCurrentPage(PAGES.downloads)}
      type="button"
    >
      View Downloads
    </button>
  </div>
)

DownloadHistory.propTypes = {
  setCurrentPage: PropTypes.func.isRequired
}

export default DownloadHistory
