const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, dialog, Tray, Notification, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let robot;
let mainWindow;
let popupWindow;
let settingsWindow;
let tray;
let lastActivity = Date.now();
let activityCheckInterval;
let mousePosition = { x: 0, y: 0 };
let robotjsAvailable = false;
let popupShown = false;
let settings = {};
let isMonitoring = true;

// Settings management
function getSettingsPath() {
  // Use proper user data directory instead of app directory
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'settings.json');
}

function getAudioAssetsPath() {
  // Create a dedicated directory for audio assets
  const userDataPath = app.getPath('userData');
  const audioPath = path.join(userDataPath, 'audio');
  
  // Ensure directory exists
  if (!fs.existsSync(audioPath)) {
    fs.mkdirSync(audioPath, { recursive: true });
  }
  
  return audioPath;
}

function loadSettings() {
  const settingsPath = getSettingsPath();
  
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
      
      // Validate custom sound path exists and is accessible
      if (settings.customSoundPath && !fs.existsSync(settings.customSoundPath)) {
        console.log('Custom sound file not found, resetting to system sound');
        settings.soundType = 'system';
        settings.customSoundPath = '';
        saveSettings();
      }
    } else {
      // Default settings
      settings = {
        inactivityTimeout: 5000,
        popupMessage: "Move the mouse!",
        autoCloseTimeout: 5000,
        enableSound: false,
        soundType: "system", // "system" or "custom"
        customSoundPath: ""
      };
      saveSettings();
    }
  } catch (error) {
    console.log('Error loading settings:', error);
    // Use defaults if file is corrupted
    settings = {
      inactivityTimeout: 5000,
      popupMessage: "Move the mouse!",
      autoCloseTimeout: 5000,
      enableSound: false,
      soundType: "system",
      customSoundPath: ""
    };
    saveSettings();
  }
}

function saveSettings() {
  const settingsPath = getSettingsPath();
  try {
    // Create settings directory if it doesn't exist
    const settingsDir = path.dirname(settingsPath);
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }
    
    // Write settings to user data directory
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

function copyCustomSoundFile(originalPath) {
  try {
    if (!fs.existsSync(originalPath)) {
      throw new Error('Original sound file does not exist');
    }
    
    const audioAssetsPath = getAudioAssetsPath();
    const fileName = path.basename(originalPath);
    const timestamp = Date.now();
    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt);
    
    // Create unique filename to avoid conflicts
    const newFileName = `${baseName}_${timestamp}${fileExt}`;
    const newPath = path.join(audioAssetsPath, newFileName);
    
    // Copy the file
    fs.copyFileSync(originalPath, newPath);
    
    // Clean up old audio files (keep only the latest 5)
    const audioFiles = fs.readdirSync(audioAssetsPath)
      .filter(file => file.startsWith(baseName + '_'))
      .map(file => ({
        name: file,
        path: path.join(audioAssetsPath, file),
        stat: fs.statSync(path.join(audioAssetsPath, file))
      }))
      .sort((a, b) => b.stat.mtime - a.stat.mtime);
    
    // Remove old files, keep only the latest 5
    if (audioFiles.length > 5) {
      audioFiles.slice(5).forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.log('Warning: Could not delete old audio file:', err.message);
        }
      });
    }
    
    return newPath;
  } catch (error) {
    console.error('Error copying custom sound file:', error);
    return null;
  }
}
        


// Try to load robotjs with better error handling
try {
  robot = require('robotjs');
  robotjsAvailable = true;
  
  // Test if robotjs actually works
  try {
    robot.getMousePos();
  } catch (testError) {
    robotjsAvailable = false;
  }
} catch (error) {
  robotjsAvailable = false;
}

// Activity monitoring
function checkActivity() {
  if (!isMonitoring) {
    return; // Skip monitoring if paused
  }
  
  if (robotjsAvailable) {
    try {
      const currentMousePos = robot.getMousePos();
      
      // Check if mouse position changed
      if (currentMousePos.x !== mousePosition.x || currentMousePos.y !== mousePosition.y) {
        mousePosition = currentMousePos;
        resetActivityTimer();
      }
    } catch (error) {
      console.log('Error getting mouse position:', error);
      // Continue with fallback method
    }
  }
  
  // Check if configured time has passed without activity
  const timeSinceLastActivity = Date.now() - lastActivity;
  if (timeSinceLastActivity >= settings.inactivityTimeout && !popupShown) {
    showPopup();
  }
}

function resetActivityTimer() {
  lastActivity = Date.now();
  hidePopup();
}

