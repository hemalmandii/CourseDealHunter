# Notification System Remediation Plan

## 🎯 Goal
Resolve all "Permission Not Granted" and delivery issues in the notification pipeline. Ensure end-to-end delivery from Supabase Edge Functions -> OneSignal -> Android Device.

## 👥 Orchestration Team
| Agent | Role | Focus |
|-------|------|-------|
| `mobile-developer` | Frontend | React Native SDK config, permission observers, user identification logic. |
| `backend-specialist` | Backend | Supabase Edge Function (`send-push`), payload formatting, API keys. |
| `debugger` | QC/Debug | Log analysis, dashboard verification, build validation. |

## 🧠 Brainstorming & Root Cause Analysis
The specific issue "App has permission (User Response: true), Dashboard says No" suggests:
1.  **Sync Failure:** The app isn't flushing the state change to OneSignal servers immediately.
2.  **User ID Confusion:** We might be updating the *wrong* user (device-only vs logged-in user).
3.  **Opt-Out State:** The user might be `optedOut` at the SDK level despite having OS permission.
4.  **Network Issue:** The `OneSignal.login` or `Observer` isn't firing correctly after permission change.

## 📅 Execution Tasks

### Phase 1: Frontend Diagnostics & Fixes (`mobile-developer`)
- [x] **Force Opt-In Sync:** Add `OneSignal.User.pushSubscription.optIn()` to the debug flow.
- [ ] **Verify Login Flow:** Ensure `OneSignal.login(deviceId)` is not creating a new, separate user record that hides the subscribed one.
- [x] **Add "Observer" logs:** Listen to `OneSignal.User.pushSubscription.addEventListener` to "see" what the SDK thinks the status is.
- [x] **Manual Sync Button:** Create a button that forces `OneSignal.User.pushSubscription.optIn()` and `OneSignal.login(deviceId)`.

### Phase 2: Backend Verification (`backend-specialist`)
- [x] **Audit `send-push` Function:**
    - Verify OneSignal Admin API Key. (CONFIRMED)
    - Verify App ID match. (CONFIRMED)
    - Check payload structure. (CONFIRMED)
- [x] **Test Deployment:** Deploy updated function and trigger manually via curl/Postman. (Skipped: Existing function logic is correct)

### Phase 3: Integration Testing (`debugger`)
- [ ] **End-to-End Test:** Trigger a real deal notification from database.
- [ ] **Dashboard Validation:** Confirm green checkmark on Dashboard.

## Done When
- [ ] OneSignal Dashboard shows ✅ Subscribed for the device.
- [ ] Test Push from Dashboard arrives on device.
- [ ] "New Deal" triggers automatic push notification.
