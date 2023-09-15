// @ts-nocheck

import { contextBridge, ipcRenderer } from 'electron'

// Setup IPC in the preload script here instead of exposing electron APIs in the renderer process
// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronApi', {
  // Messages to send to the main process
  beginDownload: (data) => ipcRenderer.send('beginDownload', data),
  chooseDownloadLocation: () => ipcRenderer.send('chooseDownloadLocation'),
  clearDefaultDownload: () => ipcRenderer.send('clearDefaultDownload'),
  sendToEula: (data) => ipcRenderer.send('sendToEula', data),
  sendToLogin: (data) => ipcRenderer.send('sendToLogin', data),
  setPreferenceFieldValue: (data) => ipcRenderer.send('setPreferenceFieldValue', data),
  getPreferenceFieldValue: (data) => ipcRenderer.invoke('getPreferenceFieldValue', data),

  autoUpdateInstallLater: () => ipcRenderer.send('autoUpdateInstallLater'),
  cancelDownloadItem: (data) => ipcRenderer.send('cancelDownloadItem', data),
  cancelErroredDownloadItem: (data) => ipcRenderer.send('cancelErroredDownloadItem', data),
  clearDownload: (data) => ipcRenderer.send('clearDownload', data),
  deleteDownloadHistory: (data) => ipcRenderer.send('deleteDownloadHistory', data),
  closeWindow: () => ipcRenderer.send('closeWindow'),
  copyDownloadPath: (data) => ipcRenderer.send('copyDownloadPath', data),
  deleteDownload: (data) => ipcRenderer.send('deleteDownload', data),
  maximizeWindow: () => ipcRenderer.send('maximizeWindow'),
  minimizeWindow: () => ipcRenderer.send('minimizeWindow'),
  openDownloadFolder: (data) => ipcRenderer.send('openDownloadFolder', data),
  pauseDownloadItem: (data) => ipcRenderer.send('pauseDownloadItem', data),
  restartDownload: (data) => ipcRenderer.send('restartDownload', data),
  resumeDownloadItem: (data) => ipcRenderer.send('resumeDownloadItem', data),
  retryErroredDownloadItem: (data) => ipcRenderer.send('retryErroredDownloadItem', data),
  setPendingDeleteDownloadHistory: (data) => ipcRenderer.send('setPendingDeleteDownloadHistory', data),
  undoClearDownload: (data) => ipcRenderer.send('undoClearDownload', data),
  undoDeleteDownloadHistory: (data) => ipcRenderer.send('undoDeleteDownloadHistory', data),

  // Reporting
  requestDownloadsProgress: (data) => ipcRenderer.invoke('requestDownloadsProgress', data),
  requestFilesProgress: (data) => ipcRenderer.invoke('requestFilesProgress', data),

  // Messages to be received by the renderer process
  autoUpdateAvailable: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('autoUpdateAvailable', callback),
  autoUpdateProgress: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('autoUpdateProgress', callback),
  initializeDownload: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('initializeDownload', callback),
  setDownloadLocation: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('setDownloadLocation', callback),
  showWaitingForEulaDialog: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('showWaitingForEulaDialog', callback),
  showWaitingForLoginDialog: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('showWaitingForLoginDialog', callback),
  windowsLinuxTitleBar: (on, callback) => ipcRenderer[on ? 'on' : 'removeAllListeners']('windowsLinuxTitleBar', callback),
  // System values for renderer
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
  isLinux: process.platform === 'linux'
})
