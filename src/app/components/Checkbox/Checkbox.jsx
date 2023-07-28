import React from 'react'
import PropTypes from 'prop-types'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { FaCheck } from 'react-icons/fa'

import * as styles from './Checkbox.module.scss'

/**
 * @typedef {Object} CheckboxProps
 * @property {Boolean} [checked] An optional boolean flag to control the state of the checkbox.
 * @property {Boolean} [defaultChecked] An optional boolean flag which sets the defaultChecked attribute on the checkbox.
 * @property {String} id A string to be used as the `id` and `htmlFor` attributes on the checkbox and label.
 * @property {String} label A string to be used as the label for the checkbox.
 * @property {String} [labelNote] An optional string that adds additional context to the text provided for the label.
 * @property {Function} onChange A function fired when the checkbox is interacted with.
 */

/**
 * Renders a `Checkbox` component.
 * @param {CheckboxProps} props
 *
 * @example <caption>Render a checkbox.</caption>
 *
 * const [checked, setChecked] = useState(true)
 *
 * return (
 *   <Checkbox
 *      checked={checked}
 *      defaultChecked={true}
 *      id="exampleCheckbox"
 *      label="I understand this is an example."
 *      labelNote="This is a little more context about the example."
 *      onChange={(newState) => setChecked(newState)}
 *   >
 *      Click Me
 *   </Checkbox>
 * )
 */
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
        {
          labelNote && (
            <span className={styles.labelNote}>
              {labelNote}
            </span>
          )
        }
      </label>
    </div>
  </form>
)

Checkbox.defaultProps = {
  checked: null,
  defaultChecked: false,
  labelNote: null
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelNote: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

export default Checkbox
