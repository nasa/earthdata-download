import React from 'react'
import PropTypes from 'prop-types'

import useAccessibleEvent from '../../hooks/useAccessibleEvent'
import Button from '../Button/Button'

/**
 * Renders an action button for the DownloadItem component
 * @param {Object} params
 * @param {Function} params.callback Callback function for the button
 * @param {String} params.label Label for the button
 * @param {Object} params.buttonProps Additional props to be applied to the button
 */
const DownloadItemActionButton = ({
  callback,
  label,
  buttonProps
}) => {
  const accessibleEventProps = useAccessibleEvent((event) => {
    event.preventDefault()
    event.stopPropagation()

    callback()
  })

  return (
    <Button
      {...buttonProps}
      {...accessibleEventProps}
    >
      {label}
    </Button>
  )
}

DownloadItemActionButton.defaultProps = {
  callback: null,
  buttonProps: {}
}

DownloadItemActionButton.propTypes = {
  callback: PropTypes.func,
  label: PropTypes.string.isRequired,
  buttonProps: PropTypes.shape({})
}

export default DownloadItemActionButton
