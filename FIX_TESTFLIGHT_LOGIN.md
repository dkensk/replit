# 🔧 Fix TestFlight Login Issue

## The Problem

Your app can't login on TestFlight because it's trying to connect to `/api/login` which doesn't exist on a mobile device. The app needs to point to your production backend server.

## What I Fixed

I've updated the code to:
1. **Detect if running on native platform** (iOS/Android)
2. **Use production API URL** when on native
3. **Use relative paths** when on web (for development)

## What You Need to Do

### Step 1: Deploy Your Backend

You need to deploy your backend server to a public URL. Options:
- **Replit** (if that's where your backend is)
- **Heroku**
- **Railway**
- **Render**
- **AWS/Google Cloud/Azure**
- Any hosting service that supports Node.js

### Step 2: Update the API URL

Once you have your backend URL, you have two options:

#### Option A: Use Environment Variable (Recommended)

1. **Create a `.env` file** in the project root:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Rebuild the app:**
   ```bash
   npm run build
   ```

3. **Sync Capacitor:**
   ```bash
   npx cap sync ios
   ```

4. **Rebuild and upload to TestFlight**

#### Option B: Update Code Directly

Edit `client/src/lib/api.ts` and `client/src/lib/queryClient.ts`:
- Replace `"https://your-backend-url.com/api"` with your actual backend URL

### Step 3: Rebuild and Upload

1. **Build the app:**
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **Push to GitHub** (triggers build)

3. **Download the new build** from GitHub Actions

4. **Export and upload** to TestFlight again

---

## Important Notes

- **CORS:** Make sure your backend allows requests from your app's origin
- **HTTPS:** iOS requires HTTPS for API calls (no HTTP)
- **Session/Cookies:** The app uses cookie-based sessions - make sure your backend handles CORS with credentials

---

## Quick Test

Before rebuilding, you can test if your backend is accessible:
1. Open Safari on your iPhone
2. Go to: `https://your-backend-url.com/api/user`
3. If it loads (even with an error), the backend is accessible

---

**Once you have your backend URL, update the code and rebuild!**

