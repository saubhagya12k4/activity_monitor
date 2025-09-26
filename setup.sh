#!/bin/bash

# Activity Monitor - Setup Script
# This script sets up the development environment using uv

echo "🖱️  Setting up Activity Monitor..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please install it first:"
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Create virtual environment using uv (for any Python dependencies if needed later)
echo "📦 Creating virtual environment with uv..."
uv venv mouse-activity-env

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source mouse-activity-env/bin/activate

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "🚀 To run the application:"
echo "   npm start"
echo ""
echo "🔧 To run in development mode:"
echo "   npm run dev"
echo ""
echo "📦 To build the application:"
echo "   npm run build"
echo ""
echo "⌨️  Press Ctrl+Shift+M to show/hide the main window when running"