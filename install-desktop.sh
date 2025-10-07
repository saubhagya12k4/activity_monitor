#!/bin/bash

# Install desktop entry for Activity Monitor
echo "🖥️  Installing desktop entry for Activity Monitor..."

DESKTOP_FILE="activity-monitor.desktop"
APPS_DIR="$HOME/.local/share/applications"
ICONS_DIR="$HOME/.local/share/icons/hicolor"
PIXMAPS_DIR="$HOME/.local/share/pixmaps"

# Create directories if they don't exist
mkdir -p "$APPS_DIR"
mkdir -p "$ICONS_DIR/256x256/apps"
mkdir -p "$ICONS_DIR/128x128/apps"
mkdir -p "$ICONS_DIR/64x64/apps"
mkdir -p "$ICONS_DIR/48x48/apps"
mkdir -p "$ICONS_DIR/32x32/apps"
mkdir -p "$ICONS_DIR/16x16/apps"
mkdir -p "$PIXMAPS_DIR"

# Make desktop entry executable
chmod +x "$DESKTOP_FILE"

# Copy desktop file
cp "$DESKTOP_FILE" "$APPS_DIR/"

# Copy icon to multiple sizes (resize if ImageMagick is available)
if command -v convert &> /dev/null; then
    echo "🖼️  Creating multiple icon sizes..."
    convert "icon.png" -resize 256x256 "$ICONS_DIR/256x256/apps/activity-monitor.png"
    convert "icon.png" -resize 128x128 "$ICONS_DIR/128x128/apps/activity-monitor.png"
    convert "icon.png" -resize 64x64 "$ICONS_DIR/64x64/apps/activity-monitor.png"
    convert "icon.png" -resize 48x48 "$ICONS_DIR/48x48/apps/activity-monitor.png"
    convert "icon.png" -resize 32x32 "$ICONS_DIR/32x32/apps/activity-monitor.png"
    convert "icon.png" -resize 16x16 "$ICONS_DIR/16x16/apps/activity-monitor.png"
else
    echo "📋 ImageMagick not found, using original icon size"
    cp "icon.png" "$ICONS_DIR/256x256/apps/activity-monitor.png"
fi

# Copy to pixmaps as fallback
cp "icon.png" "$PIXMAPS_DIR/activity-monitor.png"

# Update desktop and icon cache
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$APPS_DIR"
    echo "🔄 Desktop database updated"
fi

if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache "$ICONS_DIR" 2>/dev/null || true
    echo "🎨 Icon cache updated"
fi

echo "✅ Desktop entry installed!"
echo "📍 You can now find 'Activity Monitor' in your application menu"
echo "ℹ️  If the icon doesn't appear immediately, try logging out and back in"
echo "🔧 To uninstall: rm ~/.local/share/applications/activity-monitor.desktop"