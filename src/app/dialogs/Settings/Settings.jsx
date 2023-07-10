import React, { useContext, useState, useEffect } from 'react'
import {
  FaBan,
  FaFolder
} from 'react-icons/fa'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import MiddleEllipsis from 'react-middle-ellipsis'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import FormRow from '../../components/FormRow/FormRow'
import Input from '../../components/Input/Input'
import Tooltip from '../../components/Tooltip/Tooltip'

import * as styles from './Settings.module.scss'

/**
 * @typedef {Object} InitializeDownloadProps
 * @property {Boolean} hasActiveDownloads A boolean representing flag if user has downloads in active state
 * @property {Boolean} settingsDialogIsOpen A boolean representing flag if the settings modal is open or closed
 */

/**
 * Renders a `Settings` dialog.
 * @param {Settings} props
 *
 * @example <caption>Render a Settings dialog.</caption>
 *
 * const [hasActiveDownload, setHasActiveDownload] = useState(false)
 * const [settingsDialogIsOpen, setSettingsDialogIsOpen] = useState(false)
 *
 * return (
 *  <Dialog {...dialogProps}>
 *    <div>This is a dialog</div>
 *  </Dialog>
 * )
 */
const Settings = ({
  hasActiveDownloads,
  settingsDialogIsOpen
}) => {
  const {
    chooseDownloadLocation,
    setDownloadLocation,
    setPreferenceFieldValue,
    getPreferenceFieldValue
  } = useContext(ElectronApiContext)
  const [concurrentDownloads, setConcurrentDownloads] = useState('')
  const [defaultDownloadLocation, setDefaultDownloadLocation] = useState()

  const onClearDefaultDownload = () => {
    setPreferenceFieldValue('defaultDownloadLocation', null)
    setDefaultDownloadLocation(null)
  }

  const onSetChooseDownloadLocation = () => {
    chooseDownloadLocation()
  }

  const onChangeConcurrentDownloads = (event) => {
    const { value } = event.target

    // if value is non numerical and can't be parsed as an integer return 0
    const valueNumeric = parseInt(value, 10) || 0
    if (value === '') {
      setConcurrentDownloads('')
      return
    }

    // Allow set if non-decimal value and > 0 allow setting of the text field
    if (valueNumeric > 0 && value.indexOf('.') < 0) {
      setConcurrentDownloads(valueNumeric.toString())
    }
  }

  // Event occurs when element loses focus, write to preferences.json
  const onBlurConcurrentDownloads = async (event) => {
    const { value } = event.target

    // If empty string is entered and the input field is exited, restore the label with the set concurrentDownloads
    if (!value) {
      const concurrentDownloadsPreference = await getPreferenceFieldValue('concurrentDownloads')
      setConcurrentDownloads(concurrentDownloadsPreference.toString())
      return
    }

    const valueNumeric = parseInt(value, 10)
    if (!Number.isNaN(valueNumeric) && valueNumeric > 0) {
      setPreferenceFieldValue('concurrentDownloads', valueNumeric)
    }
  }

  const onSetDownloadLocation = (event, info) => {
    const { downloadLocation: newDownloadLocation } = info
    setDefaultDownloadLocation(newDownloadLocation)
    setPreferenceFieldValue('defaultDownloadLocation', newDownloadLocation)
  }

  useEffect(() => {
    const fetchDefaultDownloadLocation = async () => {
      setDefaultDownloadLocation(await getPreferenceFieldValue('defaultDownloadLocation'))
    }
    fetchDefaultDownloadLocation()
  }, [])

  useEffect(() => {
    const fetchConcurrentDownloads = async () => {
      const concurrentDownloads = await getPreferenceFieldValue('concurrentDownloads')
      setConcurrentDownloads(concurrentDownloads.toString())
    }
    fetchConcurrentDownloads()
  }, [])

  // Handle the response from the setDownloadLocation
  useEffect(() => {
    setDownloadLocation(true, onSetDownloadLocation)
    return () => {
      setDownloadLocation(false, onSetDownloadLocation)
    }
  }, [])

  useEffect(() => {
    // Handle edge case where change is made to the concurrency field but, exits
    if (!settingsDialogIsOpen) {
      const valueNumeric = parseInt(concurrentDownloads.toString(), 10)
      if (valueNumeric > 0) {
        setPreferenceFieldValue('concurrentDownloads', valueNumeric)
      }
    }
  }, [settingsDialogIsOpen])

  const downloadLocationInputClassNames = classNames([
    'input',
    styles.downloadLocationInputWrapper
  ])

  return (
    <div>
      {
        hasActiveDownloads && (
          <Alert
            className={styles.activeDownloadAlert}
            variant="warning"
          >
            Files currently downloading will not be affected by changes to settings
          </Alert>
        )
      }
      <FormRow
        label="Download Location"
        description="Set the location where you would like to download your files. With a download location set, you will not be prompted to chose a location before a download begins."
      >
        {
          defaultDownloadLocation
            ? (
              <div className={styles.downloadLocationWrapper}>
                <Tooltip
                  content="Change the selected download location"
                  additionalContent={defaultDownloadLocation}
                >
                  <button
                    className={styles.downloadLocationButton}
                    type="button"
                    onClick={onSetChooseDownloadLocation}
                    aria-label="Choose another folder"
                  >
                    <span className={downloadLocationInputClassNames}>
                      <FaFolder className={styles.downloadLocationIcon} />
                      <VisuallyHidden.Root>
                        <span>{`${defaultDownloadLocation}`}</span>
                      </VisuallyHidden.Root>
                      <MiddleEllipsis key={defaultDownloadLocation}>
                        <span
                          className={styles.downloadLocationText}
                          aria-hidden="true"
                        >
                          {defaultDownloadLocation}
                        </span>
                      </MiddleEllipsis>
                    </span>
                  </button>
                </Tooltip>
                <Button
                  className={styles.clearDownloadLocationButton}
                  onClick={onClearDefaultDownload}
                  Icon={FaBan}
                  variant="danger"
                  size="lg"
                  hideLabel
                >
                  Clear download location
                </Button>
              </div>
            )
            : (
              <Button
                type="button"
                size="lg"
                Icon={FaFolder}
                onClick={onSetChooseDownloadLocation}
                aria-label="Choose another folder"
              >
                Choose download location
              </Button>
            )
        }
      </FormRow>
      <FormRow
        label="Simultaneous Downloads"
        description="Set the maximum number of files that can be downloaded simultaneously."
      >
        <Input
          id="concurrent-downloads"
          label="Simultaneous Downloads"
          type="text"
          onChange={onChangeConcurrentDownloads}
          value={concurrentDownloads}
          onBlur={onBlurConcurrentDownloads}
        />
      </FormRow>
    </div>
  )
}

Settings.propTypes = {
  hasActiveDownloads: PropTypes.bool.isRequired,
  settingsDialogIsOpen: PropTypes.bool.isRequired
}

export default Settings
