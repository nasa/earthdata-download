// @ts-nocheck

import metricsEvent from '../../../app/constants/metricsEvent'
import metricsLogger from '../../utils/metricsLogger'
import setPreferenceFieldValue from '../setPreferenceFieldValue'

jest.mock('../../utils/metricsLogger.ts', () => ({
  __esModule: true,
  default: jest.fn(() => {})
}))

describe('set a field in the preferences', () => {
  describe('when the field to set is concurrentDownloads', () => {
    test('calls setPreferences and metricsLogger', async () => {
      const database = {
        setPreferences: jest.fn()
      }
      const info = {
        field: 'concurrentDownloads',
        value: '2'
      }
      await setPreferenceFieldValue({
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.newConcurrentDownloadsLimit,
        data: {
          newConcurrentDownloads: '2'
        }
      })

      expect(database.setPreferences).toHaveBeenCalledTimes(1)
      expect(database.setPreferences).toHaveBeenCalledWith({ concurrentDownloads: '2' })
    })
  })

  describe('when the field to set is defaultDownloadLocation', () => {
    test('calls setPreferences and metricsLogger', async () => {
      const database = {
        setPreferences: jest.fn()
      }
      const info = {
        field: 'defaultDownloadLocation',
        value: 'new/location'
      }
      await setPreferenceFieldValue({
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(1)
      expect(metricsLogger).toHaveBeenCalledWith(database, {
        eventType: metricsEvent.newDefaultDownloadLocation
      })

      expect(database.setPreferences).toHaveBeenCalledTimes(1)
      expect(database.setPreferences).toHaveBeenCalledWith({ defaultDownloadLocation: 'new/location' })
    })
  })

  describe('when the field to set is not a value that should call metricsLogger', () => {
    test('calls setPreferences but not metricsLogger', async () => {
      const database = {
        setPreferences: jest.fn()
      }
      const info = {
        field: 'lastDownloadLocation',
        value: '/mock/path'
      }
      await setPreferenceFieldValue({
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(0)

      expect(database.setPreferences).toHaveBeenCalledTimes(1)
      expect(database.setPreferences).toHaveBeenCalledWith({ lastDownloadLocation: '/mock/path' })
    })
  })

  describe('when the field to set is allowMetrics', () => {
    test('sets hasMetricsPreferenceBeenSet to true', async () => {
      const database = {
        setPreferences: jest.fn(),
        getPreferences: jest.fn().mockResolvedValue({})
      }
      const info = {
        field: 'allowMetrics',
        value: 1
      }

      await setPreferenceFieldValue({
        database,
        info
      })

      expect(metricsLogger).toHaveBeenCalledTimes(0)

      expect(database.setPreferences).toHaveBeenCalledTimes(1)
      expect(database.setPreferences).toHaveBeenCalledWith({
        allowMetrics: 1,
        hasMetricsPreferenceBeenSet: 1
      })
    })
  })
})
