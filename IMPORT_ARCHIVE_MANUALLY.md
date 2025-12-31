# 📥 Import Archive Manually in Xcode

## The Problem

Xcode is filtering by "TurnCard" project and won't show your archive. We need to import it manually.

## Solution: Use xcodebuild to Export Signed IPA

Since Xcode Organizer isn't working, we'll use the command line to create a signed IPA.

### Step 1: Check Your Archive Location

1. **Find where your `App.xcarchive` is**
   - It should be in: `~/Library/Developer/Xcode/Archives/`
   - Or wherever you copied it

### Step 2: Create exportOptions.plist

We need to create a file that tells xcodebuild how to export. I can help you create this file, or you can use Xcode's automatic signing.

### Step 3: Export with Automatic Signing

Open Terminal and run:

```bash
# Navigate to where your archive is
cd ~/Library/Developer/Xcode/Archives

# Find your archive (it might be in a dated folder)
# List archives to find the right one
ls -la

# Export with automatic signing (replace path with your actual archive path)
xcodebuild -exportArchive \
  -archivePath [path to App.xcarchive] \
  -exportPath ~/Desktop/EdgeHockey-IPA \
  -exportOptionsPlist [path to exportOptions.plist] \
  -allowProvisioningUpdates
```

But we need to create the exportOptions.plist first.

---

## Alternative: Update Workflow to Create Signed Build

The easiest long-term solution is to update the GitHub Actions workflow to create a signed build automatically. But this requires setting up certificates in GitHub Secrets.

---

**For now, let me create an exportOptions.plist file for you that you can use with the command above.**

Would you like me to:
1. Create the exportOptions.plist file for you?
2. Or help you set up automated signing in the GitHub workflow?

