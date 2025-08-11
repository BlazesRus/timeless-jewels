import {
  app,
  BrowserWindow,
  shell,
  crashReporter,
  screen,
  Rectangle,
  globalShortcut,
  ipcMain,
  Menu,
  Tray,
  dialog,
  nativeImage,
  Display
} from 'electron';
import { join } from 'path';
import log from 'electron-log';

//Creating a single Store for window state + auto-update flag
import Store from 'electron-store';
interface StoreSchema {
  x?: number;
  y?: number;
  width: number;
  height: number;
  autoUpdateEnabled: boolean;
  repositionOnDisplayRemoval: boolean;
}
const store = new Store<StoreSchema>({
  defaults: {
    width: 1024,
    height: 768,
    autoUpdateEnabled: false,
    repositionOnDisplayRemoval: false
  }
});

// Dynamically loading `electron-updater`
let autoUpdater: typeof import('electron-updater').autoUpdater | null = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  log.info('electron-updater loaded; auto-updates enabled');
} catch {
  log.warn('electron-updater not found; auto-updates disabled');
  store.set('autoUpdateEnabled', false);
}

// Read the persisted flag autoupdate flag
let autoUpdateEnabled = store.get('autoUpdateEnabled');

// tray state
let tray: Tray | null = null;
function createTray() {
  // load a high-res source (e.g. 64×64 PNG) and downsize to 32×32
  const rawIcon = nativeImage.createFromPath(
    join(__dirname, 'assets', 'tray-icon.png')
  );
  const trayIcon = rawIcon.resize({ width: 32, height: 32 });

  tray = new Tray(trayIcon);
  tray.setToolTip('Timeless Jewels Generator');
  tray.on('click', () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) w.show();
  });
}

// Try to load electron-window-state; fallback to manual Store if missing
let windowStateKeeper: typeof import('electron-window-state') | null = null;
try {
  require.resolve('electron-window-state');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  windowStateKeeper = require('electron-window-state');
} catch {
  console.log(
    'electron-window-state not installed; using manual window-state management'
  );
}

let state: ReturnType<typeof windowStateKeeper> | null = null;

// Initialize auto-clamp or manual state store
if (windowStateKeeper) {
  state = windowStateKeeper({
    defaultWidth : store.get('width'),
    defaultHeight: store.get('height'),
    defaultX     : store.get('x'),
    defaultY     : store.get('y')
  });
}

// Clamp helper to keep window fully on-screen
function clampToVisible(raw: Rectangle): Rectangle {
  const displays = screen.getAllDisplays().map((d) => d.workArea);
  const workArea =
    displays.find((area) =>
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

// Whitelist URL prefixes
const ALLOWED_URL_PREFIXES = [
  'file://',
  'https://github.com/BlazesRus/timeless-jewels/',
  'https://blazesrus.github.io/timeless-jewels/',
  'https://vilsol.github.io/timeless-jewels/',
  'https://github.com/vilsol/timeless-jewels/',
];

/** IPC: Renderer → Main logging & config **/
ipcMain.on('log-event', (_, data) => {
  log.info(`Renderer says: ${data}`);
});
ipcMain.handle('get-config', () => {
  if (state) {
    return { x: state.x, y: state.y, width: state.width, height: state.height };
  }
  return store.store;
});

// CrashReporter & uncaught exception logging
crashReporter.start({ companyName: 'BlazesRus', uploadToServer: false });
app.on('ready', () => log.info('App is ready'));
process.on('uncaughtException', (err) => log.error('Uncaught exception', err));

// Prevent multiple processes; open new window on second-instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', () => {
  createWindow();
});

