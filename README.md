# 🖱️ Activity Monitor

An Electron application that monitors mouse and keyboard activity### ⚙️ **Configuration**

The application now includes a comprehensive settings menu accessible via:
- **Settings Button** in the main window
- **Menu Bar**: File → Settings
- **Keyboard Shortcut**: Ctrl+, (Cmd+, on macOS)

#### Settings Available:
- **⏰ Inactivity Timeout**: Set using HH:MM:SS format (1 second to 24 hours)
- **💬 Popup Message**: Customize the main popup message
- **🔄 Auto-close Timer**: How long popup stays visible (1-60 seconds)
- **🔊 Sound Notification**: Enable/disable popup sound
- **🎨 Theme**: Choose from Default, Blue, Green, or Purple themes

#### Dynamic Features:
- **Smart Subtitle**: Automatically generated based on your timeout setting
- **Real-time Validation**: Instant feedback on invalid settings
- **Test Popup**: Preview your settings before savingwith your custom mouse GIF when no activity is detected for 10 seconds. Built with Electron and uses `uv` for Python virtual environment management.

## ✨ Features

- 🖱️ **Smart Activity Monitoring**: Detects mouse and keyboard activity
- ⏰ **Configurable Timeout**: Shows popup after 10 seconds of inactivity (customizable)
- 🎨 **Beautiful Popup**: Animated popup with your custom mouse GIF
- 🎯 **Background Operation**: Runs hidden in background (system tray-like)
- ⌨️ **Global Hotkey**: Ctrl+Shift+M to show/hide main window
- 🔄 **Auto-Close**: Popup closes after 5 seconds or on any user interaction
- ▶️ **Start/Pause Control**: Full control over monitoring state
- 🛡️ **Fallback Support**: Works even if `robotjs` isn't available

## 🔧 Prerequisites

- **Node.js** (v16 or higher)
- **npm** package manager
- **uv** package manager (for Python virtual environment)
- **Linux**: Build tools for native modules

## 🚀 Quick Start

### 1. Installation

```bash
# Make setup script executable
chmod +x setup.sh

# Run the setup (installs dependencies and creates virtual env)
./setup.sh
```

### 2. Testing the Application

```bash
# Run in test mode (5 second timeout, visible window)
npm start
```

### 3. Production Mode

```bash
# Configure for production (10 second timeout, hidden window)
./production.sh

# Run in production mode
npm start
```

### 4. Install to System Menu (Linux)

```bash
# Install desktop entry to system applications menu
./install-desktop.sh
```

## 📁 Project Structure

```
timer_helper/
├── 🎬 wired-flat-1315-computer-mouse.gif  # Your mouse animation
├── �️ icon.png                            # Application icon/logo
├── �📄 main.js                             # Main Electron process
├── 🌐 index.html                          # Main monitoring window
├── 🌐 popup.html                          # Inactivity popup window
├── 📄 renderer.js                         # Main window logic
├── 🎨 styles.css                          # Application styling
├── 📦 package.json                        # Dependencies & scripts
├── 🖥️ mouse-activity-monitor.desktop      # Linux desktop entry
├── 🔧 setup.sh                           # Initial setup script
├── 🏭 production.sh                       # Production configuration
├── 📲 install-desktop.sh                  # Install to system menu
├── 🚀 start.sh                           # Simple launcher
├── 🧪 test.sh                            # Test mode launcher
└── 📖 README.md                          # This documentation
```

## 🎮 Usage

### Running the Application

| Command | Description | Window Visibility | Timeout |
|---------|-------------|-------------------|---------|
| `npm start` | Current configuration | Depends on setup | Configured |
| `./start.sh` | Production launcher | Hidden | 10 seconds |
| `./test.sh` | Test launcher | Visible | 5 seconds |

### Controls

- **Ctrl+Shift+M**: Show/hide main window
- **Ctrl+Shift+S**: Start monitoring
- **Ctrl+Shift+P**: Pause monitoring
- **Ctrl+,**: Open settings
- **Any activity**: Resets the inactivity timer
- **Any mouse/keyboard interaction**: Closes popup and resets timer
- **Ctrl+C in terminal**: Stops the application

## ⚙️ Configuration

### Change Inactivity Timeout

Edit `main.js`:
```javascript
if (timeSinceLastActivity >= 10000) { // 10000 = 10 seconds
  showPopup();
}
```

### Customize Popup Auto-Close Timer

Edit `main.js`:
```javascript
setTimeout(() => {
  hidePopup();
}, 5000); // 5000 = 5 seconds
```

### Switch Between Test and Production

```bash
# For testing (5 sec timeout, visible window)
./test.sh

# For production (10 sec timeout, hidden window)  
./production.sh && npm start
```

## 🎨 Customization

### Replace the Mouse GIF
Simply replace `wired-flat-1315-computer-mouse.gif` with your preferred animation.

### Modify Popup Appearance
Edit `styles.css` - look for `.popup-content` and related classes.

### Change Popup Message
Edit `popup.html` - modify the text in `.popup-message` and `.popup-subtitle`.

## 🔍 How It Works

1. **Startup**: Application starts with hidden/visible window based on configuration
2. **Monitoring**: 
   - With robotjs: Tracks actual mouse position changes
   - Fallback: Uses timer-based detection with app focus events
3. **Detection**: After configured timeout without activity, popup appears
4. **User Response**: Any interaction resets the timer
5. **Auto-Close**: Popup closes automatically after 5 seconds

## 🛠️ Troubleshooting

### robotjs Issues

**Linux Dependencies Missing:**
```bash
sudo apt-get update
sudo apt-get install build-essential libxtst-dev libpng++-dev libxinerama-dev libx11-dev
```

**Still not working?**
The app has a fallback mode that works without robotjs - it uses timer-based detection instead of real mouse tracking.

### Permission Issues (macOS)

1. System Preferences → Security & Privacy → Privacy
2. Select "Accessibility" 
3. Add Terminal or the Electron app

### Build Failures

```bash
# Clean and reinstall
rm -rf node_modules
npm install
```

## 🔧 Development

### Available Scripts

```bash
npm start          # Run the application
npm run dev        # Development mode  
npm run build      # Build for distribution
npm run dist       # Create distributable packages
```

### Virtual Environment

The project uses `uv` to create an isolated Python environment:
```bash
# Activate manually if needed
source mouse-activity-env/bin/activate
```

## 📋 System Requirements

- **OS**: Linux (tested), macOS, Windows
- **Node.js**: v16+
- **RAM**: ~50MB
- **Disk**: ~100MB with dependencies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use and modify as needed.

---

**Made with ❤️ using Electron and your custom mouse GIF!**

For support or questions, check the terminal output for helpful debugging information.