#!/bin/bash

echo "📦 Downloading Rhubarb..."

mkdir -p bin

curl -L https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.10.0/rhubarb-linux.zip -o rhubarb.zip

unzip rhubarb.zip -d bin

mv bin/rhubarb* bin/rhubarb

chmod +x bin/rhubarb

rm rhubarb.zip

echo "✅ Rhubarb installed to ./bin/rhubarb"
