# 🔐 Fix GitHub Authentication

## The Problem

GitHub no longer accepts passwords. You need a **Personal Access Token (PAT)**.

## Solution: Use GitHub Desktop (Easiest)

Since you already have GitHub Desktop set up, use it instead:

### Step 1: Add Repository to GitHub Desktop

1. **Open GitHub Desktop**
2. **File → Add Local Repository**
3. **Click "Choose..."**
4. **Navigate to:** `/Users/davidkensick/Documents/edge-hockey/Edge-Hockey`
5. **Click "Add Repository"**

### Step 2: Commit and Push

1. **You should see your changed files** in GitHub Desktop
2. **Type commit message:** `Fix API URL for mobile and add CORS support`
3. **Click "Commit to main"**
4. **Click "Push origin"**

GitHub Desktop will handle authentication automatically!

---

## Alternative: Create Personal Access Token

If you want to use Terminal:

1. **Go to:** https://github.com/settings/tokens
2. **Click "Generate new token" → "Generate new token (classic)"**
3. **Give it a name:** "Edge Hockey Development"
4. **Select scopes:** Check `repo` (full control of private repositories)
5. **Click "Generate token"**
6. **Copy the token** (you won't see it again!)

7. **Then in Terminal:**
   ```bash
   cd /Users/davidkensick/Documents/edge-hockey/Edge-Hockey
   git remote set-url origin https://dkensk:YOUR_TOKEN@github.com/dkensk/replit.git
   git push -u origin main
   ```
   (Replace `YOUR_TOKEN` with the token you copied)

---

**I recommend using GitHub Desktop - it's much easier!** Just add the repository and push.

