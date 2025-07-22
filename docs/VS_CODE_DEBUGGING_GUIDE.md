# VS Code Browser Debugging Guide

## Overview
This guide explains how to debug your Timeless Jewel Calculator directly within VS Code using the integrated browser tools and external browser debugging.

## Available Debugging Methods

### 1. Microsoft Edge DevTools (Built-in to VS Code)
**Best for:** Real-time debugging, DOM inspection, network monitoring

**How to use:**
1. Start your dev server: `Ctrl+Shift+P` → "Tasks: Run Task" → "Dev Server (Auto-detect Version)"
2. Press `F5` and select "Debug Frontend in Edge"
3. Or use Command Palette: `Ctrl+Shift+P` → "Microsoft Edge Tools: Open DevTools"
4. The Edge DevTools will open directly in VS Code

**Features:**
- ✅ Console access within VS Code
- ✅ Element inspection
- ✅ Network tab for WASM loading debugging
- ✅ Source mapping support
- ✅ Breakpoint debugging in TypeScript/JavaScript

### 2. Firefox Debugging
**Best for:** Cross-browser testing, Firefox-specific debugging

**How to use:**
1. Start your dev server
2. Press `F5` and select "Debug Frontend in Firefox"
3. Firefox will launch and connect to VS Code debugger

**Features:**
- ✅ Breakpoint debugging
- ✅ Variable inspection
- ✅ Console output in VS Code Debug Console

### 3. Live Preview (Microsoft) ✅ INSTALLED
**Best for:** Development with auto-refresh, embedded DevTools

**How to use:**
1. Start your dev server: `Ctrl+Shift+P` → "Tasks: Run Task" → "Dev Server (Auto-detect Version)"
2. `Ctrl+Shift+P` → "Live Preview: Show Preview"
3. Or click the preview icon in the status bar
4. Or run task: `Ctrl+Shift+P` → "Tasks: Run Task" → "Live Preview (VS Code)"

**Features:**
- ✅ Embedded browser with DevTools in VS Code
- ✅ Auto-refresh on file save
- ✅ F12 for built-in developer tools
- ✅ Right-click "Inspect Element" support
- ✅ Network monitoring for WASM debugging
- ✅ Console access within VS Code

**Pro Tip:** Use Live Preview for development and Edge DevTools (F5) for advanced debugging!

### 4. Simple Browser (Built-in)
### 4. Simple Browser (Built-in)
**Best for:** Quick previews without leaving VS Code

**How to use:**
1. `Ctrl+Shift+P` → "Simple Browser: Show"
2. Enter URL: `http://localhost:5173/timeless-jewels`

**Features:**
- ✅ Embedded browser in VS Code
- ✅ Basic navigation
- ❌ Limited DevTools access

### 5. Live Server Extensions
**Best for:** Auto-refresh during development

**Extensions installed:**
- Live Preview (Microsoft)
- Live Server (Ritwick Dey)

## Debugging WASM Loading Issues

### Current WASM Debug Features
The WASM loader includes extensive debugging:

1. **Console Logging:** Check the browser console for:
   - 🔥 WASM loader version messages
   - 🔍 Path debugging information
   - 📡 Loading progress updates
   - ✅/❌ Success/failure indicators

2. **Debug UI:** The ModernHomePage shows:
   - Loading status and progress
   - Error messages (up to 10 recent errors)
   - WASM state information
   - Manual retry button

### Debugging Steps for WASM Issues:

1. **Check Network Tab:**
   - Open Edge DevTools → Network tab
   - Look for WASM file requests
   - Verify the correct path is being requested
   - Check for 404 errors

2. **Console Debugging:**
   - Look for debug messages starting with 🔥, 🔍, 📡
   - Check if the base path is correct: `/timeless-jewels`
   - Verify the WASM file paths being attempted

3. **Manual Verification:**
   - Test direct access: `http://localhost:5173/timeless-jewels/calculator.wasm`
   - Should return HTTP 200 with `Content-Type: application/wasm`

## Build Folder Context

The build output has been properly configured for your workspace:

### Svelte 5 (Modern Mode) - Current
- **Location:** `.svelte-kit/output/client/` (added as "Svelte 5 Build Output" folder)
- **Structure:**
  ```
  .svelte-kit/output/client/
  ├── calculator.wasm         ✅ Your WASM file
  ├── wasm_exec.js           ✅ Go WASM runtime
  ├── favicon.png            ✅ Static assets
  ├── mf-academy-logo.png    ✅ Static assets
  └── _app/                  ✅ SvelteKit app bundle
      ├── immutable/
      │   ├── assets/        (CSS, fonts)
      │   ├── chunks/        (JS modules)
      │   ├── entry/         (App entry points)
      │   ├── nodes/         (Route components)
      │   └── workers/       (Service workers)
      └── version.json
  ```

### Svelte 4 (Legacy Mode)
- **Location:** `frontend/build/` (added as "Svelte 4 Build Output" folder)
- **Purpose:** Static build output when using Svelte 4 mode

### Testing Production Build
```bash
# Build the production version
pnpm run build

# Preview the production build
Ctrl+Shift+P → "Tasks: Run Task" → "Preview Production Build"
# Or manually: npx serve .svelte-kit/output/client -l 3001
```



## Quick Commands

### Start Live Preview Session:
```bash
# 1. Start dev server (if not already running)
pnpm run dev

# 2. In VS Code: Ctrl+Shift+P → "Live Preview: Show Preview"
# 3. Or run task: Ctrl+Shift+P → "Tasks: Run Task" → "Live Preview (VS Code)"
```

### Start Advanced Debugging Session:
```bash
# 1. Start dev server
pnpm run dev

# 2. In VS Code: Press F5 → Select "Debug Frontend in Edge"
```

### Manual WASM Test:
```bash
# Test WASM accessibility
curl -I http://localhost:5173/timeless-jewels/calculator.wasm
```

### Clear Browser Cache:
```bash
# Hard refresh in browser
Ctrl+F5  # or Ctrl+Shift+R
```

## Troubleshooting

### If DevTools don't appear:
1. Ensure Microsoft Edge Tools extension is enabled
2. Try `Ctrl+Shift+P` → "Microsoft Edge Tools: Launch Edge DevTools"
3. Check if Edge browser is installed

### If Firefox debugging fails:
1. Ensure Firefox is installed and accessible
2. Check if Firefox is set as default browser in Live Server settings
3. Verify the launch configuration in `.vscode/launch.json`

### If WASM still won't load:
1. Check the debug console output for the 🔥 message confirming updated loader
2. Verify all paths being attempted include `/timeless-jewels/` base
3. Try manual retry button in the debug UI
4. Check browser cache hasn't interfered (try incognito mode)

## Extensions Configured

The following extensions enhance your debugging experience:
- ✅ Microsoft Edge Tools for VS Code (installed)
- ✅ Debugger for Firefox (installed) 
- ✅ Live Preview (Microsoft) (installed) - **NEW!**
- 🔄 Live Server (recommended to install)
- 🔄 Open in Default Browser (recommended to install)

**Next recommended extensions:**
```vscode-extensions
ritwickdey.liveserver,peakchen90.open-html-in-browser
```
