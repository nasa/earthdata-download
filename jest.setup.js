// Mock ResizeObserver for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Add a mock electronApi for App.test.js to correctly render context provider
window.electronApi = {
  autoUpdateAvailable: jest.fn(),
  autoUpdateInstallLater: jest.fn(),
  autoUpdateProgress: jest.fn(),
  autoUpdateError: jest.fn(),
  beginDownload: jest.fn(),
  cancelDownloadItem: jest.fn(),
  cancelErroredDownloadItem: jest.fn(),
  clearDownload: jest.fn(),
  deleteDownloadHistory: jest.fn(),
  chooseDownloadLocation: jest.fn(),
  clearDefaultDownload: jest.fn(),
  closeWindow: jest.fn(),
  copyDownloadPath: jest.fn(),
  deleteDownload: jest.fn(),
  getPreferenceFieldValue: jest.fn(),
  initializeDownload: jest.fn(),
  maximizeWindow: jest.fn(),
  minimizeWindow: jest.fn(),
  openDownloadFolder: jest.fn(),
  pauseDownloadItem: jest.fn(),
  requestDownloadsProgress: jest.fn().mockResolvedValue({
    downloadsReport: [],
    totalDownloads: 0
  }),
  requestFilesProgress: jest.fn(),
  restartDownload: jest.fn(),
  resumeDownloadItem: jest.fn(),
  retryErroredDownloadItem: jest.fn(),
  sendToEula: jest.fn(),
  sendToLogin: jest.fn(),
  setDownloadLocation: jest.fn(),
  setPendingDeleteDownloadHistory: jest.fn(),
  setPreferenceFieldValue: jest.fn(),
  setRestartingDownload: jest.fn(),
  showWaitingForEulaDialog: jest.fn(),
  showWaitingForLoginDialog: jest.fn(),
  undoClearDownload: jest.fn(),
  undoDeleteDownloadHistory: jest.fn(),
  undoRestartingDownload: jest.fn(),
  windowsLinuxTitleBar: jest.fn(),
  isMac: true,
  isWin: false,
  isLinux: false
}

global.fetch = jest.fn()
