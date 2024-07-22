// @ts-nocheck

import { contextBridge, ipcRenderer } from 'electron'

// Setup IPC in the preload script here instead of exposing electron APIs in the renderer process
// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronApi', {
  // Messages to send to the main process
  autoUpdateInstallLater: () => ipcRenderer.send('autoUpdateInstallLater'),
  beginDownload: (data) => ipcRenderer.send('beginDownload', data),
  cancelDownloadItem: (data) => ipcRenderer.send('cancelDownloadItem', data),
  cancelErroredDownloadItem: (data) => ipcRenderer.send('cancelErroredDownloadItem', data),
  chooseDownloadLocation: () => ipcRenderer.send('chooseDownloadLocation'),
  clearDefaultDownload: () => ipcRenderer.send('clearDefaultDownload'),
  clearDownload: (data) => ipcRenderer.send('clearDownload', data),
  closeWindow: () => ipcRenderer.send('closeWindow'),
  copyDownloadPath: (data) => ipcRenderer.send('copyDownloadPath', data),
  deleteDownload: (data) => ipcRenderer.send('deleteDownload', data),
  deleteDownloadHistory: (data) => ipcRenderer.send('deleteDownloadHistory', data),
  getPreferenceFieldValue: (data) => ipcRenderer.invoke('getPreferenceFieldValue', data),
  maximizeWindow: () => ipcRenderer.send('maximizeWindow'),
  minimizeWindow: () => ipcRenderer.send('minimizeWindow'),
  openDownloadFolder: (data) => ipcRenderer.send('openDownloadFolder', data),
  openLogFolder: () => ipcRenderer.send('openLogFolder'),
  pauseDownloadItem: (data) => ipcRenderer.send('pauseDownloadItem', data),
  resetApplication: () => ipcRenderer.send('resetApplication'),
  restartDownload: (data) => ipcRenderer.send('restartDownload', data),
  resumeDownloadItem: (data) => ipcRenderer.send('resumeDownloadItem', data),
  retryErroredDownloadItem: (data) => ipcRenderer.send('retryErroredDownloadItem', data),
  sendToEula: (data) => ipcRenderer.send('sendToEula', data),
  sendToLogin: (data) => ipcRenderer.send('sendToLogin', data),
  setCancellingDownload: (data) => ipcRenderer.send('setCancellingDownload', data),
  setPendingDeleteDownloadHistory: (data) => ipcRenderer.send('setPendingDeleteDownloadHistory', data),
  setPreferenceFieldValue: (data) => ipcRenderer.send('setPreferenceFieldValue', data),
  setRestartingDownload: (data) => ipcRenderer.send('setRestartingDownload', data),
  undoCancellingDownload: (data) => ipcRenderer.send('undoCancellingDownload', data),
  undoClearDownload: (data) => ipcRenderer.send('undoClearDownload', data),
  undoDeleteDownloadHistory: (data) => ipcRenderer.send('undoDeleteDownloadHistory', data),
  undoRestartingDownload: (data) => ipcRenderer.send('undoRestartingDownload', data),

  // Reporting
  requestDownloadsProgress: (data) => ipcRenderer.invoke('requestDownloadsProgress', data),
  requestFilesProgress: (data) => ipcRenderer.invoke('requestFilesProgress', data),

  // Messages to be received by the renderer process
  autoUpdateAvailable: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('autoUpdateAvailable', callback),
  autoUpdateProgress: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('autoUpdateProgress', callback),
  autoUpdateError: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('autoUpdateError', callback),
  initializeDownload: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('initializeDownload', callback),
  setDownloadLocation: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('setDownloadLocation', callback),
  showWaitingForEulaDialog: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('showWaitingForEulaDialog', callback),
  showWaitingForLoginDialog: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('showWaitingForLoginDialog', callback),
  windowsLinuxTitleBar: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('windowsLinuxTitleBar', callback),
  // System values for renderer
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
  isLinux: process.platform === 'linux',

  getAppVersion: () => ipcRenderer.invoke('getAppVersion')
})
