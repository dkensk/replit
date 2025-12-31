# 🚀 Next Steps - You Have Apple Developer Account!

## ✅ What You Have
- ✅ Apple Developer account
- ✅ Working iOS build pipeline
- ✅ Builds running successfully on GitHub Actions

## 🎯 Your Next Steps (Choose One)

---

## **Option 1: Quick Upload with Transporter** ⭐ (Fastest)

### Step 1: Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click **My Apps** → **+** → **New App**
4. Fill in:
   - **Platform**: iOS
   - **Name**: Edge Hockey
   - **Primary Language**: English
   - **Bundle ID**: `com.edgehockey.app` (must match exactly!)
   - **SKU**: `edge-hockey-001` (or any unique identifier)
5. Click **Create**

### Step 2: Download Your Build
1. Go to: https://github.com/dkensk/replit/actions
2. Click the latest successful workflow run (green checkmark ✓)
3. Scroll down to **Artifacts** section
4. Click **ios-app** to download
5. Extract the ZIP file
6. You'll find `App.xcarchive` inside

### Step 3: Upload with Transporter
1. Download **Transporter** from Mac App Store (free)
2. Open Transporter app
3. Sign in with your Apple Developer account
4. Drag the `App.xcarchive` file into Transporter
5. Transporter will automatically:
   - Sign the app with your developer account
   - Upload to App Store Connect
6. Wait for upload to complete
7. Click **Deliver** when ready

### Step 4: Submit for Review
1. Go back to App Store Connect
2. Your app will show "Processing..." then "Ready to Submit"
3. Fill in required information:
   - **App Description**
   - **Screenshots** (required - at least one for each device size)
   - **App Icon** (1024x1024)
   - **Privacy Policy URL** (if your app collects data)
   - **Category**
   - **Age Rating**
4. Click **Submit for Review**

**That's it!** Apple will review your app (typically 1-7 days).

---

## **Option 2: Automated Signing in GitHub** (For Future Updates)

If you want GitHub Actions to automatically create signed builds, you'll need to set up certificates:

### Step 1: Get Your Team ID
1. Go to https://developer.apple.com/account
2. Click **Membership** in the sidebar
3. Copy your **Team ID** (looks like: `ABC123DEF4`)

### Step 2: Create Distribution Certificate
1. Go to https://developer.apple.com/account/resources/certificates/list
2. Click **+** button
3. Select **Apple Distribution**
4. Click **Continue** → **Continue** again
5. Upload a Certificate Signing Request (CSR):
   - On Mac: Open **Keychain Access** → **Certificate Assistant** → **Request a Certificate**
   - Enter your email and name
   - Save to disk
   - Upload the `.certSigningRequest` file
6. Download the certificate
7. Double-click to install in Keychain
8. In Keychain Access, find "Apple Distribution" certificate
9. Right-click → **Export** → Save as `.p12` file
10. Set a password (remember this!)

### Step 3: Create Provisioning Profile
1. Go to https://developer.apple.com/account/resources/profiles/list
2. Click **+** button
3. Select **App Store** under Distribution
4. Select your app (`com.edgehockey.app`)
5. Select your Distribution Certificate
6. Give it a name (e.g., "Edge Hockey App Store")
7. Click **Generate**
8. Download the `.mobileprovision` file

### Step 4: Add GitHub Secrets
1. Go to: https://github.com/dkensk/replit/settings/secrets/actions
2. Click **New repository secret** for each:

   **Secret 1: APPLE_CERTIFICATE_BASE64**
   - On Mac Terminal: `base64 -i /path/to/certificate.p12 | pbcopy`
   - Paste into GitHub secret

   **Secret 2: APPLE_CERTIFICATE_PASSWORD**
   - The password you set when exporting `.p12`

   **Secret 3: APPLE_PROVISIONING_PROFILE_BASE64**
   - On Mac Terminal: `base64 -i /path/to/profile.mobileprovision | pbcopy`
   - Paste into GitHub secret

### Step 5: Update exportOptions.plist
1. Find your Provisioning Profile UUID:
   - Open the `.mobileprovision` file in a text editor
   - Look for `<key>UUID</key>` - the value next to it is your UUID
   - Or check the profile name in Apple Developer portal

2. Edit `ios/App/exportOptions.plist`:
   - Replace `YOUR_TEAM_ID` with your Team ID
   - Replace `YOUR_PROVISIONING_PROFILE_UUID` with your profile UUID

3. Commit and push:
   ```bash
   git add ios/App/exportOptions.plist
   git commit -m "Update exportOptions with Team ID and Profile UUID"
   git push
   ```

### Step 6: Build Will Be Signed Automatically
- Next time you push code, the workflow will create a **signed** build
- Download the `ios-app-signed` artifact
- Upload to App Store Connect or use Transporter

---

## 📋 Quick Checklist

**For Option 1 (Transporter):**
- [ ] Create app in App Store Connect
- [ ] Download build from GitHub Actions
- [ ] Install Transporter app
- [ ] Upload via Transporter
- [ ] Fill in app details
- [ ] Submit for review

**For Option 2 (Automated):**
- [ ] Get Team ID
- [ ] Create Distribution Certificate
- [ ] Create Provisioning Profile
- [ ] Add GitHub Secrets
- [ ] Update exportOptions.plist
- [ ] Push to GitHub
- [ ] Download signed build
- [ ] Upload to App Store Connect

---

## 💡 Recommendation

**Start with Option 1** to get your first version live quickly. You can always set up Option 2 later for automated future updates.

---

## 🆘 Need Help?

- **App Store Connect issues?** Check: https://help.apple.com/app-store-connect/
- **Certificate problems?** See `IOS_DEPLOYMENT.md` for detailed steps
- **Build not working?** Check GitHub Actions logs

**You're ready to go!** 🎉

