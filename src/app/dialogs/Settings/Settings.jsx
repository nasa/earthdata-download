import React, { useContext, useState, useEffect } from 'react'
import {
  FaFolder
} from 'react-icons/fa'
import PropTypes from 'prop-types'

import MiddleEllipsis from 'react-middle-ellipsis'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import * as styles from './Settings.module.scss'

import Input from '../../components/Input/Input'

import Button from '../../components/Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'
/**
 * @typedef {Object} InitializeDownloadProps
 * @property {Boolean} hasActiveDownloads A boolean representing flag if user has downloads in active state
 */

/**
 * Renders a `Settings` dialog.
 * @param {Settings} props
 *
 * @example <caption>Render a Settings dialog.</caption>
 *
 * const [hasActiveDownload, setHasActiveDownload] = useState(false)
 *
 * return (
 *  <Dialog {...dialogProps}>
 *    <Settings
 *      hasActiveDownload = {hasActiveDownload}
 *    />
 *  </Dialog>
 * )
 */
const Settings = ({
  hasActiveDownloads
}) => {
  const {
    chooseDownloadLocation,
    setDownloadLocation,
    setPreferenceFieldValue,
    getPreferenceFieldValue
  } = useContext(ElectronApiContext)
  const [concurrentDownloads, setConcurrentDownloads] = useState(5)
  const [defaultDownloadLocation, setDefaultDownloadLocation] = useState()

  const onClearDefaultDownload = () => {
    setDefaultDownloadLocation(undefined)
    setPreferenceFieldValue('defaultDownloadLocation', undefined)
  }

  const onSetChooseDownloadLocation = () => {
    chooseDownloadLocation()
  }

  const onSetConcurrentDownloads = (event) => {
    const { value } = event.target
    const valueNum = parseInt(value, 10)
    if (valueNum > 0) {
      setConcurrentDownloads(valueNum)
      setPreferenceFieldValue('concurrentDownloads', valueNum)
    }
  }

  useEffect(
    () => {
      const fetchDefaultDownloadLocation = async () => {
        setDefaultDownloadLocation(await getPreferenceFieldValue('defaultDownloadLocation'))
      }
      fetchDefaultDownloadLocation()
    },
    [setDefaultDownloadLocation]
  )

  useEffect(() => {
    const fetchConcurrency = async () => { setConcurrentDownloads(await getPreferenceFieldValue('concurrentDownloads')) }
    fetchConcurrency()
  }, [setConcurrentDownloads])

  const onSetDownloadLocation = (event, info) => {
    const { downloadLocation: newDownloadLocation } = info
    setDefaultDownloadLocation(newDownloadLocation)
    setPreferenceFieldValue('defaultDownloadLocation', newDownloadLocation)
  }

  // Handle the response from the setConcurrentDownloads func
  useEffect(() => {
    setDownloadLocation(true, onSetDownloadLocation)
    return () => {
      setDownloadLocation(false, onSetDownloadLocation)
    }
  }, [])

  return (
    <div>
      Number of Concurrent Downloads:
      {' '}
      {concurrentDownloads}
      <br />
      Download location:
      {' '}
      {defaultDownloadLocation}

      <Input
        type="number"
        onChange={onSetConcurrentDownloads}
        value={concurrentDownloads}
        label="Set Concurrency"
      />

      <button
        className={styles.downloadLocationButton}
        type="button"
        onClick={onSetChooseDownloadLocation}
        data-testid="initialize-download-location"
        aria-label="Choose another folder"
      >
        Select Download Location
      </button>
      <span className={styles.downloadLocationWrapper}>
        <FaFolder />
        <VisuallyHidden>
          <span>{`${defaultDownloadLocation}`}</span>
        </VisuallyHidden>
        <MiddleEllipsis key={defaultDownloadLocation}>
          <span
            className={styles.downloadLocationText}
            aria-hidden="true"
          >
            {defaultDownloadLocation}
          </span>
        </MiddleEllipsis>
      </span>

      <Button
        size="md"
        onClick={onClearDefaultDownload}
        dataTestId="settings-clear-default-download"
        className={styles.settingsClearDefaultDownload}
      >
        Clear default download location
      </Button>
      { hasActiveDownloads
        ? (
          <div className={styles.activeDownloadsWarn} data-testid="settings-hasActiveDownloads">
            Currently running Downloads
          </div>
        )
        : (
          null
        )}

    </div>
  )
}

Settings.propTypes = {
  hasActiveDownloads: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]).isRequired
}

export default Settings
