import React from 'react'
import PropTypes from 'prop-types'
import * as RadixTooltip from '@radix-ui/react-tooltip'

import * as styles from './Tooltip.module.scss'

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children A React node to be wrapped in the tooltip trigger.
 * @property {React.ReactNode} content A React node to be used as the content for the tooltip.
 * @property {React.ReactNode} [additionalContent]  A React node to be used as the additional content for the tooltip.
*/

/**
 * Renders a `Button` component.
 * @param {ButtonProps} props
 *
 * @example <caption>Render the button as a `button` element.</caption>
 *
 * return (
 *   <Tooltip
 *      content="I show on hover"
 *      additionalContent="Me too!"
 *   >
 *      Hover me
 *   </Tooltip>
 * )
 */
const Tooltip = ({
  children,
  content,
  additionalContent
}) => (
  <RadixTooltip.Provider delayDuration={300}>
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={styles.tooltipContent}
          sideOffset={5}
        >
          <div>
            <span className={styles.content}>{content}</span>
            <span className={styles.additionalContent}>{additionalContent}</span>
          </div>
          <RadixTooltip.Arrow className={styles.tooltipArrow} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
)

Tooltip.defaultProps = {
  additionalContent: null
}

Tooltip.propTypes = {
  additionalContent: PropTypes.node,
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired
}

export default Tooltip
