import React from 'react'
import PropTypes from 'prop-types'
import { FaDownload, FaHistory, FaSearch } from 'react-icons/fa'

import Button from '../Button/Button'
import ListPage from '../ListPage/ListPage'

import { PAGES } from '../../constants/pages'

import * as styles from './DownloadHistory.module.scss'

/**
 * Renders the `Download History` page
 * @param {Object} props
 * @param {Function} props.setCurrentPage Callback to update the current page
 */
const DownloadHistory = ({ setCurrentPage }) => (
  <ListPage
    actions={(
      <>
        <Button
          className={styles.button}
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
          Icon={FaDownload}
          size="lg"
          onClick={() => setCurrentPage(PAGES.downloads)}
        >
          View Downloads
        </Button>
      </>
    )}
    emptyMessage="Download history is empty"
    Icon={FaHistory}
    items={[]}
  />
)

DownloadHistory.propTypes = {
  setCurrentPage: PropTypes.func.isRequired
}

export default DownloadHistory
