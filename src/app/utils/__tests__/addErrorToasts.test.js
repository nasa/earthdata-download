import addErrorToasts from '../addErrorToasts'

describe('addErrorToasts', () => {
  test('does not call addToast when no errors exist', () => {
    const errors = {}
    const addToast = jest.fn()
    const deleteAllToastsById = jest.fn()
    const retryErroredDownloadItem = jest.fn()
    const showMoreInfoDialog = jest.fn()

    addErrorToasts({
      errors,
      addToast,
      deleteAllToastsById,
      retryErroredDownloadItem,
      showMoreInfoDialog
    })

    expect(addToast).toHaveBeenCalledTimes(0)
  })

  test('calls addToast for each error', () => {
    const errors = {
      'mock-download-id-1': {
        numberErrors: 3
      },
      'mock-download-id-2': {
        numberErrors: 5
      }
    }
    const addToast = jest.fn()
    const deleteAllToastsById = jest.fn()
    const retryErroredDownloadItem = jest.fn()
    const showMoreInfoDialog = jest.fn()

    addErrorToasts({
      errors,
      addToast,
      deleteAllToastsById,
      retryErroredDownloadItem,
      showMoreInfoDialog
    })

    expect(addToast).toHaveBeenCalledTimes(2)
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'mock-download-id-1',
        title: 'An error occurred',
        message: '3 files failed to download in mock-download-id-1',
        numberErrors: 3,
        variant: 'danger'
      })
    )

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'mock-download-id-2',
        title: 'An error occurred',
        message: '5 files failed to download in mock-download-id-2',
        numberErrors: 5,
        variant: 'danger'
      })
    )
  })
})
