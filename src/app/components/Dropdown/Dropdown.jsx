import React from 'react'
import PropTypes from 'prop-types'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { FaEllipsisV } from 'react-icons/fa'
import * as styles from './Dropdown.module.scss'
import Button from '../Button/Button'
import Tooltip from '../Tooltip/Tooltip'

/**
 * @typedef {Object} DropdownProps
 * @property {Array} moreActions An array of arrays of objects detailing dropdown display options.
/**
 * Renders a Dropdown component
 * @param {DropdownProps} props
 *
 * @example <caption>Render a Dropdown menu.</caption>
 *
 * return (
 *  <Dropdown
 *    moreActions={moreActions}
 *  >
 *  </Dropdown>
 * )
 */
const Dropdown = ({
  moreActions
}) => {
  const dropdownOptions = []
  if (moreActions) {
    moreActions.forEach((actionGroup) => {
      let showSeparator = false
      actionGroup.forEach((action) => {
        showSeparator = showSeparator || action.visible
        // Create dropdown item element for each action object
        dropdownOptions.push(
          action.visible && (
          <RadixDropdown.Item
            key={action.label}
            className={styles.item}
            disabled={action.disabled}
            onSelect={action.onSelect}
          >
            {
              action.label
            }
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
      <Tooltip content="More Actions">
        <RadixDropdown.Trigger asChild className={styles.trigger}>
          <Button
            data-testid="dropdown-trigger"
            className={styles.action}
            size="sm"
            Icon={FaEllipsisV}
            hideLabel
            tabIndex="0"
          >
            More Actions
          </Button>
        </RadixDropdown.Trigger>
      </Tooltip>
      <RadixDropdown.Content
        className={styles.content}
        align="end"
        sideOffset={4}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.stopPropagation()}
      >
        {
          dropdownOptions
        }
      </RadixDropdown.Content>
    </RadixDropdown.Root>
  )
}

Dropdown.defaultProps = {
  moreActions: null
}

Dropdown.propTypes = {
  moreActions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired
  })))
}

export default Dropdown
