const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status-text');
    
    // Update status periodically
    setInterval(() => {
        const now = new Date();
        statusText.textContent = `Monitoring active... (${now.toLocaleTimeString()})`;
    }, 1000);
    
    // Button event listeners
    document.getElementById('settings-btn')?.addEventListener('click', () => {
        ipcRenderer.send('open-settings');
    });
    
    document.getElementById('start-btn')?.addEventListener('click', () => {
        ipcRenderer.send('start-monitoring');
    });
    
    document.getElementById('pause-btn')?.addEventListener('click', () => {
        ipcRenderer.send('pause-monitoring');
    });
    
    // Initialize button states
    updateButtonStates(true); // Assume monitoring is active on start
    
    const sendActivity = () => {
        ipcRenderer.send('activity-detected');
    };
    
    document.addEventListener('mousemove', sendActivity);
    document.addEventListener('keydown', sendActivity);
    document.addEventListener('click', sendActivity);
    document.addEventListener('wheel', sendActivity);
    window.addEventListener('focus', sendActivity);
    
    // Also send activity when window becomes visible
    window.addEventListener('blur', sendActivity);
    
    // Send initial activity signal
    sendActivity();
    
    // Load and display current settings
    loadCurrentSettings();
});

function updateButtonStates(isMonitoring) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const statusIndicator = document.getElementById('monitoring-status');
    
    if (startBtn && pauseBtn && statusIndicator) {
        if (isMonitoring) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            statusIndicator.textContent = '🟢 Active';
            statusIndicator.className = 'status-active';
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            statusIndicator.textContent = '🔴 Paused';
            statusIndicator.className = 'status-paused';
        }
    }
}

function loadCurrentSettings() {
    ipcRenderer.send('get-main-settings');
}

function formatTimeString(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

// IPC event listeners
ipcRenderer.on('main-settings-loaded', (event, settings) => {
    // Update the display with current settings
    const timeoutInfo = document.getElementById('timeout-info');
    const autocloseInfo = document.getElementById('autoclose-info');
    const testInfo = document.getElementById('test-info');
    
    if (timeoutInfo) {
        const timeString = formatTimeString(settings.inactivityTimeout);
        timeoutInfo.textContent = `🎯 Shows popup after ${timeString} of inactivity`;
    }
    
    if (autocloseInfo) {
        const timeString = formatTimeString(settings.autoCloseTimeout);
        autocloseInfo.textContent = `⏰ Popup auto-closes after ${timeString}`;
    }
    
    if (testInfo) {
        const timeString = formatTimeString(settings.inactivityTimeout);
        testInfo.textContent = `💡 To test: Don't move the mouse or press keys for ${timeString}`;
    }
});

// Listen for monitoring status changes
ipcRenderer.on('monitoring-status-changed', (event, isMonitoring) => {
    updateButtonStates(isMonitoring);
});