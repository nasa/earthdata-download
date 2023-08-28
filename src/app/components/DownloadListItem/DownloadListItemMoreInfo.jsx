import React from 'react'
import PropTypes from 'prop-types'
import { FaInfoCircle } from 'react-icons/fa'

import * as styles from './DownloadListItemMoreInfo.module.scss'
import useAccessibleEvent from '../../hooks/useAccessibleEvent'
import downloadStates from '../../constants/downloadStates'

/**
 * @typedef {Object} DownloadListItemMoreInfoProps
 * @property {String} downloadId The ID of the DownloadItem.
 * @property {Number} numberErrors Number of errors in the download.
 * @property {String} state The state of the DownloadItem.
 * @property {Function} showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.
 */

/**
 * Renders a `DownloadListItemMoreInfo` component
 * @param {DownloadListItemMoreInfoProps} props
 *
 * @example <caption>Renders a `DownloadListItemMoreInfo` component</caption>
 * return (
 *   <DownloadListItemMoreInfo
 *     downloadId={downloadId}
 *     numberErrors={numberErrors}
 *     state={state}
 *     showMoreInfoDialog={showMoreInfoDialog}
 *   />
 * )
 */
const DownloadListItemMoreInfo = ({
  downloadId,
  numberErrors,
  state,
  showMoreInfoDialog
}) => {
  if (
    state !== downloadStates.error
    && state !== downloadStates.errorFetchingLinks
    && numberErrors === 0
  ) {
    return null
  }

  const accessibleEventProps = useAccessibleEvent((event) => {
    event.stopPropagation()
    showMoreInfoDialog({
      downloadId,
      numberErrors,
      state
    })
  })

  return (
    <div
      className={styles.statusDescription}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...accessibleEventProps}
    >
      <FaInfoCircle
        className={styles.statusDescriptionIcon}
      />
      {' '}
      More Info
    </div>
  )
}

DownloadListItemMoreInfo.propTypes = {
  downloadId: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  numberErrors: PropTypes.number.isRequired,
  showMoreInfoDialog: PropTypes.func.isRequired
}

export default DownloadListItemMoreInfo
