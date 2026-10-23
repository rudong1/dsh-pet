const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('desktopPet', {
  setInteractive: value => ipcRenderer.send('pet:interactive', value),
  beginDrag: () => ipcRenderer.send('pet:drag-start'),
  moveDrag: () => ipcRenderer.send('pet:drag-move'),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  showMenu: () => ipcRenderer.send('pet:menu'),
})
