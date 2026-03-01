# VaultLite Build Script
# Run this on a Windows machine with .NET 8 SDK installed

Write-Host "=== VaultLite Build Script ===" -ForegroundColor Cyan

# Clean previous builds
if (Test-Path "publish") {
    Remove-Item -Recurse -Force "publish"
}

# Create publish directory
New-Item -ItemType Directory -Path "publish" -Force | Out-Null

Write-Host "`nBuilding VaultLite..." -ForegroundColor Yellow

# Build framework-dependent single-file executable (smaller size, requires .NET 8 runtime on target)
dotnet publish -c Release `
    -r win-x64 `
    --self-contained false `
    -p:PublishSingleFile=true `
    -o "publish"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild successful!" -ForegroundColor Green
    
    # Copy README if exists
    $readmePath = Join-Path (Get-Location) "..\README.md"
    if (Test-Path $readmePath) {
        Copy-Item $readmePath "publish\" -Force
    }
    
    New-Item -ItemType Directory -Path "publish\data" -Force | Out-Null
    
    $exeSize = (Get-Item "publish\VaultLite.exe").Length / 1MB
    Write-Host "`nOutput: publish\VaultLite.exe ($([math]::Round($exeSize, 2)) MB)" -ForegroundColor Cyan
    Write-Host "`nTo run: Copy the 'publish' folder anywhere and double-click VaultLite.exe" -ForegroundColor Cyan
    Write-Host "Note: Target machine needs .NET 8 Desktop Runtime installed." -ForegroundColor Yellow
    
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
