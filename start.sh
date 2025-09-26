#!/bin/bash

# Simple launcher script for the Activity Monitor
echo "🖱️  Starting Activity Monitor..."
echo "📍 The application will run in the background"
echo "⌨️  Press Ctrl+Shift+M to show/hide the main window"
echo "🛑 Press Ctrl+C in this terminal to stop the application"
echo ""

# Navigate to the project directory
cd "$(dirname "$0")"

# Start the application
npm start