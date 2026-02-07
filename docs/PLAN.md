# Plan: Fix OneSignal Subscription Sync

## Goal
Ensure that when a user enables notifications in the app, the OneSignal backend reflects this immediately, resolving the "Permission Not Granted" status on the dashboard.

## Context
*   **Issue**: Dashboard shows "Permission Not Granted" even when the app has OS permission ("Active" in Profile).
*   **Root Cause**: The OneSignal `pushSubscription` state might be `optedOut: true` or not synced effectively.
*   **Fix**: Explicitly call `OneSignal.User.pushSubscription.optIn()` when the user toggles notifications on.

## Proposed Changes (Mobile Developer)
### 1. [MODIFY] [profile.tsx](file:///c:/Users/hemal/Documents/Deal%20Finder/app/app/(tabs)/profile.tsx)
*   **Modify `handleNotificationToggle`**:
    *   Call `OneSignal.User.pushSubscription.optIn()` after a successful permission grant or check.
    *   Add a `console.log` or (optional) `Alert` to confirm the sync action for debugging.
    *   Change the button logic to force an update if the user taps "Active" (acting as a "Sync" action).

## Verification Plan (Test Engineer)
### Manual Verification
1.  **Build**: Create Updated APK.
2.  **Install & Launch**: Open app.
3.  **Profile**: Go to Profile.
4.  **Test**:
    *   If "Active", tap it again. (Should trigger a sync/opt-in).
    *   Check OneSignal Dashboard (User should refresh page). Status should update to "Subscribed".
