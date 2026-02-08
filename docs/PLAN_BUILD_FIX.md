# Build Fix Plan: Play Console Upload Error

## Goal
Fix the "upload a valid app bundle" error encountered in Google Play Console by configuring the project to generate an Android App Bundle (.aab) instead of an APK.

## Diagnosis
The `app/eas.json` configuration for the `production` profile is currently set to `"buildType": "apk"`. Google Play Console requires App Bundles (`.aab`) for new releases to optimize delivery.

## Proposed Changes

### 1. `app/eas.json`
- **Change:** Update `build.production.android.buildType` from `"apk"` to `"app-bundle"`.
- **Reason:** Generates the required format for Play Console.

### 2. `app/app.json`
- **Change:** Increment `expo.android.versionCode` from `3` to `4`.
- **Reason:** Play Console requires a higher version code for every new upload.

## Verification Plan
1. **Manual Verification:**
   - Run `eas build --platform android --profile production`.
   - Verify the output is a `.aab` file.
   - User uploads the `.aab` to Play Console to confirm it is accepted.
