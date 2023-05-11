import React from 'react'
import PropTypes from 'prop-types'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { FaCheck } from 'react-icons/fa'

import * as styles from './Checkbox.module.scss'

const Checkbox = ({
  checked,
  defaultChecked,
  id,
  label,
  labelNote,
  onChange
}) => (
  <form>
    <div className={styles.wrapper}>
      <RadixCheckbox.Root
        className={styles.checkboxRoot}
        defaultChecked={defaultChecked}
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      >
        <RadixCheckbox.Indicator className={styles.checkboxIndicator}>
          <FaCheck className={styles.checkIcon} />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label className={styles.label} htmlFor={id}>
        {label}
        <span className={styles.labelNote}>
          {labelNote}
        </span>
      </label>
    </div>
  </form>
)

Checkbox.defaultProps = {
  checked: false,
  defaultChecked: false
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelNote: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default Checkbox
