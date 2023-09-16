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
        active: 1,
        numberErrors: 3
      },
      'mock-download-id-2': {
        active: 1,
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

  test('does not call addToast when the download is not active', () => {
    const errors = {
      'mock-download-id-1': {
        active: 0,
        numberErrors: 3
      },
      'mock-download-id-2': {
        active: 0,
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

    expect(addToast).toHaveBeenCalledTimes(0)
  })

  test('Retry callback is called', () => {
    const errors = {
      'mock-download-id-1': {
        active: 1,
        numberErrors: 3
      }
    }
    const toasts = []
    const addToast = jest.fn((toast) => toasts.push(toast))
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

    expect(toasts).toHaveLength(1)

    const [toast] = toasts
    const { actions } = toast
    const [retryAction] = actions
    const { buttonProps } = retryAction
    const { onClick } = buttonProps

    onClick()

    expect(retryErroredDownloadItem).toHaveBeenCalledTimes(1)
    expect(retryErroredDownloadItem).toHaveBeenCalledWith({ downloadId: 'mock-download-id-1' })

    expect(deleteAllToastsById).toHaveBeenCalledTimes(1)
    expect(deleteAllToastsById).toHaveBeenCalledWith('mock-download-id-1')

    expect(showMoreInfoDialog).toHaveBeenCalledTimes(0)
  })

  test('More Info callback is called', () => {
    const errors = {
      'mock-download-id-1': {
        active: 1,
        numberErrors: 3
      }
    }
    const toasts = []
    const addToast = jest.fn((toast) => toasts.push(toast))
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

    expect(toasts).toHaveLength(1)

    const [toast] = toasts
    const { actions } = toast
    const [, moreInfoAction] = actions
    const { buttonProps } = moreInfoAction
    const { onClick } = buttonProps

    onClick()

    expect(showMoreInfoDialog).toHaveBeenCalledTimes(1)
    expect(showMoreInfoDialog).toHaveBeenCalledWith({
      downloadId: 'mock-download-id-1',
      numberErrors: 3
    })

    expect(deleteAllToastsById).toHaveBeenCalledTimes(0)
    expect(retryErroredDownloadItem).toHaveBeenCalledTimes(0)
  })
})
