# What is workflow_dispatch?

## What It Means

**`workflow_dispatch` is GOOD!** It means:
- ✅ The workflow CAN be manually triggered
- ✅ You can click "Run workflow" to start it
- ✅ It's not broken - it's a feature!

## How workflow_dispatch Works

In your workflow file, you have:
```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:  ← This allows manual triggering!
```

This means the workflow can run:
- ✅ Automatically on push (when you push code)
- ✅ Automatically on pull requests
- ✅ **Manually via "Run workflow" button** (workflow_dispatch)

## How to Actually Run It

### Step 1: Go to Actions Tab
- https://github.com/dkensk/replit/actions

### Step 2: Click "Build iOS App"
- In the left sidebar, click on "Build iOS App"

### Step 3: Find "Run workflow" Button
- Look at the **TOP RIGHT** of the page
- You should see a blue button that says **"Run workflow"**
- It's usually above the workflow runs list

### Step 4: Click It
1. **Click the blue "Run workflow" button**
2. **A dropdown appears** with:
   - Branch selector (select `main`)
   - A green "Run workflow" button
3. **Click the green "Run workflow" button**
4. **Wait 10 seconds, refresh the page**

## If You Still Don't See "Run workflow" Button

### Check 1: Are Actions Enabled?
1. Go to: https://github.com/dkensk/replit/settings/actions
2. Make sure "Allow all actions" is selected
3. Save if you changed it

### Check 2: Are You on the Right Page?
- Make sure you're on the **Actions tab** (not Code, Issues, etc.)
- Make sure you clicked **"Build iOS App"** in the sidebar
- The button is at the **top right**, not in the sidebar

### Check 3: Try Different Browser
- Sometimes browser extensions block buttons
- Try a different browser or incognito mode

## Alternative: Trigger via Push

If you can't find the button, you can trigger it by pushing code:

1. **Make a small change** (add a space to any file)
2. **Commit and push** via GitHub Desktop
3. **This will automatically trigger the workflow** (because of the `push:` trigger)

## Summary

- `workflow_dispatch` = Manual trigger enabled ✅
- Look for "Run workflow" button at TOP RIGHT
- Click it, then click green button in dropdown
- Or just push code to trigger it automatically

---

**workflow_dispatch is what lets you run it manually - look for the "Run workflow" button!** 🚀

