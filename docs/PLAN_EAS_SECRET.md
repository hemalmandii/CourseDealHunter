# EAS Build Secret Fix Plan

## Goal
Fix the `google-services.json is missing` error in EAS Build by securely injecting the file using EAS Secrets, without checking it into git.

## Diagnosis
EAS Build only uploads files tracked by git. `google-services.json` is correctly ignored to prevent credential leaks. To use it in the cloud build, we must provide it as a secret environment variable and reconstruct it during the build process.

## Proposed Changes

### 1. Create EAS Secret
- **Action:** Read `app/google-services.json`, encode it to Base64, and upload it as an EAS Secret named `GOOGLE_SERVICES_BASE64`.
- **Reason:** Securely stores the file content in the project scope on Expo's servers.

### 2. Update `app/package.json`
- **Action:** Add a `eas-build-pre-install` script.
- **Script:** `"eas-build-pre-install": "echo $GOOGLE_SERVICES_BASE64 | base64 -d > google-services.json"`
- **Reason:** This hook runs before dependencies are installed in the cloud. It decodes the secret and restores the `google-services.json` file so the build can use it.

## Verification Plan
1. **Verify Secret Creation:**
   - Run `eas secret:list` to confirm `GOOGLE_SERVICES_BASE64` exists.
2. **Verify Hook Configuration:**
   - Check `app/package.json` for the new script.
3. **Trigger Build:**
   - Run `eas build --platform android --profile production` again.
   - Confirm it passes the "Prebuild" and "Install dependencies" steps without the missing file error.
