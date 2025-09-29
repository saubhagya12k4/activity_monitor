const { ipcRenderer } = require('electron');

let currentSettings = {};

document.addEventListener('DOMContentLoaded', () => {
    // Load current settings
    loadSettings();    // Set up event listeners
    document.getElementById('save-btn').addEventListener('click', saveSettings);
    document.getElementById('reset-btn').addEventListener('click', resetSettings);
    document.getElementById('close-btn').addEventListener('click', closeSettings);
    
    // Sound option event listeners
    document.getElementById('enable-sound').addEventListener('change', toggleSoundOptions);
    document.getElementById('sound-type').addEventListener('change', toggleCustomSoundOptions);
    document.getElementById('select-sound-btn').addEventListener('click', selectSoundFile);
    document.getElementById('test-sound-btn').addEventListener('click', testCustomSound);
    
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
        soundType: document.getElementById('sound-type').value,
        customSoundPath: document.getElementById('custom-sound-path').value.trim()
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
    document.getElementById('sound-type').value = settings.soundType || 'system';
    document.getElementById('custom-sound-path').value = settings.customSoundPath || '';
    
    // Update UI visibility
    toggleSoundOptions();
    toggleCustomSoundOptions();
});

ipcRenderer.on('settings-saved', (event, success) => {
    if (success) {
        showStatus('Settings saved successfully!', 'success');
    } else {
        showStatus('Failed to save settings', 'error');
    }
});

ipcRenderer.on('settings-reset', (event) => {
    // Reload settings after reset
    loadSettings();
    showStatus('Settings reset to defaults', 'success');
});

// Sound option functions
function toggleSoundOptions() {
    const enableSound = document.getElementById('enable-sound').checked;
    const soundOptions = document.getElementById('sound-options');
    const autoCloseGroup = document.getElementById('auto-close-group');
    const autoCloseInput = document.getElementById('auto-close-timeout');
    const autoCloseLabel = autoCloseGroup.querySelector('label');
    const autoCloseHelp = document.getElementById('auto-close-help');
    
    if (enableSound) {
        soundOptions.classList.remove('hidden');
        toggleCustomSoundOptions();
        
        // Disable auto-close timeout setting when sound is enabled
        autoCloseInput.disabled = true;
        autoCloseInput.classList.add('opacity-50', 'cursor-not-allowed');
        autoCloseLabel.classList.add('opacity-50');
        autoCloseHelp.textContent = 'Auto-close timing is controlled by notification sound duration';
        autoCloseHelp.classList.add('opacity-70', 'italic');
    } else {
        soundOptions.classList.add('hidden');
        document.getElementById('custom-sound-group').classList.add('hidden');
        
        // Re-enable auto-close timeout setting when sound is disabled
        autoCloseInput.disabled = false;
        autoCloseInput.classList.remove('opacity-50', 'cursor-not-allowed');
        autoCloseLabel.classList.remove('opacity-50');
        autoCloseHelp.textContent = 'How long popup stays visible (1-60 seconds)';
        autoCloseHelp.classList.remove('opacity-70', 'italic');
    }
}

function toggleCustomSoundOptions() {
    const soundType = document.getElementById('sound-type').value;
    const customSoundGroup = document.getElementById('custom-sound-group');
    const testButton = document.getElementById('test-sound-btn');
    
    if (soundType === 'custom') {
        customSoundGroup.classList.remove('hidden');
        // Show test button if a file is selected
        const customPath = document.getElementById('custom-sound-path').value;
        if (customPath) {
            testButton.classList.remove('hidden');
        } else {
            testButton.classList.add('hidden');
        }
    } else {
        customSoundGroup.classList.add('hidden');
    }
}

async function selectSoundFile() {
    try {
        const filePath = await ipcRenderer.invoke('select-sound-file');
        if (filePath) {
            document.getElementById('custom-sound-path').value = filePath;
            document.getElementById('test-sound-btn').classList.remove('hidden');
            showStatus('Sound file selected', 'success');
        }
    } catch (error) {
        console.error('Error selecting sound file:', error);
        showStatus('Error selecting sound file', 'error');
    }
}

function testCustomSound() {
    const soundPath = document.getElementById('custom-sound-path').value;
    if (soundPath) {
        // Create audio element to test the sound
        try {
            const audio = new Audio(`file://${soundPath}`);
            audio.play().then(() => {
                showStatus('Playing test sound...', 'success');
            }).catch((error) => {
                console.error('Error playing test sound:', error);
                showStatus('Error playing sound file', 'error');
            });
        } catch (error) {
            console.error('Error creating audio for test:', error);
            showStatus('Invalid audio file format', 'error');
        }
    }
}