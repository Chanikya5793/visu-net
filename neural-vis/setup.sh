#!/bin/bash

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew is not installed. Please install Homebrew first."
    echo "Visit https://brew.sh for installation instructions."
    exit 1
fi

# Install required system dependencies for macOS
brew install xquartz

# Install X11 development files
brew install libx11

# Run npm install with legacy OpenSSL provider
NODE_OPTIONS='--openssl-legacy-provider' npm install

# Make the script executable
chmod +x setup.sh
