### **Version Management**
```powershell
# Check current version
Set-Location frontend; Write-Host "🎯 Checking version status..." -ForegroundColor Cyan; node scripts/version-manager.js status

# Switch to Svelte 4
Set-Location frontend; Write-Host "🔄 Switching to Svelte 4..." -ForegroundColor Yellow; node scripts/version-manager.js switchTo4

# Switch to Svelte 5  
Set-Location frontend; Write-Host "🔄 Switching to Svelte 5..." -ForegroundColor Yellow; node scripts/version-manager.js switchTo5
```

### **Development Server**
```powershell
# Auto-detect version and start dev server
Set-Location frontend; Write-Host "🚀 Starting development server..." -ForegroundColor Green; pnpm run dev
```