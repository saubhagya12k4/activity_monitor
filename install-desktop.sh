#!/bin/bash

# Install desktop entry for Activity Monitor
echo "🖥️  Installing desktop entry for Activity Monitor..."

# Make desktop entry executable
chmod +x activity-monitor.desktop

# Copy to applications directory
mkdir -p ~/.local/share/applications
cp activity-monitor.desktop ~/.local/share/applications/

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database ~/.local/share/applications/
fi

echo "✅ Desktop entry installed!"
echo "📍 You can now find 'Activity Monitor' in your application menu"
echo "🔧 To uninstall: rm ~/.local/share/applications/activity-monitor.desktop"