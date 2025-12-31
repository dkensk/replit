# 📁 Copy Archive to Xcode - Step by Step

## The Archives Folder Might Not Exist Yet

If the folder doesn't exist, we need to create it first.

## Method 1: Create Folder and Copy (Easiest)

### Step 1: Create the Archives Folder

1. **Open Finder**
2. **Press `Cmd+Shift+G`** (Go to Folder)
3. **Type:** `~/Library/Developer/Xcode`
4. **Press Enter**
5. **If the folder opens:**
   - Look for an `Archives` folder
   - **If it doesn't exist**, create it:
     - Right-click in the folder → **New Folder**
     - Name it: `Archives`
6. **If you get an error** (folder doesn't exist):
   - Go to: `~/Library/Developer/`
   - Create a folder called `Xcode` (if it doesn't exist)
   - Inside `Xcode`, create a folder called `Archives`

### Step 2: Copy Your Archive

1. **Find your `App.xcarchive` folder** (from the downloaded artifact)
2. **Copy it** (Cmd+C)
3. **Navigate to:** `~/Library/Developer/Xcode/Archives`
4. **Paste it** (Cmd+V)

### Step 3: Open Xcode Organizer

1. **Open Xcode**
2. **Window → Organizer** (`Cmd+Shift+9`)
3. **Click Archives tab**
4. **Your archive should appear!**

---

## Method 2: Use Terminal (Alternative)

If Finder isn't working, open Terminal and run:

```bash
# Create the Archives folder if it doesn't exist
mkdir -p ~/Library/Developer/Xcode/Archives

# Copy your archive (replace [path] with your actual archive path)
cp -r [path to your App.xcarchive] ~/Library/Developer/Xcode/Archives/
```

For example, if your archive is on Desktop:
```bash
cp -r ~/Desktop/App.xcarchive ~/Library/Developer/Xcode/Archives/
```

---

## Method 3: Drag Directly into Xcode Organizer

Some versions of Xcode allow you to drag the archive directly:

1. **Open Xcode**
2. **Window → Organizer** (`Cmd+Shift+9`)
3. **Click Archives tab**
4. **Try dragging your `App.xcarchive` folder** directly into the Organizer window
5. **If it accepts it**, you're done!

---

**Try Method 3 first** - it's the simplest if it works! Otherwise, use Method 1 to create the folder structure.

