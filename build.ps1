# VaultLite Build Script
# Run this on a Windows machine with .NET 8 SDK installed

Write-Host "=== VaultLite Build Script ===" -ForegroundColor Cyan

# Clean previous builds
if (Test-Path "publish") {
    Remove-Item -Recurse -Force "publish"
}

# Create publish directory
New-Item -ItemType Directory -Path "publish" -Force | Out-Null

Write-Host "`nBuilding VaultLite...`n" -ForegroundColor Yellow

# Build self-contained single-file executable for Windows
dotnet publish -c Release `
    -r win-x64 `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -p:PublishReadyToRun=true `
    -o "publish"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    
    # Copy README and data folder structure
    Copy-Item "..\README.md" "publish\" -Force
    
    New-Item -ItemType Directory -Path "publish\data" -Force | Out-Null
    
    $exeSize = (Get-Item "publish\VaultLite.exe").Length / 1MB
    Write-Host "`nOutput: publish\VaultLite.exe ($([math]::Round($exeSize, 2)) MB)" -ForegroundColor Cyan
    Write-Host "`nTo run: Copy the 'publish' folder anywhere and double-click VaultLite.exe`n" -ForegroundColor White
    
} else {
    Write-Host "`n✗ Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