function showPopup() {
  if (popupShown || (popupWindow && !popupWindow.isDestroyed())) {
    return; // Popup already shown
  }
  
  popupShown = true;
  
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  popupWindow = new BrowserWindow({
    width: 450,
    height: 380,
    x: Math.floor((width - 450) / 2),
    y: Math.floor((height - 380) / 2),
    frame: false,
    alwaysOnTop: false, // Reduce X11 conflicts
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    focusable: true,
    modal: false,
    show: false, // Start hidden to prevent X11 issues
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      offscreen: false
    }
  });
  
  // Remove problematic window type on Linux to prevent X11 errors
  if (process.platform !== 'linux') {
    popupWindow.setType('notification');
  }
  
  // Generate dynamic subtitle
  const dynamicSubtitle = `No activity detected for ${formatTimeString(settings.inactivityTimeout)}`;
  
  // Pass settings to popup via URL parameters
  const params = new URLSearchParams({
    message: settings.popupMessage,
    subtitle: dynamicSubtitle,
    enableSound: settings.enableSound.toString(),
    soundType: settings.soundType,
    customSoundPath: settings.customSoundPath || '',
    autoCloseTimeout: settings.autoCloseTimeout.toString()
  });
  
  popupWindow.loadFile('popup.html', { search: params.toString() });
  
  // Handle showing the window after it's loaded to prevent X11 issues
  popupWindow.once('ready-to-show', () => {
    popupWindow.show();
    
    if (process.platform === 'linux') {
      // Simplified X11 handling - avoid problematic window management calls
      setTimeout(() => {
        if (popupWindow && !popupWindow.isDestroyed()) {
          popupWindow.setAlwaysOnTop(true);
          popupWindow.focus();
        }
      }, 200);
    } else {
      if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.setAlwaysOnTop(true, 'screen-saver');
        popupWindow.focus();
      }
    }
  });
  
  // Handle auto-close timing based on sound setting
  if (settings.enableSound) {
    // When sound is enabled, let the popup handle timing based on sound duration
    // Send signal to popup to play sound and handle timing
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.once('did-finish-load', () => {
        if (popupWindow && !popupWindow.isDestroyed()) {
          popupWindow.webContents.send('play-notification-sound', {
            soundType: settings.soundType,
            customSoundPath: settings.customSoundPath
          });
        }
      });
    }
  } else {
    // Use configured auto-close timeout when sound is disabled
    setTimeout(() => {
      hidePopup();
    }, settings.autoCloseTimeout);
  }
  
  // Handle popup close event
  popupWindow.on('closed', () => {
    popupShown = false;
    popupWindow = null;
  });
}

// Sound handling moved to popup process for better audio management

// Sound functions removed - handled in popup process

function hidePopup() {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.close();
  }
  popupShown = false;
  popupWindow = null;
}

function startActivityMonitoring() {
  if (robotjsAvailable) {
    try {
      mousePosition = robot.getMousePos();
    } catch (error) {
      console.log('Error initializing mouse position:', error);
      mousePosition = { x: 0, y: 0 };
    }
  }
  lastActivity = Date.now();
  isMonitoring = true;
  
  // Check activity every 1 second
  if (!activityCheckInterval) {
    activityCheckInterval = setInterval(checkActivity, 1000);
  }
  
  updateMonitoringStatus();
}

function stopActivityMonitoring() {
  if (activityCheckInterval) {
    clearInterval(activityCheckInterval);
    activityCheckInterval = null;
  }
  isMonitoring = false;
  updateMonitoringStatus();
}

function pauseActivityMonitoring() {
  isMonitoring = false;
  updateMonitoringStatus();
}

function resumeActivityMonitoring() {
  isMonitoring = true;
  lastActivity = Date.now(); // Reset timer when resuming
  updateMonitoringStatus();
}

function updateMonitoringStatus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('monitoring-status-changed', isMonitoring);
  }
  // Update tray menu to reflect current monitoring status
  if (tray && !tray.isDestroyed()) {
    updateTrayMenu();
  }
}

