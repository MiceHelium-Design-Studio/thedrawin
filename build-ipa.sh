#!/bin/bash

# 🍎 The Draw Win - IPA Build Script
# This script automates the process of building a release IPA file

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script must be run on macOS for iOS development"
        exit 1
    fi
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Xcode
    if ! command_exists xcodebuild; then
        print_error "Xcode is not installed. Please install Xcode from the Mac App Store."
        exit 1
    fi
    
    # Check Capacitor CLI
    if ! command_exists npx; then
        print_error "npx is not available. Please install Node.js with npm."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Function to update version numbers
update_version() {
    local version=$1
    local build=$2
    
    if [[ -z "$version" || -z "$build" ]]; then
        print_warning "No version specified. Using current version from Info.plist"
        return
    fi
    
    print_status "Updating version to $version ($build)..."
    
    # Update Info.plist
    if [[ -f "ios/App/App/Info.plist" ]]; then
        # Update CFBundleShortVersionString
        sed -i '' "s/<key>CFBundleShortVersionString<\/key>.*/<key>CFBundleShortVersionString<\/key>\n\t<string>$version<\/string>/" ios/App/App/Info.plist
        
        # Update CFBundleVersion
        sed -i '' "s/<key>CFBundleVersion<\/key>.*/<key>CFBundleVersion<\/key>\n\t<string>$build<\/string>/" ios/App/App/Info.plist
        
        print_success "Version updated to $version ($build)"
    else
        print_warning "Info.plist not found. Please update version manually."
    fi
}

# Function to build web assets
build_web_assets() {
    print_status "Building web assets..."
    
    # Clean previous build
    if [[ -d "dist" ]]; then
        rm -rf dist
        print_status "Cleaned previous build"
    fi
    
    # Build the project
    npm run build
    
    if [[ -d "dist" ]]; then
        print_success "Web assets built successfully"
    else
        print_error "Failed to build web assets"
        exit 1
    fi
}

# Function to sync Capacitor
sync_capacitor() {
    print_status "Syncing Capacitor..."
    
    npx cap sync ios
    
    print_success "Capacitor sync completed"
}

# Function to install pods
install_pods() {
    print_status "Installing CocoaPods dependencies..."
    
    cd ios/App
    
    # Remove existing Pods if they exist
    if [[ -d "Pods" ]]; then
        rm -rf Pods
        rm -f Podfile.lock
        print_status "Cleaned existing Pods"
    fi
    
    # Install pods
    pod install
    
    cd ../..
    
    print_success "CocoaPods dependencies installed"
}

# Function to open Xcode
open_xcode() {
    print_status "Opening Xcode project..."
    
    npx cap open ios
    
    print_success "Xcode project opened"
    print_warning "Please complete the following steps in Xcode:"
    echo "1. Select your development team in Signing & Capabilities"
    echo "2. Choose 'Any iOS Device (arm64)' as the target"
    echo "3. Go to Product → Archive"
    echo "4. Follow the distribution wizard to create your IPA"
}

# Function to build IPA using command line (alternative)
build_ipa_cli() {
    print_status "Building IPA using command line..."
    
    cd ios/App
    
    # Build archive
    xcodebuild -workspace App.xcworkspace \
               -scheme App \
               -configuration Release \
               -destination generic/platform=iOS \
               -archivePath App.xcarchive \
               archive
    
    if [[ $? -eq 0 ]]; then
        print_success "Archive created successfully"
        
        # Export IPA
        xcodebuild -exportArchive \
                   -archivePath App.xcarchive \
                   -exportPath ./build \
                   -exportOptionsPlist exportOptions.plist
        
        if [[ $? -eq 0 ]]; then
            print_success "IPA exported successfully"
            print_status "IPA location: ios/App/build/App.ipa"
        else
            print_error "Failed to export IPA"
            exit 1
        fi
    else
        print_error "Failed to create archive"
        exit 1
    fi
    
    cd ../..
}

# Function to create export options plist
create_export_options() {
    print_status "Creating export options plist..."
    
    cat > ios/App/exportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
EOF
    
    print_warning "Please update ios/App/exportOptions.plist with your team ID"
}

# Main function
main() {
    echo "🍎 The Draw Win - IPA Build Script"
    echo "=================================="
    echo ""
    
    # Parse command line arguments
    VERSION=""
    BUILD=""
    USE_CLI=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -b|--build)
                BUILD="$2"
                shift 2
                ;;
            --cli)
                USE_CLI=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -v, --version VERSION    Set app version (e.g., 1.1)"
                echo "  -b, --build BUILD        Set build number (e.g., 2)"
                echo "  --cli                    Use command line build instead of opening Xcode"
                echo "  -h, --help               Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0 -v 1.1 -b 2          # Build with version 1.1 and build number 2"
                echo "  $0 --cli                 # Build using command line tools"
                echo "  $0                       # Interactive build with Xcode"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Update version if provided
    if [[ -n "$VERSION" && -n "$BUILD" ]]; then
        update_version "$VERSION" "$BUILD"
    fi
    
    # Build web assets
    build_web_assets
    
    # Sync Capacitor
    sync_capacitor
    
    # Install pods
    install_pods
    
    # Choose build method
    if [[ "$USE_CLI" == true ]]; then
        create_export_options
        build_ipa_cli
    else
        open_xcode
    fi
    
    echo ""
    print_success "Build process completed!"
    echo ""
    echo "Next steps:"
    echo "1. If using Xcode: Complete the archive and distribution process"
    echo "2. If using CLI: Check ios/App/build/App.ipa"
    echo "3. Test your IPA on target devices"
    echo "4. Submit to App Store Connect if ready for distribution"
}

# Run main function with all arguments
main "$@" 