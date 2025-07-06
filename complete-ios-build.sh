#!/bin/bash
# Quick build script for macOS
# Run this on macOS to complete the iOS build

echo "ðŸŽ Completing iOS build..."

# Install pods
cd ios/App
pod install
cd ../..

# Open Xcode
npx cap open ios

echo "âœ… Xcode opened. Please complete the archive process manually."
echo "ðŸ“– See ios-build-instructions.md for detailed steps."
