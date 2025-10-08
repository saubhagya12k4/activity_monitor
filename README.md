# 🖱️ Activity Monitor

An Electron application that monitors mouse and keyboard activity and shows customizable popup notifications when no activity is detected. Built with Electron, Tailwind CSS, and includes comprehensive settings management.

## 📥 Download & Install

### Linux Downloads

[![Download DEB](https://img.shields.io/badge/Download-DEB%20Package-blue?style=for-the-badge&logo=debian)](https://github.com/saubhagya12k4/activity_monitor/raw/refs/heads/main/releases/activity-monitor_1.0.0_amd64.deb?download=)
[![Download AppImage](https://img.shields.io/badge/Download-AppImage-green?style=for-the-badge&logo=linux)](https://github.com/saubhagya12k4/activity_monitor/raw/refs/heads/main/releases/ActivityMonitor-1.0.0-linux-x64.AppImage?download=)

### Installation Methods

#### Method 1: DEB Package (Ubuntu/Debian)
```bash
# Download and install DEB package
wget https://github.com/saubhagya12k4/activity_monitor/raw/refs/heads/main/releases/activity-monitor_1.0.0_amd64.deb?download=
sudo dpkg -i activity-monitor_1.0.0_amd64.deb
# Fix dependencies if needed
sudo apt-get install -f
```

#### Method 2: AppImage (Universal Linux)
```bash
# Download AppImage
wget https://github.com/saubhagya12k4/activity_monitor/raw/refs/heads/main/releases/ActivityMonitor-1.0.0-linux-x64.AppImage?download=
# Make executable and run
chmod +x ActivityMonitor-1.0.0-linux-x64.AppImage
./ActivityMonitor-1.0.0-linux-x64.AppImage
```

#### Method 3: Build from Source
```bash
# Clone repository
git clone https://github.com/saubhagya12k4/activity_monitor.git
cd activity_monitor

# Setup and build
chmod +x setup.sh && ./setup.sh
npm run build:linux-deb
```

### System Requirements
- **Linux**: Ubuntu 18.04+, Debian 10+, or equivalent
- **Architecture**: x64 (AMD64)
- **Dependencies**: Auto-installed with DEB package

### Installation Verification

After installation, verify the application works:

```bash
# Check if installed (DEB package)
dpkg -l | grep activity-monitor

# Launch from command line
activity-monitor

# Or find in Applications menu
# Applications → Utilities → Activity Monitor
```

### Quick Start After Installation

1. **Launch** the application from the menu or command line
2. **Configure** settings using `Ctrl+,` or the settings button
3. **Start monitoring** - the app runs in system tray
4. **Test** by leaving the mouse idle for your configured timeout

## ✨ Features

- 🖱️ **Smart Activity Monitoring**: Detects mouse and keyboard activity using robotjs (with fallback support)
- ⏰ **Flexible Timeout Configuration**: Set inactivity timeout from 1 second to 24 hours using HH:MM:SS format
- 🎨 **Beautiful Popup Interface**: Clean, responsive popup with custom icon and messages
- 🔊 **Sound Notifications**: System notification sounds or custom audio file support (WAV, MP3, OGG, AAC, M4A, FLAC)
- 🎯 **System Tray Operation**: Runs in system tray with global shortcuts
- ⌨️ **Global Shortcuts**: 
  - `Ctrl+Shift+M` to show/hide main window
  - `Ctrl+,` to open settings
  - `Ctrl+Shift+S/P` to start/pause monitoring
- 🔄 **Smart Auto-Close**: Popup timing based on sound duration or configurable timeout
- ▶️ **Full Control**: Start/Pause monitoring with real-time status updates
- 🛡️ **Robust Fallback**: Works even without robotjs dependencies
- 🌙 **Dark Mode Support**: Automatic system theme detection
- 🖥️ **Linux Desktop Integration**: Includes desktop entry for application menu

## 🔧 Prerequisites

- **Node.js** (v16 or higher)
- **npm** package manager
- **uv** package manager (for Python virtual environment)
- **Linux**: Build tools for native modules (optional for robotjs)

## ⚙️ Configuration

The application includes a comprehensive settings interface accessible via:
- **Settings Button** in the main window
- **Menu Bar**: File → Settings
- **Keyboard Shortcut**: `Ctrl+,` (or `Cmd+,` on macOS)

### Settings Available:

#### ⏰ **Inactivity Timeout**
- **Format**: Hours:Minutes:Seconds (HH:MM:SS)
- **Range**: 1 second to 24 hours
- **Default**: 5 seconds (testing mode)
- **Example**: `00:01:30` = 1 minute 30 seconds

#### 💬 **Popup Message**
- **Purpose**: Main message displayed in popup
- **Default**: "Saubhagya you haven't move the mouse"
- **Length**: Up to 50 characters
- **Dynamic Subtitle**: Automatically shows actual timeout duration

#### 🔄 **Auto-close Timeout**
- **Range**: 1-60 seconds
- **Default**: 2 seconds
- **Behavior**: When sound is enabled, timing is controlled by sound duration
- **Note**: Disabled when sound notifications are active

#### 🔊 **Sound Notifications**
- **System Sound**: Built-in two-tone notification beep
- **Custom Audio**: Upload your own sound file
- **Supported Formats**: WAV, MP3, OGG, AAC, M4A, FLAC
- **Test Function**: Preview sounds before saving
- **Smart Timing**: Popup auto-closes after sound finishes

#### Advanced Features:
- **Real-time Validation**: Instant feedback on settings
- **Dynamic UI**: Settings interface adapts based on selections
- **Persistent Storage**: Settings saved automatically in [`settings.json`](settings.json)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the project
cd timer_helper

# Make setup script executable
chmod +x setup.sh

# Run the setup (installs dependencies and creates virtual env)
./setup.sh
```

### 2. Running the Application

```bash
# Build CSS and start the application
npm start

# Or use the launcher script
chmod +x start.sh
./start.sh
```

### 3. Install to System Menu (Linux)

```bash
# Install desktop entry to system applications menu
chmod +x install-desktop.sh
./install-desktop.sh
```

## � Available Packages

### Linux Packages

| Package Type | Architecture | Size | Description |
|--------------|--------------|------|-------------|
| **DEB** | x64 (amd64) | ~120MB | Ubuntu/Debian package with system integration |
| **AppImage** | x64 | ~130MB | Universal Linux package (portable) |
| **RPM** | x64 | ~120MB | RedHat/Fedora/SUSE package |

### Package Features

- **DEB Package**: 
  - Automatic dependency installation
  - System menu integration
  - Auto-updater support
  - Service integration

- **AppImage**: 
  - No installation required
  - Portable executable
  - Works on most Linux distributions
  - Sandboxed environment

### Latest Release Information

```bash
# Check latest release
curl -s https://api.github.com/repos/saubhagya12k4/activity_monitor/releases/latest | grep tag_name

# Download specific version
wget https://github.com/saubhagya12k4/activity_monitor/releases/download/v1.0.0/activity-monitor_1.0.0_amd64.deb
```

## �📁 Project Structure

```
timer_helper/
├── 🖼️ icon.png                            # Application icon
├── 🖼️ popup_icon.png                      # Popup notification icon  
├── 📄 main.js                             # Main Electron process
├── 🌐 index.html                          # Main monitoring window
├── 🌐 popup.html                          # Inactivity popup window
├── 🌐 settings.html                       # Settings configuration window
├── 📄 renderer.js                         # Main window renderer logic
├── 📄 settings-renderer.js                # Settings window logic
├── 🎨 src/input.css                       # Tailwind CSS source
├── 🎨 tailwind.config.js                  # Tailwind configuration
├── 📦 package.json                        # Dependencies & build scripts
├── ⚙️ settings.json                       # User configuration file
├── 🖥️ activity-monitor.desktop            # Linux desktop entry
├── 🔧 setup.sh                           # Development setup script
├── 🚀 start.sh                           # Application launcher
├── 📲 install-desktop.sh                  # Desktop integration installer
├── 🏗️ build-releases.sh                   # Release builder script
├── 📦 releases/                           # Built distribution files
├── 🙈 .gitignore                         # Git ignore rules
└── 📖 README.md                          # This documentation
```

## 🎮 Usage

### Available Commands

| Command | Description | Window Behavior | Timeout |
|---------|-------------|-----------------|---------|
| `npm start` | Production mode | Hidden (tray) | From settings |
| `npm run dev` | Development mode | Visible | From settings |
| `./start.sh` | Quick launcher | Hidden (tray) | From settings |

### Global Shortcuts

- **`Ctrl+Shift+M`**: Show/hide main window
- **`Ctrl+Shift+S`**: Start monitoring
- **`Ctrl+Shift+P`**: Pause monitoring
- **`Ctrl+,`**: Open settings
- **Any activity**: Resets the inactivity timer
- **Any mouse/keyboard interaction**: Closes popup and resets timer
- **Ctrl+C in terminal**: Stops the application

### System Tray

The application runs in the system tray with:
- **Double-click**: Toggle main window visibility
- **Right-click**: Context menu with full controls
- **Status indicator**: Shows monitoring state
- **Quick actions**: Start/pause, settings, quit

## 🔍 How It Works

### Activity Detection

1. **Primary Method (robotjs)**: Real mouse position tracking
2. **Fallback Method**: Timer-based detection with app focus events
3. **Multi-window**: Detects activity across all application windows
4. **Global Events**: Monitors system-wide activity when robotjs is available

### Monitoring Flow

1. **Startup**: Application initializes in system tray
2. **Background Monitoring**: Continuous activity checking every second
3. **Inactivity Detection**: Triggers after configured timeout
4. **Popup Display**: Shows notification with sound (if enabled)
5. **User Response**: Any interaction resets timer
6. **Auto-Close**: Popup closes based on sound duration or timeout

### Sound System

- **System Notifications**: Generated two-tone beeps using Web Audio API
- **Custom Sounds**: HTML5 audio with duration-based timing
- **Error Handling**: Automatic fallback to system sounds
- **Performance**: Efficient audio processing in popup window

## 🛠️ Build & Development

### Available Scripts

```bash
# Development
npm run dev              # Development mode with visible window
npm run build-css:dev    # Build Tailwind CSS for development
npm run watch-css        # Watch Tailwind CSS changes

# Production
npm start               # Production mode (background)
npm run build-css:prod  # Build optimized Tailwind CSS
npm run build           # Build Electron application

# Distribution
npm run dist            # Create distributable packages
npm run build:all       # Build for all platforms (requires platform tools)
npm run build:linux     # Linux packages (DEB, AppImage, RPM)
npm run build:linux-appimage  # Linux AppImage only
npm run build:windows   # Windows packages (requires Wine on Linux)
npm run build:mac       # macOS packages (requires macOS)

# Release Management
./build-releases.sh     # Create complete release package
```

### CSS Development

The application uses Tailwind CSS with custom system integration:

```bash
# Build CSS for development (with source maps)
npm run build-css:dev

# Build CSS for production (minified)
npm run build-css:prod

# Watch for changes during development
npm run watch-css
```

### Custom Styling

- **Tailwind source**: [`src/input.css`](src/input.css) - Tailwind components
- **Configuration**: [`tailwind.config.js`](tailwind.config.js) - Custom theme
- **Output**: `dist/styles.css` - Generated stylesheet

### Creating Releases

```bash
# Build complete release package
./build-releases.sh

# This creates:
# - Linux AppImages (x64 and ARM64)
# - Source code archive
# - Installation script
# - Checksums for verification
```

## 🔧 Troubleshooting

### robotjs Issues

**Linux Dependencies Missing:**
```bash
# Install required system libraries
sudo apt-get update
sudo apt-get install build-essential libxtst-dev libpng++-dev libxinerama-dev libx11-dev

# Rebuild native modules
npm run rebuild
```

**Still not working?**
The app includes a robust fallback system that works without robotjs. It uses timer-based detection instead of real mouse tracking.

### Permission Issues (macOS)

1. **System Preferences** → **Security & Privacy** → **Privacy**
2. Select **"Accessibility"**
3. Add **Terminal** or the **Electron app**
4. Restart the application

### X11/Linux Display Issues

The application includes extensive X11 compatibility fixes:
- GPU acceleration disabled for stability
- Modal window fallbacks for problematic X11 setups
- Proper window type handling
- Display environment variable handling

### Audio Issues

**Custom sound not playing:**
- Verify file format (WAV, MP3, OGG, AAC, M4A, FLAC)
- Check file permissions
- Test with system sound first
- Use "Test" button in settings

### Build Failures

```bash
# Clean installation
rm -rf node_modules dist releases
npm install

# Rebuild native dependencies
npm run rebuild

# Check Node.js version (requires v16+)
node --version
```

## 📋 System Requirements

- **Operating System**: Linux (primary), macOS, Windows
- **Node.js**: v16 or higher
- **Memory**: ~50MB runtime usage
- **Storage**: ~100MB with dependencies
- **Display**: X11 (Linux), native (macOS/Windows)

### Optional Dependencies

- **robotjs**: Enhanced mouse tracking (requires build tools)
- **Native modules**: Better system integration
- **System tray**: Platform-specific tray implementations

## 🚀 Performance & Optimization

### Resource Usage
- **CPU**: Minimal (1-second interval checks)
- **Memory**: ~50MB baseline + Electron overhead
- **Network**: None (fully offline)
- **Disk**: Settings auto-save only

### Linux-Specific Optimizations
- X11 compatibility layer
- GPU acceleration disabled for stability
- Efficient window management
- Proper desktop integration

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature-name`
3. **Make** changes with proper testing
4. **Update** documentation if needed
5. **Submit** pull request with detailed description

### Development Guidelines
- Test on multiple Linux distributions
- Verify both robotjs and fallback modes
- Check X11 compatibility
- Validate settings persistence
- Test audio functionality

## 📄 License

MIT License - Free to use, modify, and distribute.

## 🔗 Related Files

- **Settings**: [`settings.json`](settings.json) - User configuration
- **Desktop Entry**: [`activity-monitor.desktop`](activity-monitor.desktop) - Linux integration
- **Icons**: [`icon.png`](icon.png), [`popup_icon.png`](popup_icon.png) - Application assets
- **Scripts**: [`setup.sh`](setup.sh), [`start.sh`](start.sh), [`install-desktop.sh`](install-desktop.sh), [`build-releases.sh`](build-releases.sh)
- **Releases**: [`releases/`](releases/) - Built distribution packages

---

**🎯 Built with Electron, Tailwind CSS, and modern web technologies for reliable cross-platform activity monitoring.**

For support or issues, check the terminal output for debugging information and ensure all dependencies are properly installed.
