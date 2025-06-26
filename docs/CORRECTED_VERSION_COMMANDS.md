# Corrected Version Management Commands

## **Updated User Instructions**

When generating code, please follow these user provided coding instructions:

### **Version Management**
```powershell
# Check current version status  
Set-Location frontend; Write-Host "🎯 Checking version status..." -ForegroundColor Cyan; pnpm run:mode:status

# Switch to Svelte 4
Set-Location frontend; Write-Host "🔄 Switching to Svelte 4..." -ForegroundColor Yellow; pnpm run:mode:legacy

# Switch to Svelte 5  
Set-Location frontend; Write-Host "🔄 Switching to Svelte 5..." -ForegroundColor Yellow; pnpm run:mode:modern
```

### **Development Server**
```powershell
# Auto-detect version and start dev server
Set-Location frontend; Write-Host "🚀 Starting development server..." -ForegroundColor Green; pnpm run dev
```

### **Available NPM Scripts**

#### **Mode Management**
- `pnpm run mode:status` - Check current SVELTE_MODE
- `pnpm run install:legacy` - Switch to Svelte 4 dependencies  
- `pnpm run install:modern` - Switch to Svelte 5 dependencies

#### **Development**
- `pnpm run dev` - Auto-detect version and start dev server
- `pnpm run dev:legacy` - Start dev server with Svelte 4
- `pnpm run dev:modern` - Start dev server with Svelte 5
- `pnpm run dev:svelte4` - Alias for dev:legacy
- `pnpm run dev:svelte5` - Alias for dev:modern

#### **Build**
- `pnpm run build` - Build with current version
- `pnpm run build:legacy` - Build with Svelte 4
- `pnpm run build:modern` - Build with Svelte 5  
- `pnpm run build:svelte4` - Alias for build:legacy
- `pnpm run build:svelte5` - Alias for build:modern

#### **Type Checking**
- `pnpm run check` - Type check with current version
- `pnpm run check:legacy` - Type check with Svelte 4 config
- `pnpm run check:modern` - Type check with Svelte 5 config
- `pnpm run check:watch` - Type check in watch mode

#### **Version Info**
- `pnpm run test:version` - Show installed Svelte version
- `pnpm run version:status` - Detailed version manager status
- `pnpm run version:help` - Version manager help

#### **Linting & Formatting**
- `pnpm run lint` - Run ESLint and Prettier checks
- `pnpm run format` - Format code with Prettier
- `pnpm run lint:css` - Lint CSS files
- `pnpm run lint:css:svelte` - Lint CSS in Svelte files
- `pnpm run lint:css:fix` - Fix CSS linting issues

## **VS Code Tasks Available**

The following tasks can be run using Ctrl+Shift+P → "Tasks: Run Task":

- **Check Version Configuration** - Shows current mode and version status
- **Switch to Svelte 4** - Switch to legacy mode
- **Switch to Svelte 5** - Switch to modern mode  
- **Dev Server (Auto-detect Version)** - Start development server
- **Build (Current Version)** - Build with current version
- **Install Dependencies** - Install dependencies for current mode
- **Validate Project Structure** - Check project file structure

## **Environment Variables**

- `SVELTE_MODE=legacy` - Use Svelte 4 configuration
- `SVELTE_MODE=modern` - Use Svelte 5 configuration (default)

## **Key Benefits**

1. **Simple Commands**: Use familiar `pnpm run` commands
2. **Auto-Detection**: `pnpm run dev` automatically detects version
3. **Explicit Control**: Use `:legacy` or `:modern` suffixes for specific versions
4. **Cross-Platform**: Works on Windows, macOS, and Linux
5. **Fast Switching**: Dependency switching handled by pnpmfile.cjs