function createWindow() {
  // Create main window (initially hidden for tray mode)
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    show: false, // Hidden by default for tray mode
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icon.png') // Use the custom icon
  });
  
  mainWindow.loadFile('index.html');
  
  // Create menu
  createMenu();
  
  // Add global event listeners for activity detection
  mainWindow.webContents.on('before-input-event', (event, input) => {
    lastActivity = Date.now();
    hidePopup();
  });
  
  // Start monitoring when window is ready
  mainWindow.once('ready-to-show', () => {
    startActivityMonitoring();
  });
  
  // Hide window instead of closing when user clicks X
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Activity Monitor',
      type: 'normal',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Show/Hide Window',
      type: 'normal',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      }
    },
    {
      label: 'Settings',
      type: 'normal',
      click: () => openSettings()
    },
    { type: 'separator' },
    {
      label: isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring',
      type: 'normal',
      click: () => {
        if (isMonitoring) {
          pauseActivityMonitoring();
        } else {
          resumeActivityMonitoring();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function createTray() {
  // Only create tray if it doesn't exist
  if (!tray || tray.isDestroyed()) {
    tray = new Tray(path.join(__dirname, 'icon.png'));
    
    // Double-click to show/hide main window
    tray.on('double-click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  }
  
  // Set/update the menu and tooltip
  updateTrayMenu();
}

function updateTrayMenu() {
  if (tray && !tray.isDestroyed()) {
    const contextMenu = createTrayMenu();
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Activity Monitor - Click to open menu');
  }
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => openSettings()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Show/Hide Window',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              if (mainWindow.isVisible()) {
                mainWindow.hide();
              } else {
                mainWindow.show();
              }
            }
          }
        }
      ]
    },
    {
      label: 'Monitor',
      submenu: [
        {
          label: 'Start Monitoring',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            if (!isMonitoring) {
              resumeActivityMonitoring();
            }
          }
        },
        {
          label: 'Pause Monitoring',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            if (isMonitoring) {
              pauseActivityMonitoring();
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Reset Settings',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'question',
              buttons: ['Yes', 'No'],
              defaultId: 1,
              title: 'Reset Settings',
              message: 'Are you sure you want to reset all settings to defaults?'
            }).then((result) => {
              if (result.response === 0) {
                resetToDefaults();
              }
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function openSettings() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 480,
    height: 700,
    parent: mainWindow,
    modal: process.platform !== 'linux', // Disable modal on Linux to prevent X11 errors
    resizable: false,
    alwaysOnTop: process.platform === 'linux', // Use alwaysOnTop instead on Linux
    show: false, // Start hidden to prevent X11 issues
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  settingsWindow.loadFile('settings.html');
  settingsWindow.removeMenu();

  // Handle showing the window after it's loaded to prevent X11 issues
  settingsWindow.once('ready-to-show', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.show();
      if (process.platform === 'linux') {
        // Additional X11 window management for settings
        setTimeout(() => {
          if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.focus();
            settingsWindow.center();
          }
        }, 100);
      } else {
        if (settingsWindow && !settingsWindow.isDestroyed()) {
          settingsWindow.focus();
        }
      }
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function resetToDefaults() {
  settings = {
    inactivityTimeout: 5000,
    popupMessage: "Move the mouse!",
    autoCloseTimeout: 5000,
    enableSound: false,
    soundType: "system",
    customSoundPath: ""
  };
  saveSettings();
  
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('settings-reset');
  }
}

function formatTimeString(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  } else if (minutes > 0) {
    return `${minutes} minutes, ${seconds} seconds`;
  } else {
    return `${seconds} seconds`;
  }
}

// GPU and X11 related fixes for Linux
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-gpu');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--disable-setuid-sandbox');
app.commandLine.appendSwitch('--disable-features=VizDisplayCompositor');
app.commandLine.appendSwitch('--disable-extensions');
app.commandLine.appendSwitch('--disable-plugins');
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--ignore-certificate-errors');
app.commandLine.appendSwitch('--allow-running-insecure-content');

// Fix audio issues - MojoAudioOutputIPC errors
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-features=VizDisplayCompositor');
app.commandLine.appendSwitch('--autoplay-policy=no-user-gesture-required');
app.commandLine.appendSwitch('--disable-web-audio');
app.commandLine.appendSwitch('--disable-audio-input');
app.commandLine.appendSwitch('--force-wave-audio');
app.commandLine.appendSwitch('--try-supported-channel-layouts');

// Fix X11 modal window management issues
app.commandLine.appendSwitch('--enable-transparent-visuals');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');

// Linux-specific X11 fixes - must be called before app.whenReady()
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
  
  // Set proper app name for X11 window manager
  app.setName('Activity Monitor');
  
  // Handle X11 display issues
  process.env.DISPLAY = process.env.DISPLAY || ':0';
  
  // Audio system environment variables for Linux
  process.env.PULSE_SERVER = process.env.PULSE_SERVER || 'unix:/run/user/' + process.getuid() + '/pulse/native';
  process.env.ALSA_PCM_CARD = process.env.ALSA_PCM_CARD || '0';
  process.env.ALSA_PCM_DEVICE = process.env.ALSA_PCM_DEVICE || '0';
}

