# ðŸŽ iOS Build Instructions

## Prerequisites
- macOS with Xcode installed
- Apple Developer Account
- iOS device or simulator for testing

## Steps to Complete on macOS

### 1. Navigate to Project Directory
`ash
cd /path/to/your/project
`

### 2. Install CocoaPods Dependencies
`ash
cd ios/App
pod install
cd ../..
`

### 3. Open Xcode Project
`ash
npx cap open ios
`

### 4. Configure Signing & Capabilities
1. Select the "App" project in Xcode
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your development team
6. Ensure bundle identifier is: com.thedrawin.app

### 5. Update Version (if needed)
Edit: ios/App/App/Info.plist
- CFBundleShortVersionString: 1.1
- CFBundleVersion: 2

### 6. Build for Release
1. Select "Any iOS Device (arm64)" as target
2. Go to Product â†’ Archive
3. Wait for archive to complete

### 7. Create IPA
1. In Organizer, select your archive
2. Click "Distribute App"
3. Choose distribution method:
   - App Store Connect (for App Store)
   - Ad Hoc (for testing)
   - Enterprise (for enterprise distribution)
4. Follow the wizard to export IPA

## Alternative: Command Line Build
If you prefer command line:

`ash
# Make build-ipa.sh executable
chmod +x build-ipa.sh

# Run the build script
./build-ipa.sh -v 1.1 -b 2 --cli
`

## Testing Your IPA
- Use TestFlight for App Store builds
- Use Ad Hoc distribution for direct testing
- Install on registered devices for testing

## Common Issues
- Code signing errors: Check team selection and certificates
- Build failures: Clean build folder and try again
- Plugin issues: Run 'npx cap sync ios' and 'pod install'

## Support
If you encounter issues, check:
1. Xcode console for error messages
2. Apple Developer documentation
3. Capacitor documentation
