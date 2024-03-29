import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import * as RadixToast from '@radix-ui/react-toast'

import Toast from '../Toast/Toast'

import * as styles from './ToastList.module.scss'

/**
 * @typedef {Object} ToastListProps
 * @property {String} [className] An optional css class name.
 * @property {Function} dismissToast A callback function used to dismiss the toast.
 * @property {Array} toasts A list of objects to configure the toasts.
*/

/**
 * Renders a `ToastList` component
 * @param {ToastListProps} props
 *
 * @example <caption>Render a ToastList component.</caption>
 *
 * return (
 *  <ToastList toasts=[{ id: 'toast-id', message: 'I am a toast' }] />
 */
const ToastList = ({
  className,
  dismissToast,
  toasts
}) => {
  const listClassNames = classNames([
    styles.list,
    className
  ])

  return (toasts && toasts.length > 0) && (
    <RadixToast.Provider>
      {
        toasts.map(({
          actions,
          id,
          message,
          showCloseButton,
          title,
          variant
        }) => (
          <Toast
            key={id}
            id={id}
            dismissToast={dismissToast}
            message={message}
            actions={actions}
            title={title}
            showCloseButton={showCloseButton}
            variant={variant}
          />
        ))
      }
      <RadixToast.Viewport className={listClassNames} />
    </RadixToast.Provider>
  )
}

ToastList.defaultProps = {
  className: ''
}

ToastList.propTypes = {
  className: PropTypes.string,
  dismissToast: PropTypes.func.isRequired,
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      actions: PropTypes.arrayOf(
        PropTypes.shape({})
      ),
      showCloseButton: PropTypes.bool,
      title: PropTypes.string,
      variant: PropTypes.string
    })
  ).isRequired
}

export default ToastList
