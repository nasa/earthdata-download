import React, { useState } from 'react'
import PropTypes from 'prop-types'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { FaEllipsisV } from 'react-icons/fa'

import Button from '../Button/Button'
import Tooltip from '../Tooltip/Tooltip'
import DropdownItem from './DropdownItem'

import useAccessibleEvent from '../../hooks/useAccessibleEvent'

import * as styles from './Dropdown.module.scss'

/**
 * @typedef {Object} DropdownProps
 * @property {Array} actionsList A 2-D array of objects detailing action attributes.
 * @property {Function} onOpenChange Callback for the Radix Dropdown when the open state changes.
/**
 * Renders a Dropdown component
 * @param {DropdownProps} props
 *
 * @example <caption>Render a Dropdown menu.</caption>
 *
 * return (
 *  <Dropdown
 *    actionsList={actionsList}
 *    onOpenChange={onOpenChange}
 *  >
 *  </Dropdown>
 * )
 */
const Dropdown = ({
  actionsList,
  onOpenChange
}) => {
  const accessibleEventProps = useAccessibleEvent((event) => event.stopPropagation())

  const [didClickToClose, setDidClickToClose] = useState(false)

  const dropdownOptions = []
  if (actionsList) {
    actionsList.forEach((actionGroup) => {
      let showSeparator = false
      actionGroup.forEach((action) => {
        showSeparator = showSeparator || action.isActive
        // Create dropdown item element for each action object
        dropdownOptions.push(
          action.isActive && (
            <DropdownItem
              key={action.label}
              callback={action.callback}
              disabled={action.disabled}
              label={action.label}
              setDidClickToClose={setDidClickToClose}
            />
          )
        )
      })

      // Create separator element between each group of actions
      dropdownOptions.push(
        showSeparator && <RadixDropdown.Separator key={actionGroup} className={styles.separator} />
      )
    })
  }

  // Remove last separator element to account for fence post problem
  dropdownOptions.pop()

  return (
    <RadixDropdown.Root onOpenChange={onOpenChange}>
      <Tooltip
        content="More Actions"
      >
        <RadixDropdown.Trigger
          asChild
          className={styles.trigger}
        >
          <Button
            className={styles.action}
            Icon={FaEllipsisV}
            hideLabel
            tabIndex="0"
            tooltipDelayDuration={300}
            {...accessibleEventProps}
          >
            More Actions
          </Button>
        </RadixDropdown.Trigger>
      </Tooltip>

      <RadixDropdown.Portal>
        <RadixDropdown.Content
          className={styles.content}
          align="end"
          sideOffset={4}
          onCloseAutoFocus={
            (event) => {
              // If the user clicked outside the portal to close, call preventDefault to lose focus on the trigger button
              if (didClickToClose) event.preventDefault()

              // Reset the didClickToClose
              setDidClickToClose(false)
            }
          }
          onInteractOutside={() => setDidClickToClose(true)}
        >
          {dropdownOptions}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  )
}

Dropdown.defaultProps = {
  actionsList: null,
  onOpenChange: null
}

Dropdown.propTypes = {
  actionsList: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    isPrimary: PropTypes.bool.isRequired,
    variant: PropTypes.string,
    callback: PropTypes.func.isRequired,
    icon: PropTypes.func,
    disabled: PropTypes.bool
  }))),
  onOpenChange: PropTypes.func
}

export default Dropdown
