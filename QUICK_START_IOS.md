# Quick Start: iOS Deployment

## 🚀 Fastest Path to App Store (No Xcode/Terminal Required)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for iOS build"
git push origin main
```

### 2. Build Automatically
- Go to your GitHub repo → **Actions** tab
- Workflow runs automatically on push
- Wait ~10-15 minutes for build to complete

### 3. Download Build
- Click on completed workflow run
- Download **ios-app** artifact
- Extract the `.xcarchive` or `.ipa` file

### 4. Upload to App Store
**Option A: Transporter App (Easiest)**
1. Download **Transporter** from Mac App Store (free)
2. Open Transporter
3. Sign in with Apple Developer account
4. Drag `.ipa` or `.xcarchive` file into Transporter
5. Click **Deliver**

**Option B: App Store Connect**
1. Go to https://appstoreconnect.apple.com
2. Select your app
3. Create new version
4. Upload via web interface

### 5. Submit for Review
- Fill in app details in App Store Connect
- Add screenshots
- Submit for review

## 📋 What You Need

- ✅ Apple Developer Account ($99/year)
- ✅ GitHub account (free)
- ✅ App created in App Store Connect

## 🔧 First Time Setup

1. **Create App Store Connect App**
   - Bundle ID: `com.edgehockey.app`
   - Name: Edge Hockey

2. **Get Certificates** (for automatic signing)
   - Export Distribution Certificate from Keychain
   - Download Provisioning Profile from Apple Developer
   - Add as GitHub Secrets (see IOS_DEPLOYMENT.md)

## 📱 Version Updates

When releasing a new version:
1. Update version in `package.json`
2. Update version in `ios/App/App/Info.plist`
3. Push to GitHub
4. Build runs automatically
5. Download and upload new build

## 🆘 Need Help?

See `IOS_DEPLOYMENT.md` for detailed instructions.

