# 🔨 How to Build Release APK - Complete Guide

## 🎯 Overview

This guide explains how to create a signed release APK for **The Draw Win** app after making changes to your code. Follow these steps whenever you need to build a new APK for distribution.

---

## 📋 Prerequisites

### ✅ **Required Software**
- **Node.js** (with npm)
- **Java 17** (specifically Microsoft OpenJDK 17.0.15)
- **Android SDK** (through Android Studio or standalone)
- **Git** (for version control)

### 📁 **Required Files**
- **Keystore:** `android/thedrawin-release-key.keystore`
- **Passwords:** Store `thedrawin123` securely

---

## 🚀 Step-by-Step Build Process

### **Step 1: Update Your Code**
Make all necessary changes to your React/TypeScript code in the `src/` directory.

### **Step 2: Update Version (Important!)**
```bash
# Edit android/app/build.gradle
# Update these lines:
versionCode 2          # Increment by 1
versionName "1.1"      # Update version string
```

### **Step 3: Build Web Assets**
```bash
# In project root directory
npm run build
```
**Expected Output:** `dist/` folder with compiled web assets

### **Step 4: Sync Capacitor**
```bash
npx cap sync android
```
**Expected Output:** `✓ Sync finished in ~1s`

### **Step 5: Configure Build Environment**
```powershell
# Set Java SSL configuration (fixes network issues)
$env:JAVA_OPTS="-Djavax.net.ssl.trustStore=`"$env:JAVA_HOME\lib\security\cacerts`" -Djavax.net.ssl.trustStorePassword=changeit"
```

### **Step 6: Navigate to Android Directory**
```bash
cd android
```

### **Step 7: Build Signed Release APK**
```bash
./gradlew assembleRelease --no-daemon
```
**Expected Output:** `BUILD SUCCESSFUL in ~4 minutes`

### **Step 8: Locate Your APK**
```
📍 Location: android/app/build/outputs/apk/release/app-release.apk
📊 Size: ~6MB
✅ Status: Signed and ready for distribution
```

---

## ⚙️ Configuration Files (Already Set Up)

### 🔧 **Signing Configuration (android/app/build.gradle)**
```gradle
signingConfigs {
    release {
        keyAlias 'thedrawin'
        keyPassword 'thedrawin123'
        storeFile file('../thedrawin-release-key.keystore')
        storePassword 'thedrawin123'
    }
}

