import { FaInfoCircle, FaRedo } from 'react-icons/fa'

import pluralize from './pluralize'

/**
 * Calls `addToast` for each error in the errors object
 * @param {Object} params
 * @param {Function} params.addToast A function to add a new toast notification.
 * @param {Function} params.deleteAllToastsById A function to delete toasts by downloadId.
 * @param {Object} params.errors Errors grouped by downloadId.
 * @param {Function} params.retryErroredDownloadItem A function to retry errored downloads.
 * @param {Function} params.showMoreInfoDialog A function to set the `showMoreInfoDialog` in the layout.
 */
const addErrorToasts = ({
  addToast,
  deleteAllToastsById,
  errors = {},
  retryErroredDownloadItem,
  showMoreInfoDialog
}) => {
  // Add errors
  Object.keys(errors).forEach((erroredDownloadId) => {
    const error = errors[erroredDownloadId]
    const {
      active,
      numberErrors
    } = error

    // If the download is not active, don't display the toast
    if (!active) return

    addToast({
      id: erroredDownloadId,
      title: 'An error occurred',
      message: `${numberErrors} ${pluralize('file', numberErrors)} failed to download in ${erroredDownloadId}`,
      numberErrors,
      variant: 'danger',
      actions: [
        {
          altText: 'Retry',
          buttonText: 'Retry',
          buttonProps: {
            Icon: FaRedo,
            onClick: () => {
              retryErroredDownloadItem({ downloadId: erroredDownloadId })
              deleteAllToastsById(erroredDownloadId)
            }
          }
        },
        {
          altText: 'More Info',
          buttonText: 'More Info',
          buttonProps: {
            Icon: FaInfoCircle,
            hideLabel: true,
            onClick: () => showMoreInfoDialog({
              downloadId: erroredDownloadId,
              numberErrors
            })
          }
        }
      ]
    })
  })
}

export default addErrorToasts
