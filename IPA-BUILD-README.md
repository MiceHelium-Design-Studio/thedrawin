# 🍎 Quick IPA Build Guide

## Prerequisites
- **macOS** with Xcode installed
- **Apple Developer Account** ($99/year)
- **Node.js** and npm

## Quick Start

### Option 1: Automated Script (Recommended)
```bash
# Make script executable
chmod +x build-ipa.sh

# Build with version 1.1 and build number 2
./build-ipa.sh -v 1.1 -b 2

# Or use interactive mode (opens Xcode)
./build-ipa.sh
```

### Option 2: Manual Steps
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync ios

# 3. Install pods
cd ios/App
pod install
cd ../..

# 4. Open Xcode
npx cap open ios
```

### Option 3: NPM Scripts
```bash
# Prepare and open iOS project
npm run ios:build

# Or step by step
npm run ios:prepare
npm run ios:open
```

## In Xcode
1. **Select your team** in Signing & Capabilities
2. **Choose "Any iOS Device (arm64)"** as target
3. **Product → Archive**
4. **Follow distribution wizard** to create IPA

## Distribution Methods
- **App Store Connect**: For App Store submission
- **Ad Hoc**: For testing on specific devices
- **Enterprise**: For internal company distribution
- **Development**: For development testing

## Common Issues
- **Code signing errors**: Check team selection
- **Build failures**: Clean build folder and try again
- **Plugin issues**: Run `npx cap sync ios` and `pod install`

## Files Created
- `BUILD-RELEASE-IPA-GUIDE.md`: Complete detailed guide
- `build-ipa.sh`: Automated build script
- `build-ipa.ps1`: Windows preparation script
- `ios-build-instructions.md`: Step-by-step instructions

## Support
- Check Xcode console for error messages
- Verify Apple Developer account is active
- Ensure bundle identifier matches: `com.thedrawin.app`

---
**Note**: iOS builds require macOS and Xcode. If you're on Windows, use `build-ipa.ps1` to prepare, then transfer to macOS. 