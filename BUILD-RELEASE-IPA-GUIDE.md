# 🍎 How to Build Release IPA - Complete Guide

## 🎯 Overview

This guide explains how to create a signed release IPA for **The Draw Win** iOS app after making changes to your code. Follow these steps whenever you need to build a new IPA for distribution.

---

## 📋 Prerequisites

### ✅ **Required Software**
- **Node.js** (with npm)
- **Xcode** (latest version from Mac App Store)
- **iOS Developer Account** (Apple Developer Program membership)
- **Git** (for version control)
- **macOS** (required for iOS development)

### 📁 **Required Files**
- **Provisioning Profile:** For your app bundle ID
- **Distribution Certificate:** From Apple Developer Portal
- **App Store Connect Access:** For app submission

---

## 🚀 Step-by-Step Build Process

### **Step 1: Update Your Code**
Make all necessary changes to your React/TypeScript code in the `src/` directory.

### **Step 2: Update Version (Important!)**
```bash
# Edit ios/App/App/Info.plist
# Update these lines:
<key>CFBundleShortVersionString</key>
<string>1.1</string>          # Update version string
<key>CFBundleVersion</key>
<string>2</string>            # Increment build number
```

### **Step 3: Build Web Assets**
```bash
# In project root directory
npm run build
```
**Expected Output:** `dist/` folder with compiled web assets

### **Step 4: Sync Capacitor**
```bash
npx cap sync ios
```
**Expected Output:** `✓ Sync finished in ~1s`

### **Step 5: Open Xcode Project**
```bash
npx cap open ios
```
**Expected Output:** Xcode opens with your project

### **Step 6: Configure Signing & Capabilities**
1. **Select Project:** Click on "App" in the project navigator
2. **Select Target:** Click on "App" target
3. **Signing & Capabilities Tab:**
   - ✅ **Automatically manage signing**
   - **Team:** Select your Apple Developer Team
   - **Bundle Identifier:** `com.thedrawin.app`
   - **Provisioning Profile:** Should auto-generate

### **Step 7: Configure Build Settings**
1. **Build Settings Tab:**
   - **Code Signing Identity:** `iPhone Distribution`
   - **Provisioning Profile:** `Automatic`
   - **Development Team:** Your team ID

### **Step 8: Build for Release**
1. **Select Device:** Choose "Any iOS Device (arm64)"
2. **Product Menu:** `Product` → `Archive`
3. **Wait for Build:** This may take 5-10 minutes

### **Step 9: Create IPA**
1. **Organizer Opens:** After successful archive
2. **Select Archive:** Choose the latest archive
3. **Distribute App:** Click "Distribute App"
4. **Distribution Method:** Choose based on your needs:
   - **App Store Connect:** For App Store submission
   - **Ad Hoc:** For internal testing
   - **Enterprise:** For enterprise distribution
   - **Development:** For development testing

### **Step 10: Export IPA**
1. **Select Options:** Choose signing options
2. **Export:** Click "Export"
3. **Choose Location:** Save IPA file
4. **Locate Your IPA:**
```
📍 Location: ~/Desktop/TheDrawWin.ipa (or chosen location)
📊 Size: ~15-25MB
✅ Status: Signed and ready for distribution
```

---

## ⚙️ Configuration Files

### 🔧 **Capacitor Configuration (capacitor.config.ts)**
```typescript
const config: CapacitorConfig = {
  appId: 'com.thedrawin.app',
  appName: 'The Draw Win',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      iosSpinnerStyle: 'small',
      spinnerColor: '#F59E0B'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: false
    }
  }
};
```

### 📱 **Info.plist Configuration (ios/App/App/Info.plist)**
```xml
<key>CFBundleDisplayName</key>
<string>The Draw Win</string>
<key>CFBundleIdentifier</key>
<string>com.thedrawin.app</string>
<key>CFBundleShortVersionString</key>
<string>1.1</string>
<key>CFBundleVersion</key>
<string>2</string>
<key>LSRequiresIPhoneOS</key>
<true/>
<key>UILaunchStoryboardName</key>
<string>LaunchScreen</string>
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

### 📦 **Podfile Configuration (ios/App/Podfile)**
```ruby
platform :ios, '13.0'
use_frameworks!

