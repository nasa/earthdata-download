// @ts-nocheck

import { contextBridge, ipcRenderer } from 'electron'

// Setup IPC in the preload script here instead of exposing electron APIs in the renderer process
// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronApi', {
  // Messages to send to the main process
  beginDownload: (data) => ipcRenderer.send('beginDownload', data),
  chooseDownloadLocation: () => ipcRenderer.send('chooseDownloadLocation'),
  clearDefaultDownload: () => ipcRenderer.send('clearDefaultDownload'),
  deleteCookies: () => ipcRenderer.send('deleteCookies'),
  sendToEula: (data) => ipcRenderer.send('sendToEula', data),
  sendToLogin: (data) => ipcRenderer.send('sendToLogin', data),
  setPreferenceFieldValue: (field, value) => ipcRenderer.send('setPreferenceFieldValue', field, value),
  getPreferenceFieldValue: (field) => ipcRenderer.invoke('getPreferenceFieldValue', field),

  autoUpdateInstallLater: () => ipcRenderer.send('autoUpdateInstallLater'),
  cancelDownloadItem: (data) => ipcRenderer.send('cancelDownloadItem', data),
  cancelErroredDownloadItem: (data) => ipcRenderer.send('cancelErroredDownloadItem', data),
  closeWindow: () => ipcRenderer.send('closeWindow'),
  copyDownloadPath: (data) => ipcRenderer.send('copyDownloadPath', data),
  maximizeWindow: () => ipcRenderer.send('maximizeWindow'),
  minimizeWindow: () => ipcRenderer.send('minimizeWindow'),
  openDownloadFolder: (data) => ipcRenderer.send('openDownloadFolder', data),
  pauseDownloadItem: (data) => ipcRenderer.send('pauseDownloadItem', data),
  restartDownload: (data) => ipcRenderer.send('restartDownload', data),
  resumeDownloadItem: (data) => ipcRenderer.send('resumeDownloadItem', data),
  retryErroredDownloadItem: (data) => ipcRenderer.send('retryErroredDownloadItem', data),

  // Messages to be received by the renderer process
  autoUpdateAvailable: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('autoUpdateAvailable', callback),
  autoUpdateProgress: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('autoUpdateProgress', callback),
  initializeDownload: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('initializeDownload', callback),
  reportProgress: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('reportProgress', callback),
  setDownloadLocation: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('setDownloadLocation', callback),
  showWaitingForEulaDialog: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('showWaitingForEulaDialog', callback),
  showWaitingForLoginDialog: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('showWaitingForLoginDialog', callback),
  windowsLinuxTitleBar: (on, callback) => ipcRenderer[on ? 'on' : 'removeListener']('windowsLinuxTitleBar', callback),

  // System values for renderer
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
  isLinux: process.platform === 'linux'
})
