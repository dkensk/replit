# Troubleshooting: GitHub Actions Not Running

## Quick Checks

### 1. Verify the Workflow File is on GitHub
- Go to: https://github.com/dkensk/replit/tree/main/.github/workflows
- You should see `ios-build.yml` and `ios-deploy.yml`
- If you don't see them, the files weren't pushed

### 2. Check if GitHub Actions is Enabled
- Go to: https://github.com/dkensk/replit/settings/actions
- Make sure "Allow all actions and reusable workflows" is selected
- If it's disabled, enable it

### 3. Check the Actions Tab
- Go to: https://github.com/dkensk/replit/actions
- Look for any workflow runs (even failed ones)
- Check if there's a message about enabling Actions

### 4. Manually Trigger the Workflow
- Go to: https://github.com/dkensk/replit/actions
- Click on "Build iOS App" workflow (on the left sidebar)
- Click "Run workflow" button
- Select branch: `main`
- Click "Run workflow"

## Common Issues

### Issue: "Actions tab shows nothing"
**Solution:** GitHub Actions might be disabled. Enable it in Settings → Actions.

### Issue: "Workflow file not found"
**Solution:** The `.github/workflows/` folder might not have been pushed. Re-push your code.

### Issue: "No workflow runs"
**Solution:** Try manually triggering the workflow (see step 4 above).

## If Nothing Works

1. **Verify files were pushed:**
   - Check: https://github.com/dkensk/replit
   - You should see all your project files
   - Look for `.github` folder

2. **Re-push if needed:**
   - Make a small change (add a space to a file)
   - Commit and push again
   - This will trigger the workflow

3. **Check repository settings:**
   - Go to: https://github.com/dkensk/replit/settings
   - Make sure the repository isn't archived
   - Check that Actions are enabled

