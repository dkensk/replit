# 🔑 Get Your Apple Developer Team ID

## How to Find Your Team ID

1. **Go to:** https://developer.apple.com/account
2. **Sign in** with your Apple Developer account
3. **Click "Membership"** in the left sidebar
4. **Look for "Team ID"** - it looks like: `ABC123DEF4` (10 characters, letters and numbers)
5. **Copy it**

## Then Run the Script

The script will now ask for your Team ID. Paste it when prompted.

Or you can run the export command directly with your Team ID:

```bash
# Replace YOUR_TEAM_ID with your actual Team ID
xcodebuild -exportArchive \
  -archivePath ~/Downloads/App.xcarchive \
  -exportPath ~/Desktop/EdgeHockey-IPA \
  -exportOptionsPlist /tmp/exportOptions.plist \
  -allowProvisioningUpdates
```

But first, let's update the exportOptions.plist with your Team ID.

