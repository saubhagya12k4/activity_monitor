#!/bin/bash

# Activity Monitor Build Script
# Creates distributable packages for multiple platforms

set -e

echo "🚀 Building Activity Monitor Releases..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/*

# Build CSS
echo "🎨 Building CSS..."
npm run build-css:prod

# Create releases directory
mkdir -p releases

echo "📦 Building Linux AppImages..."
# Build Linux AppImage (works on all Linux distros)
npm run build:linux-appimage

# Copy built files to releases folder
echo "📁 Organizing releases..."
if [ -f "dist/Activity Monitor-1.0.0.AppImage" ]; then
    cp "dist/Activity Monitor-1.0.0.AppImage" "releases/ActivityMonitor-1.0.0-linux-x64.AppImage"
    echo "✅ Linux x64 AppImage created"
fi

if [ -f "dist/Activity Monitor-1.0.0-arm64.AppImage" ]; then
    cp "dist/Activity Monitor-1.0.0-arm64.AppImage" "releases/ActivityMonitor-1.0.0-linux-arm64.AppImage"
    echo "✅ Linux ARM64 AppImage created"
fi

# Create source package
echo "📦 Creating source package..."
tar -czf "releases/ActivityMonitor-1.0.0-source.tar.gz" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=releases \
    --exclude=.git \
    .

echo "✅ Source package created"

# Create installation script
cat > releases/install.sh << 'EOF'
#!/bin/bash

# Activity Monitor Installation Script

echo "🖱️ Activity Monitor Installer"
echo "=============================="

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    APPIMAGE="ActivityMonitor-1.0.0-linux-x64.AppImage"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    APPIMAGE="ActivityMonitor-1.0.0-linux-arm64.AppImage"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

# Check if AppImage exists
if [ ! -f "$APPIMAGE" ]; then
    echo "❌ $APPIMAGE not found in current directory"
    echo "Please download the correct AppImage for your architecture"
    exit 1
fi

# Make executable
chmod +x "$APPIMAGE"

# Create desktop entry
DESKTOP_FILE="$HOME/.local/share/applications/activity-monitor.desktop"
mkdir -p "$HOME/.local/share/applications"

cat > "$DESKTOP_FILE" << EOL
[Desktop Entry]
Name=Activity Monitor
Comment=Mouse and keyboard activity monitor with popup notifications
Exec=$(pwd)/$APPIMAGE
Icon=activity-monitor
Type=Application
Categories=Utility;
StartupNotify=true
EOL

echo "✅ Desktop entry created at $DESKTOP_FILE"
echo "✅ Installation complete!"
echo ""
echo "You can now:"
echo "  1. Run directly: ./$APPIMAGE"
echo "  2. Find it in your application menu under 'Activity Monitor'"
echo ""
echo "To uninstall, simply delete the AppImage file and:"
echo "  rm '$DESKTOP_FILE'"
EOF

chmod +x releases/install.sh

# Generate checksums
echo "🔐 Generating checksums..."
cd releases
sha256sum * > checksums.sha256
cd ..

# Display results
echo ""
echo "🎉 Build complete! Files created in 'releases/' directory:"
echo "==========================================="
ls -la releases/
echo ""
echo "📊 File sizes:"
du -h releases/*

echo ""
echo "🔗 Ready for distribution!"
echo "Upload the 'releases/' folder contents to your GitHub releases page"