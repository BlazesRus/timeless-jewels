// src-electron/main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Isolate context and disable Node integration in renderer
      contextIsolation: true,
      nodeIntegration: false,

      // Point to the compiled preload script
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load your front-end's entry HTML from the build output
  win.loadFile(path.join(__dirname, '../build/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