# workaround to avoid Xcode caching of Pods that requires
# Product -> Clean Build Folder after new Cordova plugins installed
# Requires CocoaPods 1.6 or newer
install! 'cocoapods', :disable_input_output_paths => true

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorSplashScreen', :path => '../../node_modules/@capacitor/splash-screen'
  pod 'CapacitorStatusBar', :path => '../../node_modules/@capacitor/status-bar'
  pod 'CapacitorPushNotifications', :path => '../../node_modules/@capacitor/push-notifications'
end

target 'App' do
  capacitor_pods
  # Add your Pods here
end
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Code Signing Errors**
```
Error: No provisioning profiles found
```
**Solution:**
1. Verify Apple Developer account is active
2. Check team selection in Xcode
3. Ensure bundle identifier matches your provisioning profile
4. Try refreshing signing certificates in Xcode

### **Issue 2: Build Failures**
```
Error: Build input file cannot be found
```
**Solution:**
```bash
# Clean and rebuild
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

### **Issue 3: Plugin Issues**
```
Error: Plugin not found
```
**Solution:**
```bash
# Reinstall plugins
npm install
npx cap sync ios
cd ios/App
pod install
```

### **Issue 4: Archive Failures**
```
Error: Archive failed
```
**Solution:**
1. Clean build folder: `Product` → `Clean Build Folder`
2. Delete derived data: `Xcode` → `Preferences` → `Locations` → `Derived Data` → `Delete`
3. Restart Xcode
4. Try archiving again

---

## 🎯 Quick Build Commands

### **Standard Build Process:**
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync ios

# 3. Open Xcode
npx cap open ios

# 4. In Xcode: Product → Archive
```

### **Clean Build (if issues occur):**
```bash
# Clean everything and rebuild
rm -rf ios/App/Pods
rm -rf ios/App/build
npm run build
npx cap sync ios
cd ios/App
pod install
cd ../..
npx cap open ios
```

---

## 📊 Version Management

### **Version Numbering:**
- **CFBundleShortVersionString:** User-facing version (e.g., "1.1")
- **CFBundleVersion:** Build number (increment for each build)

### **Update Version Script:**
```bash
# Create a script to update version numbers
#!/bin/bash
VERSION=$1
BUILD=$2

if [ -z "$VERSION" ] || [ -z "$BUILD" ]; then
    echo "Usage: ./update-version.sh <version> <build>"
    echo "Example: ./update-version.sh 1.1 2"
    exit 1
fi

# Update Info.plist
sed -i '' "s/<key>CFBundleShortVersionString<\/key>.*/<key>CFBundleShortVersionString<\/key>\n\t<string>$VERSION<\/string>/" ios/App/App/Info.plist
sed -i '' "s/<key>CFBundleVersion<\/key>.*/<key>CFBundleVersion<\/key>\n\t<string>$BUILD<\/string>/" ios/App/App/Info.plist

echo "✅ Version updated to $VERSION ($BUILD)"
```

---

## 🚀 Distribution Methods

### **1. App Store Connect (Recommended)**
- **Use Case:** Public App Store distribution
- **Requirements:** App Store Connect account
- **Process:** Upload through Xcode Organizer

### **2. Ad Hoc Distribution**
- **Use Case:** Internal testing with specific devices
- **Requirements:** Device UDIDs registered
- **Process:** Export IPA with Ad Hoc provisioning profile

### **3. Enterprise Distribution**
- **Use Case:** Internal company distribution
- **Requirements:** Enterprise Developer Account
- **Process:** Export IPA with Enterprise provisioning profile

### **4. Development Distribution**
- **Use Case:** Development and testing
- **Requirements:** Development provisioning profile
- **Process:** Install directly on registered devices

---

## 📱 Testing Your IPA

### **TestFlight (Recommended)**
1. Upload to App Store Connect
2. Create TestFlight build
3. Invite testers via email
4. Testers install via TestFlight app

### **Direct Installation**
1. Export Ad Hoc IPA
2. Use tools like Diawi or TestFlight
3. Share link with testers
4. Testers install via Safari

---

## 🔒 Security Considerations

### **Code Signing**
- Always use proper code signing
- Keep certificates secure
- Rotate certificates before expiration

### **App Transport Security**
- Ensure HTTPS for all network requests
- Configure ATS exceptions if needed

### **Privacy**
- Include privacy policy
- Request permissions appropriately
- Handle user data securely

---

## 📞 Support

If you encounter issues:
1. Check Xcode console for detailed error messages
2. Verify all prerequisites are met
3. Try clean build process
4. Check Apple Developer documentation
5. Contact development team

---

**🎉 Congratulations!** Your IPA is ready for distribution. 