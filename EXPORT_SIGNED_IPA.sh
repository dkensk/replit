#!/bin/bash

# Export Signed IPA from Archive
# This script exports your archive to a signed IPA using automatic signing

# Find your archive - search in multiple locations
echo "🔍 Searching for App.xcarchive..."

# Check common locations (including Downloads where we just created it)
POSSIBLE_PATHS=(
    "$HOME/Downloads/App.xcarchive"
    "$HOME/Library/Developer/Xcode/Archives/App.xcarchive"
    "$HOME/Desktop/App.xcarchive"
    "$HOME/Documents/App.xcarchive"
)

ARCHIVE_PATH=""

# Check each possible path
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        ARCHIVE_PATH="$path"
        echo "✓ Found at: $path"
        break
    fi
done

# If not found, search recursively in common locations
if [ -z "$ARCHIVE_PATH" ]; then
    echo "Searching in Archives folder..."
    ARCHIVE_PATH=$(find "$HOME/Library/Developer/Xcode/Archives" -name "App.xcarchive" -type d 2>/dev/null | head -1)
fi

# Search in Downloads
if [ -z "$ARCHIVE_PATH" ]; then
    echo "Searching in Downloads..."
    ARCHIVE_PATH=$(find "$HOME/Downloads" -name "App.xcarchive" -type d 2>/dev/null | head -1)
fi

# Search in Desktop
if [ -z "$ARCHIVE_PATH" ]; then
    echo "Searching in Desktop..."
    ARCHIVE_PATH=$(find "$HOME/Desktop" -name "App.xcarchive" -type d 2>/dev/null | head -1)
fi

# Search entire home directory (last resort)
if [ -z "$ARCHIVE_PATH" ]; then
    echo "Searching entire home directory (this may take a moment)..."
    ARCHIVE_PATH=$(find "$HOME" -name "App.xcarchive" -type d 2>/dev/null | head -1)
fi

if [ -z "$ARCHIVE_PATH" ] || [ ! -d "$ARCHIVE_PATH" ]; then
    echo ""
    echo "❌ Archive not found!"
    echo ""
    echo "Please tell me where your App.xcarchive folder is located."
    echo "Or you can:"
    echo "1. Find the App.xcarchive folder in Finder"
    echo "2. Drag it into Terminal to show the path"
    echo "3. Or run this command to search:"
    echo "   find ~ -name 'App.xcarchive' -type d"
    exit 1
fi

echo "✓ Found archive at: $ARCHIVE_PATH"

# Get team ID from user
echo ""
echo "To sign the app, we need your Apple Developer Team ID."
echo "You can find it at: https://developer.apple.com/account → Membership"
echo "It looks like: ABC123DEF4 (10 characters, letters and numbers)"
echo ""
while [ -z "$TEAM_ID" ]; do
    read -p "Enter your Team ID: " TEAM_ID
    # Remove any whitespace
    TEAM_ID=$(echo "$TEAM_ID" | tr -d '[:space:]')
    if [ -z "$TEAM_ID" ]; then
        echo "Team ID is required. Please enter it."
    fi
done
echo "Using Team ID: $TEAM_ID"

# Create export options for App Store with automatic signing
EXPORT_OPTIONS="/tmp/exportOptions.plist"
cat > "$EXPORT_OPTIONS" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
EOF

# Add team ID if provided
if [ -n "$TEAM_ID" ]; then
    cat >> "$EXPORT_OPTIONS" << EOF
    <key>teamID</key>
    <string>$TEAM_ID</string>
EOF
fi

cat >> "$EXPORT_OPTIONS" << EOF
</dict>
</plist>
EOF

# Export path
EXPORT_PATH="$HOME/Desktop/EdgeHockey-IPA"
mkdir -p "$EXPORT_PATH"

echo "📦 Exporting signed IPA..."
echo "This will use automatic signing with your Apple Developer account"
echo ""
echo "Archive: $ARCHIVE_PATH"
echo "Export to: $EXPORT_PATH"
echo ""

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates 2>&1 | tee /tmp/xcode_export.log

EXPORT_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXPORT_EXIT_CODE -eq 0 ]; then
    echo "✅ Export completed!"
    echo ""
    echo "Checking for IPA file..."
    
    # Check if IPA was created
    IPA_FILE=$(find "$EXPORT_PATH" -name "*.ipa" -type f | head -1)
    
    if [ -n "$IPA_FILE" ]; then
        echo "✅ IPA found at:"
        echo "$IPA_FILE"
        echo ""
        echo "File size:"
        ls -lh "$IPA_FILE"
        echo ""
        echo "📱 Next steps:"
        echo "1. Open Transporter app"
        echo "2. Drag this file into Transporter:"
        echo "   $IPA_FILE"
        echo "3. Click Deliver"
    else
        echo "⚠️  Export completed but IPA file not found in expected location"
        echo ""
        echo "Checking export directory contents:"
        ls -lah "$EXPORT_PATH" 2>/dev/null || echo "Export directory doesn't exist"
        echo ""
        echo "Searching for IPA files..."
        find "$HOME" -name "*.ipa" -type f -mtime -1 2>/dev/null | head -5 || echo "No recent IPA files found"
    fi
else
    echo "❌ Export failed with exit code: $EXPORT_EXIT_CODE"
    echo ""
    echo "Error details:"
    tail -50 /tmp/xcode_export.log | grep -i "error\|failed\|fatal" || echo "Check full log at /tmp/xcode_export.log"
    echo ""
    echo "Full error log saved to: /tmp/xcode_export.log"
    exit 1
fi
