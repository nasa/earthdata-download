import React from 'react'
import PropTypes from 'prop-types'
import * as RadixLabel from '@radix-ui/react-label'
import * as styles from './Input.module.scss'

const Input = ({
  type,
  placeholder,
  onChange,
  onBlur,
  value,
  label
}) => (
  <div className={styles.div}>
    <RadixLabel.Root className={styles.labelRoot}>
      {label}
    </RadixLabel.Root>
    <input
      data-testid="input-test-id"
      className={styles.input}
      value={value}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
    />
  </div>
)

Input.defaultProps = {
  placeholder: null,
  label: null
}

Input.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string
}

export default Input
