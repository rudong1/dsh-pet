const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('desktopPet', {
  setInteractive: value => ipcRenderer.send('pet:interactive', value),
  beginDrag: () => ipcRenderer.send('pet:drag-start'),
  moveDrag: () => ipcRenderer.send('pet:drag-move'),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  getFacing: () => ipcRenderer.invoke('pet:get-facing'),
  onFacingChange: callback => {
    const listener = (event, side) => { if (side === 'left' || side === 'right') callback(side) }
    ipcRenderer.on('pet:facing', listener)
    return () => ipcRenderer.removeListener('pet:facing', listener)
  },
  showMenu: () => ipcRenderer.send('pet:menu'),
})
