import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import * as styles from './Alert.module.scss'

/**
 * @typedef {Object} AlertProps
 * @property {String} [className] An optional css class name.
 */

/**
 * Renders a `Alert` component.
 * @param {AlertProps} props
 *
 * @example <caption>Render an `Alert`.</caption>
 * return (
 *   <Alert
 *      className="alert-example"
 *      variant="warning"
 *   >
 *      This is a warning Alert
 *   </Alert>
 * )
 */
const Alert = ({
  className,
  children,
  variant
}) => {
  const alertClassNames = classNames([
    styles.alert,
    {
      [styles.isWarning]: variant === 'warning'
    },
    className
  ])

  return (
    <div className={alertClassNames}>
      {children}
    </div>
  )
}

Alert.defaultProps = {
  className: null,
  variant: null
}

Alert.propTypes = {
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  variant: PropTypes.string
}

export default Alert
