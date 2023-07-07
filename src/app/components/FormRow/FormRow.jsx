import React from 'react'
import PropTypes from 'prop-types'
import * as RadixLabel from '@radix-ui/react-label'
import * as styles from './FormRow.module.scss'

/**
 * @typedef {Object} FormRowProps
 * @property {ReactNode} children The children of the form row
 * @property {String} description An optional description value for the input field
 * @property {String} label The text for the label of the input field

/**
 * Renders a `FormRow` component
 * @param {FormRowProps} props
 *
 * @example <caption>Renders an `FormRow` component.</caption>
 *
 * return (
 *   <FormRow
 *     label="Input Label"
 *     description="This is an form row."
 *   >
 *     <Input ... />
 *   </FormRow />
 * )
 */
const FormRow = ({
  children,
  description,
  label
}) => (
  <div className={styles.wrapper}>
    <RadixLabel.Root className={styles.label}>
      {label}
    </RadixLabel.Root>
    {
      description && (
        <p className={styles.description}>
          {description}
        </p>
      )
    }
    {children}
  </div>
)

FormRow.defaultProps = {
  description: null,
  label: null
}

FormRow.propTypes = {
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  label: PropTypes.string
}

export default FormRow
