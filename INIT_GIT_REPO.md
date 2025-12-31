# 🔧 Initialize Git Repository

## The Issue

Your `Edge-Hockey` folder is set up as a submodule, but it needs to be its own git repository to push changes.

## Solution: Initialize Git in Edge-Hockey

Run these commands in Terminal:

```bash
cd /Users/davidkensick/Documents/edge-hockey/Edge-Hockey
git init
git remote add origin https://github.com/dkensk/replit.git
git add .
git commit -m "Fix API URL for mobile and add CORS support"
git push -u origin main
```

**OR** if the remote already exists:

```bash
cd /Users/davidkensick/Documents/edge-hockey/Edge-Hockey
git init
git remote set-url origin https://github.com/dkensk/replit.git
git add .
git commit -m "Fix API URL for mobile and add CORS support"
git branch -M main
git push -u origin main
```

---

## Then in GitHub Desktop

After running the commands above:

1. **Open GitHub Desktop**
2. **File → Add Local Repository**
3. **Choose:** `/Users/davidkensick/Documents/edge-hockey/Edge-Hockey`
4. **You should now see** all your changes!

---

**Run the git commands above to set up the repository, then use GitHub Desktop!**

