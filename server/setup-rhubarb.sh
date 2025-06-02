#!/bin/bash

set -e  # Exit on any error

ZIP_URL="https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.14.0/Rhubarb-Lip-Sync-1.14.0-Linux.zip"

echo "📦 Downloading Rhubarb..."
curl -L -o rhubarb.zip "$ZIP_URL"

echo "📂 Extracting..."
mkdir -p bin
unzip -q rhubarb.zip -d temp_rhubarb

# Move contents *inside* the extracted top folder to ./bin
mv temp_rhubarb/*/* bin/

# Make binary executable
chmod +x bin/rhubarb

# Clean up
rm -rf rhubarb.zip temp_rhubarb

echo "✅ Rhubarb installed in ./bin"