/** Build the Application Menu **/
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac 
    ? [{label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }]}]
    : []),

    { label: 'Edit', role: 'editMenu' },

    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools', visible: !!process.env.VITE_DEV_SERVER_URL },
        { type: 'separator' },
        { role: 'resetzoom' }, { role: 'zoomin' }, { role: 'zoomout' }
      ]
    },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Enable Auto-Updates',
          type: 'checkbox',
          enabled: !!autoUpdater,
          checked: autoUpdateEnabled,
          click: async (menuItem) => {
            autoUpdateEnabled = menuItem.checked;
            store.set('autoUpdateEnabled', autoUpdateEnabled);
            if (autoUpdateEnabled && autoUpdater) {
              autoUpdater.checkForUpdatesAndNotify();
            }
          }
        },
        {
          label: 'Reposition on Display Removal',
          type: 'checkbox',
          checked: store.get('repositionOnDisplayRemoval'),
          click: (menuItem) => {
            store.set('repositionOnDisplayRemoval', menuItem.checked);
          }
        }
      ]
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        { label: 'Learn More', click: () => shell.openExternal('https://electronjs.org') }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function handleDisplayRemoved(_event: Event, removedDisplay: Display) {
  // 1) Honor user preference
  if (!store.get('repositionOnDisplayRemoval')) return;

  // 2) Grab the current window
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;

  // 3) Check if the window was on the removed display
  const winBounds = win.getBounds();
  const { x, y, width, height } = removedDisplay.bounds;
  const overlaps =
    winBounds.x < x + width &&
    winBounds.x + winBounds.width > x &&
    winBounds.y < y + height &&
    winBounds.y + winBounds.height > y;

  // 4) Only clamp if the window overlapped the removed display
  if (overlaps) {
    const clamped = clampToVisible(winBounds);
    win.setBounds(clamped);
  }
}

//If screen with App is turned off, instead move to current window if repositionOnDisplayRemoval setting is on
screen.on('display-removed', handleDisplayRemoved);

/** Create & configure a new BrowserWindow **/
function createWindow() {
  // Decide which source to use
  const raw = windowStateKeeper
    ? { x: state.x!, y: state.y!, width: state.width, height: state.height }
    : { x: store.x!, y: store.y!, width: store.width, height: store.height };

  // If not using state-keeper, center on first run
  if (!state && (raw.x == null || raw.y == null)) {
    const work = screen.getPrimaryDisplay().workArea;
    raw.x = work.x + (work.width  - raw.width)  / 2;
    raw.y = work.y + (work.height - raw.height) / 2;
  }

  // Clamp on any setup
  const { x, y, width, height } = clampToVisible(raw as Rectangle);

  const win = new BrowserWindow({ x, y, width, height, /* … */ });
  
  // Persist moves/resizes
  if (state) {
    state.manage(win);
  } else {
    win.on('close', () => {
      const b = win.getBounds();
      store.set({ x: b.x, y: b.y, width: b.width, height: b.height });
    });
  }

  // 4) Navigation lockdown & external links
  win.webContents.on('will-navigate', (e, url) => {
    if (!ALLOWED_URL_PREFIXES.some(p => url.startsWith(p))) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (ALLOWED_URL_PREFIXES.some(p => url.startsWith(p))) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 5) Crash-reload dialog for render failures
  win.webContents.on('render-process-gone',
    async (event, details) => {
      log.error('Renderer crashed:', details);
      const { response } = await dialog.showMessageBox(win, {
        type: 'error',
        title: 'Renderer Crash',
        message: 'The renderer process has crashed. Reload?',
        buttons: ['Reload', 'Close']
      });
      if (response === 0) win.reload();
      else win.close();
    }
  );

  // 6) Show & load URL/file
  win.once('ready-to-show', () => win.show());
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, 'index.html'));
  }

  // 7) Windows AppUserModelID
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.BlazesRus.TimelessJewelGen');
  }
}

/** App Ready: build menu, first window & register shortcuts **/
app.whenReady().then(() => {
  buildMenu();
  createWindow();

  // DevTools toggle (Ctrl+Shift+I)
  globalShortcut.register('Control+Shift+I', () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) w.webContents.toggleDevTools();
  });

  // Tray toggle (Ctrl+Shift+M)
  globalShortcut.register('Control+Shift+M', () => {
    if (!tray) createTray();
    else {
      tray.destroy();
      tray = null;
    }
  });
});

// Cleanup on quit
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
