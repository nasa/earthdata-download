import React from 'react'
import PropTypes from 'prop-types'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { FaEllipsisV } from 'react-icons/fa'
import * as styles from './DownloadDropdown.module.scss'
import Button from '../Button/Button'
import Tooltip from '../Tooltip/Tooltip'
import downloadStates from '../../constants/downloadStates'

/**
 * @typedef {Object} DownloadDropdownProps
 * @property {Function} onPauseDownload A function which pauses a DownloadItem.
 * @property {Function} onResumeDownload A function which resumes a DownloadItem.
 * @property {Function} onCancelDownload A function which cancels a DownloadItem.
 * @property {Function} onOpenDownloadFolder A function which opens the file(s) download folder.
 * @property {String} state The state of a DownloadItem.
 * @property {String} finishedFiles The number of downloaded files in a DownloadItem.
 * @property {Array} children An array of dropdown option objects.
/**
 * Renders a DownloadDropdown
 * @param {DownloadDropdownProps} props
 *
 * @example <caption>Render a DownloadDropdown menu.</caption>
 *
 * return (
 *  <DownloadDropdown
 *    onPauseDownload={onPauseDownload}
 *    onResumeDownload={onResumeDownload}
 *    onCancelDownload={onCancelDownload}
 *    onOpenDownloadFolder={onOpenDownloadFolder}
 *    state={state}
 *    finishedFiles={finishedFiles}
 *  >
 *    {
 *      children
 *    }
 *  </DownloadDropdown>
 * )
 */
const DownloadDropdown = ({
  onPauseDownload,
  onResumeDownload,
  onCancelDownload,
  onOpenDownloadFolder,
  state,
  finishedFiles,
  children
}) => {
  const shouldShowPause = [
    downloadStates.active
  ].includes(state)
  const shouldShowResume = [
    downloadStates.paused,
    downloadStates.interrupted
  ].includes(state)
  const shouldShowCancel = [
    downloadStates.paused,
    downloadStates.active,
    downloadStates.error,
    downloadStates.interrupted
  ].includes(state)
  const shouldShowOpenFolder = finishedFiles > 0

  const moreActions = []
  if (children) {
    children.forEach((actionGroup) => {
      actionGroup.forEach((action) => {
        // Create dropdown item element for each action object
        moreActions.push(
          <RadixDropdown.Item key={action.label} className={styles.item} onSelect={action.onSelect}>
            {
              action.label
            }
          </RadixDropdown.Item>
        )
      })
      // Create separator element between each group of actions
      moreActions.push(<RadixDropdown.Separator key={actionGroup} className={styles.separator} />)
    })
  }

  // Remove last separator element to account for fence post problem
  moreActions.pop()

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
          shouldShowPause && (
            <RadixDropdown.Item
              className={styles.item}
              data-testid="dropdown-pause"
              onSelect={onPauseDownload}
            >
              Pause Download
            </RadixDropdown.Item>
          )
        }
        {
          shouldShowResume && (
            <RadixDropdown.Item
              className={styles.item}
              data-testid="dropdown-resume"
              onSelect={onResumeDownload}
            >
              Resume Download
            </RadixDropdown.Item>
          )
        }
        {
          shouldShowCancel && (
            <RadixDropdown.Item
              className={styles.item}
              onSelect={onCancelDownload}
              data-testid="dropdown-cancel"
            >
              Cancel Download
            </RadixDropdown.Item>
          )
        }
        {
          (shouldShowPause && shouldShowCancel) && (
            <RadixDropdown.Separator className={styles.separator} />
          )
        }
        {
          shouldShowOpenFolder && (
            <RadixDropdown.Item
              className={styles.item}
              onSelect={onOpenDownloadFolder}
              data-testid="dropdown-open-folder"
            >
              Open Folder
            </RadixDropdown.Item>
          )
        }
        {
          moreActions
        }
      </RadixDropdown.Content>
    </RadixDropdown.Root>
  )
}

DownloadDropdown.defaultProps = {
  children: null
}

DownloadDropdown.propTypes = {
  onPauseDownload: PropTypes.func.isRequired,
  onResumeDownload: PropTypes.func.isRequired,
  onCancelDownload: PropTypes.func.isRequired,
  onOpenDownloadFolder: PropTypes.func.isRequired,
  state: PropTypes.string.isRequired,
  finishedFiles: PropTypes.number.isRequired,
  children: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired
  })))
}

export default DownloadDropdown
