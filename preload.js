const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readNameSets:    ()     => ipcRenderer.invoke('read-name-sets'),
  writeNameSets:   (data) => ipcRenderer.invoke('write-name-sets', data),
  readTemplates:   ()     => ipcRenderer.invoke('read-templates'),
  writeTemplates:  (data) => ipcRenderer.invoke('write-templates', data),
  readHistory:     ()     => ipcRenderer.invoke('read-history'),
  writeHistory:    (data) => ipcRenderer.invoke('write-history', data),
  saveTextFile:    (content, defaultName) => ipcRenderer.invoke('save-text-file', content, defaultName),
});
