# iOS App Store Deployment Guide

This guide will help you deploy your Edge Hockey app to the iOS App Store **without using Xcode or Terminal**.

## Overview

We've set up **GitHub Actions** to automatically build your iOS app in the cloud. When you push code to GitHub, it will:
1. Build your web app
2. Sync Capacitor
3. Build the iOS app
4. Create an archive ready for App Store submission

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   - You'll need this for App Store distribution

2. **GitHub Account** (free)
   - Your code needs to be in a GitHub repository

## Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub (if you haven't already)
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Step 2: Set Up Apple Developer Account

1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID
3. Accept the Apple Developer Agreement
4. Note your **Team ID** (found in Membership section)

## Step 3: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Edge Hockey
   - **Primary Language**: English
   - **Bundle ID**: `com.edgehockey.app` (must match your capacitor.config.ts)
   - **SKU**: Any unique identifier (e.g., `edge-hockey-001`)
4. Click **Create**

## Step 4: Configure Code Signing (Two Options)

### Option A: Automatic Signing (Recommended for First Time)

The GitHub Actions workflow will create an unsigned build. You can sign it later using one of these methods:

**Method 1: Use Transporter App (Easiest - No Terminal)**
1. Download **Transporter** from the Mac App Store (free)
2. When GitHub Actions completes, download the `.xcarchive` artifact
3. Open Transporter
4. Drag the `.xcarchive` file into Transporter
5. Sign in with your Apple ID
6. Transporter will handle signing and upload to App Store Connect

**Method 2: Use App Store Connect API (Advanced)**
- Requires setting up API keys in App Store Connect
- More automated but requires initial setup

### Option B: Manual Signing (For Automated Builds)

If you want GitHub Actions to automatically sign your builds, you'll need to provide certificates:

1. **Export your Distribution Certificate**:
   - Open Keychain Access on a Mac
   - Find your "Apple Distribution" certificate
   - Right-click → Export → Save as `.p12` file
   - Set a password (remember this!)

2. **Download your Provisioning Profile**:
   - Go to https://developer.apple.com/account/resources/profiles/list
   - Create a new App Store distribution profile for `com.edgehockey.app`
   - Download the `.mobileprovision` file

3. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `APPLE_CERTIFICATE_BASE64`: Base64 encoded `.p12` file
       ```bash
       base64 -i certificate.p12 | pbcopy
       ```
     - `APPLE_CERTIFICATE_PASSWORD`: The password you set when exporting
     - `APPLE_PROVISIONING_PROFILE_BASE64`: Base64 encoded `.mobileprovision` file
       ```bash
       base64 -i profile.mobileprovision | pbcopy
       ```

4. **Update exportOptions.plist**:
   - Edit `ios/App/exportOptions.plist`
   - Replace `YOUR_TEAM_ID` with your actual Team ID
   - Replace `YOUR_PROVISIONING_PROFILE_UUID` with your profile UUID

## Step 5: Build Your App

### Automatic Build (Recommended)

1. Push code to your `main` branch:
   ```bash
   git push origin main
   ```

2. Go to your GitHub repository
3. Click **Actions** tab
4. Watch the workflow run
5. When complete, download the artifact:
   - Click on the completed workflow run
   - Scroll to **Artifacts**
   - Download `ios-app` or `ios-app-signed`

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Build iOS App** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Step 6: Upload to App Store Connect

### Using Transporter App (No Terminal Required)

1. Download **Transporter** from Mac App Store
2. Open Transporter
3. Sign in with your Apple Developer account
4. Drag the `.ipa` file (from GitHub Actions artifacts) into Transporter
5. Click **Deliver**
6. Wait for upload to complete

### Alternative: Using App Store Connect Website

1. Go to App Store Connect
2. Select your app
3. Go to the version you want to upload
4. Use the **Transporter** web interface (if available)

## Step 7: Submit for Review

1. Go to App Store Connect → Your App
2. Fill in app information:
   - Screenshots (required)
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
3. Set pricing and availability
4. Add app review information
5. Click **Submit for Review**

## Troubleshooting

### Build Fails in GitHub Actions

- Check the Actions logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify `capacitor.config.ts` has correct `appId`

### Code Signing Issues

- Make sure your Bundle ID matches in:
  - `capacitor.config.ts`
  - App Store Connect
  - Provisioning Profile
- Verify certificates haven't expired
- Check Team ID is correct

### Upload Fails

- Ensure `.ipa` file is properly signed
- Check that Bundle ID matches App Store Connect
- Verify app version number is incremented

## Updating Your App

1. Update version in `package.json` and `ios/App/App/Info.plist`
2. Make your code changes
3. Commit and push to GitHub
4. GitHub Actions will build automatically
5. Download and upload new build to App Store Connect

## Version Management

Update these files when releasing a new version:
- `package.json` - `version` field
- `ios/App/App/Info.plist` - `CFBundleShortVersionString` and `CFBundleVersion`

## Need Help?

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)

