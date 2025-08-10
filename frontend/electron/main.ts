import {
  app,
  BrowserWindow,
  shell,
  crashReporter,
  screen,
  Rectangle,
  globalShortcut,
  ipcMain,
} from 'electron';
import { join } from 'path';
import log from 'electron-log';
import Store from 'electron-store';

// Try to load electron-window-state; fall back to our manual Store if missing
let windowStateKeeper: typeof import('electron-window-state') | null = null;
try {
  require.resolve('electron-window-state');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  windowStateKeeper = require('electron-window-state');
} catch {
  console.log('electron-window-state not installed; using manual window-state management'
  );
}

// Define the types for our manual state
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

// Prepare either the auto-clamp state manager or our own Store
let state:
  | ReturnType<typeof windowStateKeeper>
  | null = null;
let store:
  | Store<WindowState>
  | null = null;

if (windowStateKeeper) {
  state = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 768,
  });
} else {
  store = new Store<WindowState>({
    defaults: { width: 1024, height: 768 },
  });
}

// Helper: clamp raw bounds into whichever display work area overlaps, or primary
function clampToVisible(raw: Rectangle): Rectangle {
  const displays = screen.getAllDisplays().map((d) => d.workArea);
  const workArea =
    displays.find(
      (area) =>
        raw.x! < area.x + area.width &&
        raw.x! + raw.width > area.x &&
        raw.y! < area.y + area.height &&
        raw.y! + raw.height > area.y
    ) || screen.getPrimaryDisplay().workArea;

  const x = Math.min(
    Math.max(raw.x!, workArea.x),
    workArea.x + workArea.width - raw.width
  );
  const y = Math.min(
    Math.max(raw.y!, workArea.y),
    workArea.y + workArea.height - raw.height
  );
  return { x, y, width: raw.width, height: raw.height };
}

// Whitelist full-URL prefixes (protocol+domain+path)
const ALLOWED_URL_PREFIXES = [
  'file://',                                 // always allow local files
  'https://github.com/BlazesRus/timeless-jewels/',
  'https://blazesrus.github.io/timeless-jewels/',
  'https://vilsol.github.io/timeless-jewels/',
  'https://github.com/vilsol/timeless-jewels/',
];

// IPC handlers (renderer → main)
ipcMain.on('log-event', (_, data) => {
  log.info(`Renderer says: ${data}`);
});

ipcMain.handle('get-config', () => {
  // Return manual store state if using DIY, else auto state
  if (store) return store.store;
  return {
    x: state!.x,
    y: state!.y,
    width: state!.width,
    height: state!.height,
  };
});

// Crash logging
crashReporter.start({
  companyName: 'BlazesRus',
  uploadToServer: false,
});
app.on('ready', () => log.info('App is ready'));
process.on('uncaughtException', (err) =>
  log.error('Uncaught exception', err)
);

// Prevent multiple processes; spawn a new window on second-instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', () => {
  createWindow();
});

function createWindow() {
  // 1) Determine which bounds to use
  const rawBounds = state
    ? { x: state.x, y: state.y, width: state.width, height: state.height }
    : store!.store;
  const { x, y, width, height } = clampToVisible(rawBounds as Rectangle);

  // 2) Create the BrowserWindow
  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    show: false, // wait for ready-to-show
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  // 3) Track moves/resizes
  if (state) {
    state.manage(win);
  } else {
    win.on('close', () => {
      const b = win.getBounds();
      store!.set('x', b.x);
      store!.set('y', b.y);
      store!.set('width', b.width);
      store!.set('height', b.height);
    });
  }

  // 4) Navigation lockdown & external links
  win.webContents.on('will-navigate', (e, url) => {
    if (!ALLOWED_URL_PREFIXES.some((p) => url.startsWith(p))) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (ALLOWED_URL_PREFIXES.some((p) => url.startsWith(p))) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 5) Show when ready
  win.once('ready-to-show', () => win.show());

  // 6) Load dev server or local file
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, 'index.html'));
  }

  // 7) Windows AppUserModelID for notifications & jump lists
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.BlazesRus.TimelessJewelGen');
  }
}

// Register a global shortcut (toggle DevTools)
app.whenReady().then(() => {
  createWindow();
  // Ctrl+Shift+I for toggling DevTools anywhere
  globalShortcut.register('Control+Shift+I', () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) w.webContents.toggleDevTools();
  });
});

// Cleanup shortcuts on quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Quit behavior
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
