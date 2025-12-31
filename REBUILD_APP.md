# 🔨 Rebuild Your App

## Step 1: Open Terminal

Open Terminal on your Mac.

## Step 2: Navigate to Your Project

```bash
cd ~/Downloads/Edge-Hockey
```

## Step 3: Build the App

```bash
npm run build
```

This will:
- Build your web app with the new API URL from `.env`
- Create the `dist/` folder with your updated app

## Step 4: Sync Capacitor

```bash
npx cap sync ios
```

This updates the iOS project with your latest changes.

## Step 5: Push to GitHub

1. **Open GitHub Desktop**
2. **You should see changes** (the updated files)
3. **Commit with message:** "Add API URL for production backend"
4. **Click "Push origin"**

## Step 6: Wait for GitHub Actions Build

1. **Go to:** https://github.com/dkensk/replit/actions
2. **Wait for the build to complete** (10-15 minutes)
3. **Download the new build** from Artifacts
4. **Upload to TestFlight** again

---

## Quick Commands (Copy & Paste)

```bash
cd ~/Downloads/Edge-Hockey
npm run build
npx cap sync ios
```

Then commit and push in GitHub Desktop!

---

**Run these commands in Terminal, then push to GitHub!** 🚀

