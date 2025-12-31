# Push Code to GitHub - Simple Instructions

Your code is ready to push! Here's the easiest way:

## Quick Method (Recommended)

1. **Open Terminal** (just this once - you won't need it after this)

2. **Navigate to your project:**
   ```bash
   cd /Users/davidkensick/Downloads/Edge-Hockey
   ```

3. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

4. **When prompted for credentials:**
   - **Username:** `dkensk`
   - **Password:** Use a Personal Access Token (see below)

## Create Personal Access Token (One-Time Setup)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: "Edge Hockey Push"
4. Select scope: ✅ **repo** (check the box)
5. Click **"Generate token"**
6. **Copy the token** (you'll only see it once!)

7. When you run `git push`, use:
   - Username: `dkensk`
   - Password: **paste your token** (not your GitHub password)

## Alternative: Use GitHub Desktop

If you prefer a visual interface:

1. Download: https://desktop.github.com/
2. Sign in with your GitHub account
3. File → Add Local Repository
4. Select: `/Users/davidkensick/Downloads/Edge-Hockey`
5. Click "Publish repository"

## After Pushing

Once pushed, your GitHub Actions workflow will automatically:
- ✅ Build your iOS app
- ✅ Create artifacts you can download
- ✅ Ready for App Store deployment

Check the **Actions** tab in your GitHub repository to see the build progress!

