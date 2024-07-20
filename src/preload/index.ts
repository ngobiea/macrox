import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  recordAction: (action: Action): void => ipcRenderer.send('record-action', action),
  // playActions: ():void => ipcRenderer.send('play-actions'),
  // saveActions: (actions):void => ipcRenderer.send('save-actions', actions),
  onUpdateActions: (callback: (actions: Action[]) => void): void => {
    ipcRenderer.on('update-actions', (_, actions: Action[]) => callback(actions));
  },
  deleteAction: (actionId: string): void => ipcRenderer.send('delete-action', actionId),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
