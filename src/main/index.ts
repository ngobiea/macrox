import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { GlobalKeyboardListener } from 'node-global-key-listener';
import { type IGlobalKeyListener } from 'node-global-key-listener';

const v = new GlobalKeyboardListener();
let mainWindow: BrowserWindow;
const recordedActions: Action[] = []; // Initialize an empty array to store recorded actions
const listener: IGlobalKeyListener = (e) => {
  if (e.name) {
    recordedActions.push({
      id: new Date().toISOString(),
      type: e.name?.includes('MOUSE') ? 'mouse' : 'keyboard',
      x: e.location ? e.location[0] : 0,
      y: e.location ? e.location[1] : 0,
      key: e.name,
      delay: 0,
      state: e.state === 'DOWN' ? 'key down' : 'key up',
    });
  }
  console.log(recordedActions);
  mainWindow.webContents.send('update-actions', recordedActions);
};
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));
  ipcMain.on('record-action', async (_, isRecording) => {
    if (isRecording) {
      v.addListener(listener);
    } else {
      v.removeListener(listener);
    }
  });

  createWindow();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on('delete-action', (_, actionId) => {
  const index = recordedActions.findIndex((action) => action.id === actionId);
  if (index > -1) {
    recordedActions.splice(index, 1);
  }
  mainWindow.webContents.send('update-actions', recordedActions);
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
