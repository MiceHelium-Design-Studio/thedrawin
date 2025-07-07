# 🍎 The Draw Win - IPA Build Preparation Script (Windows)
# This script prepares the project for iOS build on macOS

param(
    [string]$Version = "",
    [string]$Build = "",
    [switch]$Help
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Show help
if ($Help) {
    Write-Host "🍎 The Draw Win - IPA Build Preparation Script" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\build-ipa.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -Version VERSION    Set app version (e.g., 1.1)" -ForegroundColor Gray
    Write-Host "  -Build BUILD        Set build number (e.g., 2)" -ForegroundColor Gray
    Write-Host "  -Help               Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\build-ipa.ps1 -Version 1.1 -Build 2" -ForegroundColor Gray
    Write-Host "  .\build-ipa.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Note: This script prepares the project for iOS build." -ForegroundColor Yellow
    Write-Host "      You must complete the build on macOS with Xcode." -ForegroundColor Yellow
    exit 0
}

# Main script
Write-Host "🍎 The Draw Win - IPA Build Preparation Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're on Windows
if ($env:OS -ne "Windows_NT") {
    Write-Error "This script is designed for Windows. Use build-ipa.sh on macOS."
    exit 1
}

# Check prerequisites
Write-Status "Checking prerequisites..."

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

# Check npx
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "npx is not available. Please install Node.js with npm."
    exit 1
}

Write-Success "All prerequisites are met!"

# Update version if provided
if ($Version -and $Build) {
    Write-Status "Updating version to $Version ($Build)..."
    
    # Update package.json version
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $packageJson.version = $Version
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    
    Write-Success "Version updated in package.json to $Version"
    Write-Warning "Remember to update ios/App/App/Info.plist on macOS"
}

# Build web assets
Write-Status "Building web assets..."

# Clean previous build
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Status "Cleaned previous build"
}

# Build the project
npm run build

if (Test-Path "dist") {
    Write-Success "Web assets built successfully"
} else {
    Write-Error "Failed to build web assets"
    exit 1
}

# Sync Capacitor
Write-Status "Syncing Capacitor..."
npx cap sync ios
Write-Success "Capacitor sync completed"

# Create build instructions file
Write-Status "Creating build instructions..."
$instructions = @"
# 🍎 iOS Build Instructions

## Prerequisites
- macOS with Xcode installed
- Apple Developer Account
- iOS device or simulator for testing

## Steps to Complete on macOS

### 1. Navigate to Project Directory
```bash
cd /path/to/your/project
```

### 2. Install CocoaPods Dependencies
```bash
cd ios/App
pod install
cd ../..
```

### 3. Open Xcode Project
```bash
npx cap open ios
```

### 4. Configure Signing & Capabilities
1. Select the "App" project in Xcode
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your development team
6. Ensure bundle identifier is: com.thedrawin.app

### 5. Update Version (if needed)
Edit: ios/App/App/Info.plist
- CFBundleShortVersionString: $Version
- CFBundleVersion: $Build

### 6. Build for Release
1. Select "Any iOS Device (arm64)" as target
2. Go to Product → Archive
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

```bash
# Make build-ipa.sh executable
chmod +x build-ipa.sh

# Run the build script
./build-ipa.sh -v $Version -b $Build --cli
```

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
"@

$instructions | Out-File -FilePath "ios-build-instructions.md" -Encoding UTF8
Write-Success "Build instructions created: ios-build-instructions.md"

# Create a simple batch file for macOS users
$batchContent = @"
#!/bin/bash
# Quick build script for macOS
# Run this on macOS to complete the iOS build

echo "🍎 Completing iOS build..."

# Install pods
cd ios/App
pod install
cd ../..

# Open Xcode
npx cap open ios

echo "✅ Xcode opened. Please complete the archive process manually."
echo "📖 See ios-build-instructions.md for detailed steps."
"@

$batchContent | Out-File -FilePath "complete-ios-build.sh" -Encoding UTF8
Write-Success "Quick build script created: complete-ios-build.sh"

Write-Host ""
Write-Success "Build preparation completed!"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Transfer project to macOS machine" -ForegroundColor Gray
Write-Host "2. Run: chmod +x complete-ios-build.sh && ./complete-ios-build.sh" -ForegroundColor Gray
Write-Host "3. Or follow instructions in: ios-build-instructions.md" -ForegroundColor Gray
Write-Host "4. Complete the archive process in Xcode" -ForegroundColor Gray
Write-Host ""
Write-Warning "Remember: iOS builds require macOS and Xcode!" 