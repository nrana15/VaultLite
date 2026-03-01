#!/bin/bash
# VaultLite Build Script (Unix/macOS - for cross-compilation or testing)
# Note: For Windows EXE, you need Wine or build on Windows natively

echo "=== VaultLite Build Script ==="

cd VaultLite

# Clean previous builds
rm -rf publish

# Create publish directory
mkdir -p publish

echo ""
echo "Building VaultLite..."

# Build self-contained single-file executable for Linux (for testing)
dotnet publish -c Release \
    -r linux-x64 \
    --self-contained true \
    -p:PublishSingleFile=true \
    -p:IncludeNativeLibrariesForSelfExtract=true \
    -p:PublishReadyToRun=true \
    -o publish

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Build successful!"
    
    # Copy README and data folder structure
    cp ../README.md publish/
    mkdir -p publish/data
    
    EXE_SIZE=$(stat --printf="%s" publish/VaultLite 2>/dev/null || stat -f%z publish/VaultLite)
    EXE_SIZE_MB=$(echo "scale=2; $EXE_SIZE / 1048576" | bc)
    
    echo ""
    echo "Output: publish/VaultLite ($EXE_SIZE_MB MB)"
    echo ""
    echo "To run: chmod +x publish/VaultLite && ./publish/VaultLite"
else
    echo ""
    echo "✗ Build failed!"
    exit 1
fi
