# 🛡️ Quick Backup Reference Card

## Emergency Recovery Commands

### Package.json Corrupted?
```bash
# Restore to Svelte 5 (default)
cp Svelte5PackageBackup.json package.json
pnpm install

# Restore to Svelte 4 (compatibility)
cp LegacyPackageBackup.json package.json
pnpm install
```

### Version Manager Not Working?
```bash
# Check file integrity
ls -la *Package*.json

# Restore template files
cp Svelte5PackageBackup.json Svelte5Package.json
cp LegacyPackageBackup.json LegacyPackage.json
```

### Complete System Reset
```bash
# 1. Restore to known working state
cp Svelte5PackageBackup.json package.json

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

```bash
# Current version
pnpm run test:version

# System status
node scripts/version-manager.js status

# File validation
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ Valid')"
```

## Backup Maintenance

```bash
# Update Svelte 5 backup (when using Svelte 5)
cp package.json Svelte5PackageBackup.json

# Switch to 4, update backup, return to 5
node scripts/version-manager.js switchTo4
cp package.json LegacyPackageBackup.json
node scripts/version-manager.js switchTo5
```

**Keep this card handy for quick recovery! 🚀**
