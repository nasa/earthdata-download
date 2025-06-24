import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import pluralize from '../../utils/pluralize'

/**
 * @typedef {Object} AdditionalDetailsProps
 * @property {Object} activeAdditionalDetailsInfo An object containing the active additional details information.
 * @property {String} activeAdditionalDetailsInfo.downloadId The downloadId of the files.
 */
/**
 * Renders a `AdditionalDetails` dialog.
 * @param {AdditionalDetailsProps} props
 *
 * @example <caption>Render a AdditionalDetails dialog.</caption>
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <AdditionalDetails
 *       activeAdditionalDetailsInfo={activeAdditionalDetailsInfo}
 *     />
 *   </AdditionalDetails>
 * )
 */
const AdditionalDetails = ({
  activeAdditionalDetailsInfo
}) => {
  const { downloadId } = activeAdditionalDetailsInfo
  const {
    requestAddionalDetailsReport
  } = useContext(ElectronApiContext)

  const [duplicateCount, setDuplicateCount] = useState(0)
  const [invalidLinksCount, setInvalidLinksCount] = useState(0)

  useEffect(() => {
    if (downloadId) {
      const fetchReport = async () => {
        const report = await requestAddionalDetailsReport({ downloadId })

        const {
          duplicateCount: newDuplicateCount,
          invalidLinksCount: newInvalidLinksCount
        } = report

        setDuplicateCount(newDuplicateCount)
        setInvalidLinksCount(newInvalidLinksCount)
      }

      fetchReport()
    }
  }, [downloadId])

  return (
    <div>
      <p>
        The download has encountered the following issues:
      </p>
      <ul>

        {
          duplicateCount > 0 && (
            <li>
              {`${duplicateCount} ${pluralize('file', duplicateCount)} ${duplicateCount > 1 ? 'were' : 'was'} a duplicate of another file in the download. Each file will be downloaded once, and the number of files shown does not include the duplicate files.`}
            </li>
          )
        }
        {
          invalidLinksCount > 0 && (
            <li>
              {`${invalidLinksCount} ${pluralize('file', invalidLinksCount)} did not have a valid "https" link and could not be downloaded. The number of files shown does not include invalid links.`}
            </li>
          )
        }
      </ul>
    </div>
  )
}

AdditionalDetails.propTypes = {
  activeAdditionalDetailsInfo: PropTypes.shape({
    downloadId: PropTypes.string
  }).isRequired
}

export default AdditionalDetails
