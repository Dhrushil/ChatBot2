#!/bin/bash

# Ensure necessary tools are available
apt-get update && apt-get install -y unzip curl

# Download the ZIP of Rhubarb + res folder
curl -L -o rhubarb.zip "https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.10.0/rhubarb-linux.zip"

# Unzip it into the current working directory
unzip rhubarb.zip

# Optional: make Rhubarb executable
chmod +x bin/rhubarb

# Continue with the rest of your build
echo "Rhubarb and resources downloaded."
