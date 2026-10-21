const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSavedApis: () => ipcRenderer.invoke('get-saved-apis'),
  saveSavedApis: (data) => ipcRenderer.invoke('save-saved-apis', data),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  testConnection: (provider) => ipcRenderer.invoke('test-connection', provider),
  fetchModels: (provider) => ipcRenderer.invoke('fetch-models', provider),
  saveFileDialog: (data) => ipcRenderer.invoke('save-file-dialog', data),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  checkForUpdates: (manual) => ipcRenderer.invoke('check-for-updates', { manual }),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  applyHotUpdate: (zipUrl) => ipcRenderer.invoke('apply-hot-update', { zipUrl }),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_, info) => callback(info))
});
