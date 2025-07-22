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

### **Copilot Chat Workflow Guidelines**

**⚠️ Important:** Recent updates to Copilot Chat cause the session to end early when long-running tasks (like `pnpm run dev`) are started through chat integration. To avoid wasting premium chat turns:

**Recommended Workflow:**
- Run the dev server manually in terminal using the commands above
- Use Copilot Chat for code changes, troubleshooting, and short-lived tasks only

**When requesting code changes from Copilot:**
- ✅ "Make the code change, but do not run the dev server and pause to prompt for confirmation before continuing"
- ✅ "Prompt me before running any long-running tasks that would end the chat session"
- ✅ "Make these changes and run a build to validate, but ask before starting any servers"

**Avoid in Chat:**
- ❌ Starting dev servers through chat/task integration (causes early session termination)
- ❌ Long-running background processes without explicit confirmation