// App event handlers
app.whenReady().then(() => {
  loadSettings();
  createTray();
  createWindow();
  
  // Register global shortcut to show/hide the app
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  
  // Register settings shortcut
  globalShortcut.register('CmdOrCtrl+,', () => {
    openSettings();
  });
  
  // Register monitoring control shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+S', () => {
    if (!isMonitoring) {
      resumeActivityMonitoring();
    }
  });
  
  globalShortcut.register('CmdOrCtrl+Shift+P', () => {
    if (isMonitoring) {
      pauseActivityMonitoring();
    }
  });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit when all windows are closed - keep running in tray
  // Only quit if explicitly requested via tray menu
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopActivityMonitoring();
  if (tray) {
    tray.destroy();
  }
});

// IPC handlers
ipcMain.on('close-popup', () => {
  hidePopup();
  resetActivityTimer(); // Reset timer when user acknowledges
});

ipcMain.on('mouse-moved', () => {
  resetActivityTimer();
});

// Handle activity from any window
ipcMain.on('activity-detected', () => {
  resetActivityTimer();
});

// Handle sound-based auto-close timing
ipcMain.on('sound-finished', (event, soundDuration) => {
  // Auto-close popup with small delay after sound finishes
  const delay = 500; // 500ms delay after sound completes
  setTimeout(() => {
    hidePopup();
  }, delay);
});

ipcMain.on('sound-error', () => {
  // Fallback to configured timeout if sound fails
  setTimeout(() => {
    hidePopup();
  }, settings.autoCloseTimeout);
});

// Settings IPC handlers
ipcMain.on('get-settings', (event) => {
  event.reply('settings-loaded', settings);
});

ipcMain.on('get-settings-info', (event) => {
  event.reply('settings-info', {
    settingsPath: getSettingsPath(),
    audioPath: getAudioAssetsPath(),
    userDataPath: app.getPath('userData')
  });
});

ipcMain.on('save-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  const success = saveSettings();
  event.reply('settings-saved', success);
});

ipcMain.on('reset-settings', (event) => {
  resetToDefaults();
  event.reply('settings-loaded', settings);
});

ipcMain.on('close-settings', () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }
});

ipcMain.on('open-settings', () => {
  openSettings();
});

ipcMain.on('get-main-settings', (event) => {
  event.reply('main-settings-loaded', settings);
});

ipcMain.on('start-monitoring', () => {
  resumeActivityMonitoring();
});

ipcMain.on('pause-monitoring', () => {
  pauseActivityMonitoring();
});

// Store dialog state
let isDialogOpen = false;
 
// Handle custom sound file selection
ipcMain.handle('select-sound-file', async (event) => {
  try {
    // Prevent multiple dialogs from opening
    if (isDialogOpen) {
      console.log('Dialog is already open');
      return null;
    }

    if (!settingsWindow || settingsWindow.isDestroyed()) {
      throw new Error('Settings window not available');
    }

    isDialogOpen = true;

    const result = await dialog.showOpenDialog(settingsWindow, {
      title: 'Select Custom Notification Sound',
      filters: [
        {
          name: 'Audio Files',
          extensions: ['wav', 'mp3', 'ogg', 'aac', 'm4a', 'flac']
        },
        {
          name: 'All Files',
          extensions: ['*']
        }
      ],
      properties: ['openFile'],
      defaultPath: process.env.HOME || process.env.USERPROFILE
    }).finally(() => {
      // Reset dialog state when done
      isDialogOpen = false;
    });
    
    // Handle the result
    if (!result.canceled && result.filePaths.length > 0) {
      const originalPath = result.filePaths[0];
      
      // Copy the selected file to app data directory
      const copiedFilePath = copyCustomSoundFile(originalPath);
      
      if (copiedFilePath) {
        console.log(`Custom sound file copied to: ${copiedFilePath}`);
        return copiedFilePath;
      } else {
        console.error('Failed to copy custom sound file');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error selecting sound file:', error);
    isDialogOpen = false; // Reset state in case of error
    return null;
  }
});

// Handle sound duration calculation for custom sounds
ipcMain.on('custom-sound-loaded', (event, duration) => {
  // Auto-close popup after custom sound duration + buffer
  const closeDelay = Math.max(duration + 1000, 2000); // Minimum 2 seconds
  setTimeout(() => {
    hidePopup();
  }, closeDelay);
});