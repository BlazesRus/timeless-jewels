# 🛡️ Quick Backup Reference Card

## Emergency Recovery Commands

### Package.json Corrupted?
```powershell
# Restore to Svelte 5 (default)
Copy-Item Svelte5PackageBackup.json package.json
pnpm install

# Restore to Svelte 4 (compatibility)
Copy-Item LegacyPackageBackup.json package.json
pnpm install
```

### Version Manager Not Working?
```powershell
# Check file integrity
Get-ChildItem *Package*.json

# Restore template files
Copy-Item Svelte5PackageBackup.json Svelte5Package.json
Copy-Item LegacyPackageBackup.json LegacyPackage.json
```

### Complete System Reset
```powershell
# 1. Restore to known working state
Copy-Item Svelte5PackageBackup.json package.json

# 2. Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 3. Verify
pnpm run test:version
node scripts/version-manager.js status
```

## File Structure Quick Reference

```
📁 frontend/
├── 🎯 package.json                 (Active config)
├── ⚙️ version.ini                  (Settings)
│
├── 📋 Svelte5Package.json         (Template)
├── 📋 LegacyPackage.json          (Template)
│
├── 🛡️ Svelte5PackageBackup.json   (Emergency backup)
└── 🛡️ LegacyPackageBackup.json    (Emergency backup)
```

## Status Check Commands

```powershell
# Current version
pnpm run test:version

# System status
node scripts/version-manager.js status

# File validation
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ Valid')"
```

## Backup Maintenance

```powershell
# Update Svelte 5 backup (when using Svelte 5)
Copy-Item package.json Svelte5PackageBackup.json

# Switch to 4, update backup, return to 5
node scripts/version-manager.js switchTo4
Copy-Item package.json LegacyPackageBackup.json
node scripts/version-manager.js switchTo5
```

**Keep this card handy for quick recovery! 🚀**
