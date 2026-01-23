# PLAN-fix-blank-screen.md

> **Goal**: Diagnose and fix the "white/blank screen" issue preventing the app from loading.

## 👥 Agent Assignments
| Agent | Role | Responsibilities |
|-------|------|------------------|
| `debugger` | Diagnosis | Log analysis, hypothesis generation, systematic testing. |
| `mobile-developer` | Implementation | React Native code fixes, routing configuration, UI rendering. |
| `test-engineer` | Verification | Server validation, bundle verification. |

## 📋 Task Breakdown

### Phase 1: Diagnosis (Debugger)
- [ ] **Analyze Application Entry**: Check `app/_layout.tsx` for mounting errors or async deadlocks.
- [ ] **Verify Walkthrough Logic**: Inspect `app/walkthrough.tsx` for layout issues (e.g., `flex: 1` missing, zero height/width).
- [ ] **Check Router Config**: Ensure `expo-router` is correctly redirecting based on `AsyncStorage`.
- [ ] **Review Dependencies**: Confirm `react-native-reanimated` is truly fully excised from all caches.

### Phase 2: Solutioning (Mobile Developer)
- [ ] **Safe Mode Fallback**: Implement a minimalist "Hello World" in `_layout.tsx` to prove the bundle works.
- [ ] **Routing Fixes**: Ensure `Slot` or `Stack` is correctly configured for the initial route.
- [ ] **Layout Fixes**: Correct any style regressions from the "Animated" refactor.

### Phase 3: Verification (Test Engineer)
- [ ] **Clean Boot Test**: Verify app launches from cold start.
- [ ] **Navigation Test**: Verify transition from Walkthrough to Tabs.
- [ ] **Server Check**: Ensure Metro server is clean (no stale cache).

## 🛑 Verification Criteria
- App shows meaningful content (not white screen) within 5 seconds of launch.
- "Get Started" flow works using standard `Animated` API.
- No console errors regarding "Worklets" or "Reanimated".
