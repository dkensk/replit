# 📦 Export IPA from .xcarchive

## Method 1: Copy Archive to Xcode's Location (Easiest)

Xcode looks for archives in a specific folder. Let's put it there:

1. **Find Xcode's Archives folder:**
   - Open Finder
   - Press `Cmd+Shift+G` (Go to Folder)
   - Type: `~/Library/Developer/Xcode/Archives`
   - Press Enter

2. **Copy your archive there:**
   - Drag your `App.xcarchive` folder into that Archives folder
   - Or copy/paste it there

3. **Open Xcode Organizer:**
   - Open Xcode
   - Window → Organizer (Cmd+Shift+9)
   - Click Archives tab
   - Your archive should now appear in the list!

4. **Distribute:**
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the prompts

---

## Method 2: Use Terminal (Quick Command)

If you're comfortable with a quick terminal command:

1. **Open Terminal**
2. **Navigate to where your archive is:**
   ```bash
   cd ~/Downloads  # or wherever your archive is
   ```

3. **Find the full path to your archive:**
   - Drag the `App.xcarchive` folder into Terminal
   - It will show the path

4. **Export IPA using xcodebuild:**
   ```bash
   xcodebuild -exportArchive \
     -archivePath [paste the path here]/App.xcarchive \
     -exportPath ~/Desktop/EdgeHockey-IPA \
     -exportOptionsPlist [path to exportOptions.plist]
   ```

But this requires the exportOptions.plist file to be configured properly.

---

## Method 3: Manual IPA Creation (If others don't work)

I can guide you through manually creating an IPA, but it's more complex.

---

**Try Method 1 first - it's the easiest!** Just copy the archive to Xcode's Archives folder and it should appear in Organizer.

