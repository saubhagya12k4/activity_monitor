const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let robot;
let mainWindow;
let popupWindow;
let settingsWindow;
let lastActivity = Date.now();
let activityCheckInterval;
let mousePosition = { x: 0, y: 0 };
let robotjsAvailable = false;
let popupShown = false;
let settings = {};
let isMonitoring = true;

// Settings management
function loadSettings() {
  const settingsPath = path.join(__dirname, 'settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    } else {
      // Default settings
      settings = {
        inactivityTimeout: 5000,
        popupMessage: "Move the mouse!",
        autoCloseTimeout: 5000,
        enableSound: false,
        theme: "default"
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
      theme: "default"
    };
  }
}

function saveSettings() {
  const settingsPath = path.join(__dirname, 'settings.json');
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.log('Error saving settings:', error);
    return false;
  }
}

// Try to load robotjs
try {
  robot = require('robotjs');
  robotjsAvailable = true;
  console.log('🖱️  robotjs loaded successfully - full activity monitoring enabled');
} catch (error) {
  console.log('⚠️  robotjs not available, using fallback method (timer-based only)');
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
  
  console.log(`🚨 Showing inactivity popup - no activity detected for ${settings.inactivityTimeout/1000} seconds`);
  popupShown = true;
  
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  popupWindow = new BrowserWindow({
    width: 400,
    height: 300,
    x: Math.floor((width - 400) / 2),
    y: Math.floor((height - 300) / 2),
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    focusable: true,
    modal: false,
    type: 'notification',
    icon: path.join(__dirname, 'icon.png'), // Use the custom icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // Generate dynamic subtitle
  const dynamicSubtitle = `No activity detected for ${formatTimeString(settings.inactivityTimeout)}`;
  
  // Pass settings to popup via URL parameters
  const params = new URLSearchParams({
    message: settings.popupMessage,
    subtitle: dynamicSubtitle,
    theme: settings.theme
  });
  
  popupWindow.loadFile('popup.html', { search: params.toString() });
  popupWindow.show();
  
  // Ensure the window stays on top
  popupWindow.setAlwaysOnTop(true, 'screen-saver');
  popupWindow.focus();
  
  // Auto-hide popup after configured time
  setTimeout(() => {
    hidePopup();
  }, settings.autoCloseTimeout);
  
  // Handle popup close event
  popupWindow.on('closed', () => {
    popupShown = false;
    popupWindow = null;
  });
}

function hidePopup() {
  if (popupWindow && !popupWindow.isDestroyed()) {
    console.log('✅ Hiding popup - activity detected');
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
  
  console.log('🎯 Activity monitoring started');
  updateMonitoringStatus();
}

function stopActivityMonitoring() {
  if (activityCheckInterval) {
    clearInterval(activityCheckInterval);
    activityCheckInterval = null;
  }
  isMonitoring = false;
  console.log('⏸️ Activity monitoring stopped');
  updateMonitoringStatus();
}

function pauseActivityMonitoring() {
  isMonitoring = false;
  console.log('⏸️ Activity monitoring paused');
  updateMonitoringStatus();
}

function resumeActivityMonitoring() {
  isMonitoring = true;
  lastActivity = Date.now(); // Reset timer when resuming
  console.log('▶️ Activity monitoring resumed');
  updateMonitoringStatus();
}

function updateMonitoringStatus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('monitoring-status-changed', isMonitoring);
  }
}

function createWindow() {
  // Create a hidden main window (system tray would be better but this is simpler)
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    show: true, // Visible for testing
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
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
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
    width: 650,
    height: 700,
    parent: mainWindow,
    modal: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  settingsWindow.loadFile('settings.html');
  settingsWindow.removeMenu();

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
    theme: "default"
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

// GPU-related fixes for Linux
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-gpu');

// App event handlers
app.whenReady().then(() => {
  loadSettings();
  createWindow();
  
  // Register global shortcut to show/hide the app
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
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
  stopActivityMonitoring();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopActivityMonitoring();
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

// Settings IPC handlers
ipcMain.on('get-settings', (event) => {
  event.reply('settings-loaded', settings);
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