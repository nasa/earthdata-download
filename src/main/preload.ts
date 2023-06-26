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
  sendToLogin: (data) => ipcRenderer.send('sendToLogin', data),

  pauseDownloadItem: (data) => ipcRenderer.send('pauseDownloadItem', data),
  resumeDownloadItem: (data) => ipcRenderer.send('resumeDownloadItem', data),
  cancelDownloadItem: (data) => ipcRenderer.send('cancelDownloadItem', data),
  openDownloadFolder: (data) => ipcRenderer.send('openDownloadFolder', data),
  copyDownloadPath: (data) => ipcRenderer.send('copyDownloadPath', data),
  closeWindow: () => ipcRenderer.send('closeWindow'),
  minimizeWindow: () => ipcRenderer.send('minimizeWindow'),
  maximizeWindow: () => ipcRenderer.send('maximizeWindow'),

  // Messages to be received by the renderer process
  initializeDownload: (on, callback) => ipcRenderer[on ? 'on' : 'off']('initializeDownload', callback),
  reportProgress: (on, callback) => ipcRenderer[on ? 'on' : 'off']('reportProgress', callback),
  setDownloadLocation: (on, callback) => ipcRenderer[on ? 'on' : 'off']('setDownloadLocation', callback),
  showWaitingForLoginDialog: (on, callback) => ipcRenderer[on ? 'on' : 'off']('showWaitingForLoginDialog', callback),
  windowsLinuxTitleBar: (on, callback) => ipcRenderer[on ? 'on' : 'off']('windowsLinuxTitleBar', callback),

  // System values for renderer
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
  isLinux: process.platform === 'linux'
})
