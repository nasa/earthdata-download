const { contextBridge, ipcRenderer } = require('electron')

// Setup IPC in the preload script here instead of exposing electron APIs in the renderer process
// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('electronAPI', {
  // Messages to send to the main process
  beginDownload: (data) => ipcRenderer.send('beginDownload', data),
  chooseDownloadLocation: () => ipcRenderer.send('chooseDownloadLocation'),
  clearDefaultDownload: () => ipcRenderer.send('clearDefaultDownload'),

  // Messages to be received by the renderer process
  initializeDownloadOff: (callback) => ipcRenderer.off('initializeDownload', callback),
  initializeDownloadOn: (callback) => ipcRenderer.on('initializeDownload', callback),
  setDownloadLocationOff: (callback) => ipcRenderer.off('setDownloadLocation', callback),
  setDownloadLocationOn: (callback) => ipcRenderer.on('setDownloadLocation', callback),

  // System values for renderer
  isMac: process.platform === 'darwin'
})