buildTypes {
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
```

### 📝 **Gradle Properties (android/gradle.properties)**
```properties
# Force Java 17 for all Java compilations
org.gradle.java.home=C:/Program Files/Microsoft/jdk-17.0.15.6-hotspot
org.gradle.java.installations.auto-detect=false
org.gradle.java.installations.auto-download=false
android.buildFeatures.buildConfig=true
```

### 📱 **Capacitor Versions (package.json)**
```json
"@capacitor/cli": "6.1.2",
"@capacitor/core": "6.1.2",
"@capacitor/android": "6.1.2",
"@capacitor/push-notifications": "6.0.2",
"@capacitor/splash-screen": "6.0.2",
"@capacitor/status-bar": "6.0.1"
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Java Version Conflicts**
```
Error: invalid source release: 21
```
**Solution:**
```bash
# Verify Java 17 is installed
java -version
# Should show: openjdk version "17.x.x"

# Set environment variable
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.15.6-hotspot"
```

### **Issue 2: Network/SSL Issues**
```
Error: Could not GET 'https://dl.google.com/...'
```
**Solution:**
```powershell
# Set SSL trust store configuration
$env:JAVA_OPTS="-Djavax.net.ssl.trustStore=`"$env:JAVA_HOME\lib\security\cacerts`" -Djavax.net.ssl.trustStorePassword=changeit"
```

### **Issue 3: Signing Errors**
```
Error: keystore password was incorrect
```
**Solution:**
- Verify keystore file exists: `android/thedrawin-release-key.keystore`
- Check passwords in `build.gradle` match: `thedrawin123`
- Regenerate keystore if needed (see Advanced section)

### **Issue 4: Plugin Version Conflicts**
```
Error: peer dependency conflicts
```
**Solution:**
```bash
# Force install compatible versions
npm install @capacitor/push-notifications@6.0.2 @capacitor/splash-screen@6.0.2 @capacitor/status-bar@6.0.1 --force
npx cap sync android
```

---

## 🎯 Quick Build Commands

### **Standard Build Process:**
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Set Java SSL config (PowerShell)
$env:JAVA_OPTS="-Djavax.net.ssl.trustStore=`"$env:JAVA_HOME\lib\security\cacerts`" -Djavax.net.ssl.trustStorePassword=changeit"

# 4. Build APK
cd android
./gradlew assembleRelease --no-daemon
```

### **Clean Build (if issues occur):**
```bash
# Clean everything and rebuild
cd android
./gradlew clean
cd ..
npm run build
npx cap sync android
$env:JAVA_OPTS="-Djavax.net.ssl.trustStore=`"$env:JAVA_HOME\lib\security\cacerts`" -Djavax.net.ssl.trustStorePassword=changeit"
cd android
./gradlew assembleRelease --no-daemon
```

---

## 📊 Version Management

### **For Each Release:**
1. **Update Version Numbers:**
   ```gradle
   // In android/app/build.gradle
   versionCode 3        // Always increment
   versionName "1.2"    // Update semantic version
   ```

2. **Update App Info (Optional):**
   ```typescript
   // In capacitor.config.ts
   appName: 'The Draw Win v1.2'
   ```

3. **Tag Release (Git):**
   ```bash
   git add .
   git commit -m "Release v1.2 - Added new features"
   git tag v1.2
   git push origin main --tags
   ```

---

## 🔐 Advanced: Keystore Management

### **If You Need to Recreate the Keystore:**
```bash
cd android
keytool -genkey -v -keystore thedrawin-release-key.keystore -alias thedrawin -keyalg RSA -keysize 2048 -validity 10000 -storepass thedrawin123 -keypass thedrawin123 -dname "CN=Marco Campos, OU=thedrawin, O=drawin, L=merida, ST=yucatan, C=MX"
```

### **Backup Your Keystore:**
```bash
# CRITICAL: Always backup your keystore
cp android/thedrawin-release-key.keystore ~/backups/thedrawin-keystore-backup.keystore
```

---

## 📱 Testing Your APK

### **Install on Device:**
1. Transfer `app-release.apk` to Android device
2. Enable "Unknown Sources" in device settings
3. Install APK and test functionality

### **Verify Signing:**
```bash
# Check APK signature
keytool -printcert -jarfile android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Distribution

### **Google Play Store:**
1. Login to [Google Play Console](https://play.google.com/console)
2. Upload `app-release.apk` to release management
3. Complete store listing information
4. Submit for review

### **Direct Distribution:**
- Share APK file directly
- Host on your website
- Use enterprise distribution platforms

---

## 📝 Build Checklist

Before each release, verify:

- [ ] Code changes completed and tested
- [ ] Version numbers updated in `build.gradle`
- [ ] Web assets built successfully (`npm run build`)
- [ ] Capacitor sync completed (`npx cap sync android`)
- [ ] Java environment configured correctly
- [ ] APK builds without errors
- [ ] APK file size reasonable (~6MB)
- [ ] APK installs and runs on test device
- [ ] Keystore backed up securely

---

## 🎯 Summary

**Every time you want to release a new APK:**

1. **Make your code changes**
2. **Update version numbers**
3. **Run the build commands** (4 simple steps)
4. **Test the APK**
5. **Distribute or upload to stores**

**Your APK will be at:** `android/app/build/outputs/apk/release/app-release.apk`

---

**🎉 Happy building!**

*Last updated: July 3, 2025*
