# 📤 Push Changes to GitHub Using GitHub Desktop

## Step 1: Open GitHub Desktop

1. **Open GitHub Desktop** app on your Mac
2. **Make sure you're in the correct repository:**
   - It should show: `dkensk/replit` or `Edge-Hockey`
   - If not, click **File → Add Local Repository**
   - Navigate to: `/Users/davidkensick/Documents/edge-hockey/Edge-Hockey`
   - Click **Add Repository**

## Step 2: See Your Changes

You should see a list of changed files on the left, including:
- `server/index.ts` (CORS fix)
- `client/src/lib/api.ts` (API URL fix)
- `client/src/lib/queryClient.ts` (API URL fix)
- `client/src/hooks/use-auth.tsx` (API URL fix)
- Any other files you've changed

## Step 3: Commit Your Changes

1. **At the bottom left**, you'll see a text box for the commit message
2. **Type:** `Fix API URL for mobile and add CORS support`
3. **Review the files** that will be committed (they should be checked)
4. **Click "Commit to main"** (or your branch name)

## Step 4: Push to GitHub

1. **After committing**, you'll see a button at the top that says **"Push origin"** or **"Push X commits"**
2. **Click it**
3. **Wait for it to complete** (you'll see a progress indicator)

## Step 5: Verify Push

1. **Go to:** https://github.com/dkensk/replit
2. **You should see your latest commit** at the top
3. **Railway will automatically detect the push** and start deploying

---

## If You Don't See the Repository

1. **Click File → Add Local Repository**
2. **Click "Choose..."**
3. **Navigate to:** `/Users/davidkensick/Documents/edge-hockey/Edge-Hockey`
4. **Click "Add Repository"**
5. **Then follow steps 2-4 above**

---

**Once you push, Railway will automatically deploy your backend with the CORS fix!** 🚀

