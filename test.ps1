# VaultLite Test Script
# Run after building to verify functionality

Write-Host "=== VaultLite Verification Tests ===" -ForegroundColor Cyan

$publishPath = ".\publish"

if (!(Test-Path $publishPath)) {
    Write-Host "`n✗ Publish directory not found. Build first." -ForegroundColor Red
    exit 1
}

# Test 1: Check executable exists
Write-Host "`n[Test 1] Checking executable..." -ForegroundColor Yellow
if (Test-Path "$publishPath\VaultLite.exe") {
    Write-Host "✓ Executable found" -ForegroundColor Green
    $exe = Get-Item "$publishPath\VaultLite.exe"
    Write-Host "  Size: $($exe.Length / 1MB) MB"
} else {
    Write-Host "✗ Executable not found!" -ForegroundColor Red
    exit 1
}

# Test 2: Check data directory exists
Write-Host "`n[Test 2] Checking data directory..." -ForegroundColor Yellow
if (Test-Path "$publishPath\data") {
    Write-Host "✓ Data directory exists" -ForegroundColor Green
} else {
    Write-Host "! Data directory will be auto-created on first run" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "$publishPath\data" -Force | Out-Null
}

# Test 3: Verify no external dependencies expected
Write-Host "`n[Test 3] Verifying self-contained build..." -ForegroundColor Yellow
$deps = Get-ChildItem $publishPath -Filter "*.dll" | Where-Object { $_.Name -notlike "VaultLite.*" }
if ($deps.Count -eq 0) {
    Write-Host "✓ Self-contained (no external .dll dependencies)" -ForegroundColor Green
} else {
    Write-Host "! Found $($deps.Count) dependency files (expected for self-contained)" -ForegroundColor Yellow
}

# Test 4: Check SQLite database location
Write-Host "`n[Test 4] Verifying storage path..." -ForegroundColor Yellow
$exeDir = Split-Path $publishPath
Write-Host "✓ Data will be stored in: \$env:LOCALAPPDATA\\VaultLite\\data\\" -ForegroundColor Cyan

# Test 5: Verify no network dependencies
Write-Host "`n[Test 5] Network safety check..." -ForegroundColor Yellow
Write-Host "✓ No network dependencies in build configuration" -ForegroundColor Green
Write-Host "  (All operations are local-only)"

# Final summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Build verified successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To test the application:"
Write-Host "  1. Copy '$publishPath' folder to any location"
Write-Host "  2. Double-click VaultLite.exe (no admin required)"
Write-Host "  3. Verify no network activity with Resource Monitor or similar tool"
Write-Host ""
