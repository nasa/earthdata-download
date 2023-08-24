import React from 'react'
import PropTypes from 'prop-types'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import useAccessibleEvent from '../../hooks/useAccessibleEvent'

import * as styles from './DropdownItem.module.scss'

/**
 * @typedef {Object} DropdownItemProps
 * @property {Function} callback Callback function when selecting the item.
 * @property {Boolean} disabled Is item disabled.
 * @property {String} label Label for the item.
 * @property {Function} setDidClickToClose Callback to set `didClickToClose` to true if a click was used when selecting the item.
/**
 * Renders a DropdownItem component
 * @param {DropdownItemProps} props
 *
 * @example <caption>Render a DropdownItem menu.</caption>
 *
 * return (
 *  <DropdownItem
 *    callback={callback}
 *    disabled={disabled}
 *    label={label}
 *    setDidClickToClose={setDidClickToClose}
 *  >
 *  </DropdownItem>
 * )
 */
const DropdownItem = ({
  callback,
  disabled,
  label,
  setDidClickToClose
}) => {
  const accessibleEventProps = useAccessibleEvent((event) => {
    setDidClickToClose(event.type === 'click')
    event.stopPropagation()

    callback()
  })

  return (
    <RadixDropdown.Item
      className={styles.item}
      disabled={disabled}
      {...accessibleEventProps}
    >
      {label}
    </RadixDropdown.Item>
  )
}

DropdownItem.defaultProps = {
  callback: null,
  disabled: false,
  setDidClickToClose: null
}

DropdownItem.propTypes = {
  callback: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  setDidClickToClose: PropTypes.func
}

export default DropdownItem
