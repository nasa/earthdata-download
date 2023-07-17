import React from 'react'
import PropTypes from 'prop-types'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { FaEllipsisV } from 'react-icons/fa'
import * as styles from './Dropdown.module.scss'
import Button from '../Button/Button'
import Tooltip from '../Tooltip/Tooltip'

/**
 * @typedef {Object} DropdownProps
 * @property {Array} actionsList A 2-D array of objects detailing action attributes.
/**
 * Renders a Dropdown component
 * @param {DropdownProps} props
 *
 * @example <caption>Render a Dropdown menu.</caption>
 *
 * return (
 *  <Dropdown
 *    actionsList={actionsList}
 *  >
 *  </Dropdown>
 * )
 */
const Dropdown = ({
  actionsList
}) => {
  const dropdownOptions = []
  if (actionsList) {
    actionsList.forEach((actionGroup) => {
      let showSeparator = false
      actionGroup.forEach((action) => {
        showSeparator = showSeparator || action.isActive
        // Create dropdown item element for each action object
        dropdownOptions.push(
          action.isActive && (
            <RadixDropdown.Item
              key={action.label}
              className={styles.item}
              disabled={action.disabled}
              onSelect={action.callback}
            >
              {action.label}
            </RadixDropdown.Item>
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
    <RadixDropdown.Root modal="false">
      <Tooltip
        content="More Actions"
      >
        <RadixDropdown.Trigger asChild className={styles.trigger}>
          <Button
            data-testid="dropdown-trigger"
            className={styles.action}
            size="sm"
            Icon={FaEllipsisV}
            hideLabel
            tabIndex="0"
            tooltipDelayDuration={300}
            onClick={(event) => { event.stopPropagation() }}
          >
            More Actions
          </Button>
        </RadixDropdown.Trigger>
      </Tooltip>
      <RadixDropdown.Content
        className={styles.content}
        align="end"
        sideOffset={4}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.stopPropagation()}
        onClick={(event) => { event.stopPropagation() }}
      >
        {dropdownOptions}
      </RadixDropdown.Content>
    </RadixDropdown.Root>
  )
}

Dropdown.defaultProps = {
  actionsList: null
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
  })))
}

export default Dropdown
