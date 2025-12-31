# 🔧 Fix Build Error

## The Problem

The error `tsx: command not found` means dependencies aren't installed.

## Solution

Run these commands in order:

```bash
cd ~/Downloads/Edge-Hockey
npm install
npm run build
npx cap sync ios
```

The `npm install` will install all dependencies including `tsx`.

---

## Full Rebuild Process

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Sync Capacitor:**
   ```bash
   npx cap sync ios
   ```

4. **Push to GitHub** (in GitHub Desktop)

5. **Wait for build** on GitHub Actions

6. **Download and upload** to TestFlight

---

**Run `npm install` first, then try building again!**

