# Audit Plan: Notification System Verification

## Goal
Comprehensive verification of the notification system to ensure end-to-end functionality, from permission grant to OneSignal dashboard sync.

## Audit Findings
### 1. Configuration Check
*   **[VALID]** `app.json`: Plugins configured correctly.
*   **[VALID]** `google-services.json`: Valid JSON structure, matches package name `com.coursedealhunter.app`.
*   **[VALID]** `package.json`: Versions are compatible.
    *   `react-native-onesignal`: `^5.2.16` (Latest stable)
    *   `onesignal-expo-plugin`: `2.0.3` (Matches SDK)

### 2. Logic Analysis
*   **[FIXED]** `profile.tsx`: Added forced `optIn()` sync on toggle.
    *   *Issue Identified:* User could have OS permission but be "Opted Out" in SDK.
    *   *Fix:* Tapping "Active" now forces a re-sync.

## Next Steps (Verification)
Since no configuration errors were found, the remaining issue is purely synchronization state on existing devices.

### Action Plan
1.  **Build Updated APK**: We must build the new APK containing the `profile.tsx` fix.
2.  **Clean Install**: Uninstall the old app to clear any stale OneSignal SDK state.
3.  **Manual Test Protocol**:
    *   Install new APK.
    *   Open App -> Allow Notifications.
    *   Go to **Profile**.
    *   If "Active", **Tap it once more** to see the "Syncing..." alert.
    *   Check OneSignal Dashboard for "Subscribed" status.

## Recommendation
Proceed directly to **Build**. No further code changes are required beyond the Sync Fix already applied.
