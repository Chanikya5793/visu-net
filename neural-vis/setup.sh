#!/bin/bash

# Install required system dependencies
sudo apt-get update
sudo apt-get install -y \
    libx11-dev \
    libxi-dev \
    libxext-dev \
    mesa-common-dev \
    build-essential

# Run npm install
npm install

# Make the script executable and run it with sudo permissions
#chmod +x setup.sh
#sudo ./setup.sh
