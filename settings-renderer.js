const { ipcRenderer } = require('electron');

let currentSettings = {};

document.addEventListener('DOMContentLoaded', () => {
    // Load current settings
    loadSettings();
    
    // Set up event listeners
    document.getElementById('save-btn').addEventListener('click', saveSettings);
    document.getElementById('reset-btn').addEventListener('click', resetSettings);
    document.getElementById('close-btn').addEventListener('click', closeSettings);
    
    // Real-time validation
    document.getElementById('timeout-hours').addEventListener('input', validateTimeout);
    document.getElementById('timeout-minutes').addEventListener('input', validateTimeout);
    document.getElementById('timeout-seconds').addEventListener('input', validateTimeout);
    document.getElementById('auto-close-timeout').addEventListener('input', validateAutoClose);
    document.getElementById('popup-message').addEventListener('input', validateMessage);
});

function loadSettings() {
    ipcRenderer.send('get-settings');
}

function saveSettings() {
    const hours = parseInt(document.getElementById('timeout-hours').value) || 0;
    const minutes = parseInt(document.getElementById('timeout-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('timeout-seconds').value) || 0;
    
    const settings = {
        inactivityTimeout: (hours * 3600 + minutes * 60 + seconds) * 1000,
        popupMessage: document.getElementById('popup-message').value.trim(),
        autoCloseTimeout: parseInt(document.getElementById('auto-close-timeout').value) * 1000,
        enableSound: document.getElementById('enable-sound').checked,
        theme: document.getElementById('theme').value
    };
    
    // Validate settings
    if (!validateAllSettings(settings)) {
        return;
    }
    
    ipcRenderer.send('save-settings', settings);
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        ipcRenderer.send('reset-settings');
    }
}



function closeSettings() {
    ipcRenderer.send('close-settings');
}

function validateTimeout() {
    const hours = parseInt(document.getElementById('timeout-hours').value) || 0;
    const minutes = parseInt(document.getElementById('timeout-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('timeout-seconds').value) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    const hoursInput = document.getElementById('timeout-hours');
    const minutesInput = document.getElementById('timeout-minutes');
    const secondsInput = document.getElementById('timeout-seconds');
    
    // Reset styles
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.setCustomValidity('');
        input.style.borderColor = '';
    });
    
    if (totalSeconds < 1) {
        secondsInput.setCustomValidity('Total time must be at least 1 second');
        secondsInput.style.borderColor = '#ff4444';
        return false;
    }
    
    if (totalSeconds > 86400) { // 24 hours
        hoursInput.setCustomValidity('Total time cannot exceed 24 hours');
        hoursInput.style.borderColor = '#ff4444';
        return false;
    }
    
    return true;
}

function validateAutoClose() {
    const value = parseInt(document.getElementById('auto-close-timeout').value);
    const input = document.getElementById('auto-close-timeout');
    
    if (value < 1 || value > 60) {
        input.setCustomValidity('Must be between 1 and 60 seconds');
        input.style.borderColor = '#ff4444';
    } else {
        input.setCustomValidity('');
        input.style.borderColor = '';
    }
}

function validateMessage() {
    const value = document.getElementById('popup-message').value.trim();
    const input = document.getElementById('popup-message');
    
    if (value.length < 1) {
        input.setCustomValidity('Message cannot be empty');
        input.style.borderColor = '#ff4444';
    } else {
        input.setCustomValidity('');
        input.style.borderColor = '';
    }
}

function validateAllSettings(settings) {
    const errors = [];
    
    if (settings.inactivityTimeout < 1000 || settings.inactivityTimeout > 86400000) {
        errors.push('Inactivity timeout must be between 1 second and 24 hours');
    }
    
    if (settings.autoCloseTimeout < 1000 || settings.autoCloseTimeout > 60000) {
        errors.push('Auto-close timeout must be between 1 and 60 seconds');
    }
    
    if (!settings.popupMessage || settings.popupMessage.length < 1) {
        errors.push('Popup message cannot be empty');
    }
    
    if (!validateTimeout()) {
        errors.push('Invalid timeout values');
    }
    
    if (errors.length > 0) {
        showStatus(errors.join('\n'), 'error');
        return false;
    }
    
    return true;
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.classList.remove('hidden');
    
    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 3000);
}

// IPC event listeners
ipcRenderer.on('settings-loaded', (event, settings) => {
    currentSettings = settings;
    
    // Convert milliseconds to hours, minutes, seconds
    const totalSeconds = Math.floor(settings.inactivityTimeout / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Update form fields
    document.getElementById('timeout-hours').value = hours;
    document.getElementById('timeout-minutes').value = minutes;
    document.getElementById('timeout-seconds').value = seconds;
    document.getElementById('popup-message').value = settings.popupMessage;
    document.getElementById('auto-close-timeout').value = settings.autoCloseTimeout / 1000;
    document.getElementById('enable-sound').checked = settings.enableSound;
    document.getElementById('theme').value = settings.theme;
});

ipcRenderer.on('settings-saved', (event, success) => {
    if (success) {
        showStatus('Settings saved successfully!', 'success');
    } else {
        showStatus('Failed to save settings', 'error');
    }
});

ipcRenderer.on('settings-reset', (event) => {
    showStatus('Settings reset to defaults', 'info');
    loadSettings(); // Reload the form
});