import React from 'react'
import PropTypes from 'prop-types'
import * as RadixTooltip from '@radix-ui/react-tooltip'

import * as styles from './Tooltip.module.scss'

/**
 * @typedef {Object} TooltipProps
 * @property {React.ReactNode} children A React node to be wrapped in the tooltip trigger.
 * @property {React.ReactNode} content A React node to be used as the content for the tooltip.
 * @property {React.ReactNode} [additionalContent]  A React node to be used as the additional content for the tooltip.
*/

/**
 * Renders a `Tooltip` component.
 * @param {TooltipProps} props
 *
 * @example <caption>Render the tooltip as a `tooltip` element.</caption>
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
  additionalContent,
  children,
  content,
  open
}) => {
  const conditionalRootProps = {}

  if (open) conditionalRootProps.open = true

  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root {...conditionalRootProps}>
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
              {
                additionalContent && (
                  <span className={styles.additionalContent}>{additionalContent}</span>
                )
              }
            </div>
            <RadixTooltip.Arrow className={styles.tooltipArrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}

Tooltip.defaultProps = {
  additionalContent: null,
  open: undefined
}

Tooltip.propTypes = {
  additionalContent: PropTypes.node,
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  open: PropTypes.bool
}

export default Tooltip
