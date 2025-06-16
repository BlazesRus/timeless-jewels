# Svelte 5 and Vite 6 Upgrade Script
# This script updates package.json to support both Svelte 4 and Svelte 5

Write-Host "Starting Svelte 5 and Vite 6 upgrade preparation..." -ForegroundColor Green

# Read current package.json
$packageJsonPath = ".\frontend\package.json"
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json

Write-Host "Current Svelte version: $($packageJson.devDependencies.svelte)" -ForegroundColor Yellow

# Create backup
Copy-Item $packageJsonPath "$packageJsonPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Created backup of package.json" -ForegroundColor Cyan

# Update Vite to version 6
$packageJson.devDependencies.vite = "^6.0.0"

# Update SvelteKit to latest compatible version
$packageJson.devDependencies.'@sveltejs/kit' = "^2.0.0"
$packageJson.devDependencies.'@sveltejs/adapter-static' = "^3.0.0"

# Add Svelte 5 as an optional dependency for testing
# Keep Svelte 4 as default for now
$packageJson.devDependencies.svelte = "^4.2.0"

# Add new scripts for version management
if (-not $packageJson.scripts) {
    $packageJson.scripts = @{}
}

$packageJson.scripts.'dev:svelte4' = "vite dev"
$packageJson.scripts.'dev:svelte5' = "npm install svelte@^5.0.0 && vite dev"
$packageJson.scripts.'build:svelte4' = "vite build"
$packageJson.scripts.'build:svelte5' = "npm install svelte@^5.0.0 && vite build"
$packageJson.scripts.'test:version' = "node -e `"console.log('Svelte version:', require('svelte/package.json').version)`""

# Add new dependencies for modern UI components (Svelte 5 compatible)
if (-not $packageJson.devDependencies) {
    $packageJson.devDependencies = @{}
}

# Keep svelte-select for Svelte 4 compatibility
# svelte-select is already in the dependencies

# Update TypeScript and related tools
$packageJson.devDependencies.typescript = "^5.8.3"
$packageJson.devDependencies.'@typescript-eslint/eslint-plugin' = "^8.34.0"
$packageJson.devDependencies.'@typescript-eslint/parser' = "^8.34.0"

# Add Svelte 5 specific tooling (optional for now)
$packageJson.devDependencies.'svelte-check' = "^4.0.0"

# Update other dependencies to latest compatible versions
$packageJson.devDependencies.eslint = "^9.0.0"
$packageJson.devDependencies.'eslint-config-prettier' = "^9.0.0"
$packageJson.devDependencies.'eslint-plugin-svelte' = "^4.0.0"
$packageJson.devDependencies.prettier = "^3.0.3"
$packageJson.devDependencies.'prettier-plugin-svelte' = "^3.0.3"

# Add version detection support
$packageJson.devDependencies.'@types/node' = "^22.0.0"

# Ensure proper module type
$packageJson.type = "module"

# Add engines specification
if (-not $packageJson.engines) {
    $packageJson.engines = @{}
}
$packageJson.engines.node = ">=18.0.0"
$packageJson.engines.pnpm = ">=10.0.0"

# Write updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath

Write-Host "Updated package.json successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Yellow
Write-Host "✓ Updated Vite to ^6.0.0" -ForegroundColor Green
Write-Host "✓ Updated SvelteKit to ^2.0.0" -ForegroundColor Green
Write-Host "✓ Added version-specific dev/build scripts" -ForegroundColor Green
Write-Host "✓ Updated TypeScript and ESLint" -ForegroundColor Green
Write-Host "✓ Added version detection support" -ForegroundColor Green
Write-Host "✓ Kept Svelte 4 as default (ready for Svelte 5)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'pnpm install' to update dependencies" -ForegroundColor White
Write-Host "2. Test with 'pnpm run dev:svelte4'" -ForegroundColor White
Write-Host "3. When ready, test Svelte 5 with 'pnpm run dev:svelte5'" -ForegroundColor White
Write-Host "4. Use the version-aware system to support both versions" -ForegroundColor White
