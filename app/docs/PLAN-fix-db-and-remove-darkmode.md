# PLAN-fix-db-and-remove-darkmode.md

> **Goal**: Permanently resolve "database not updating" issues by verifying RPCs/RLS and removing "Dark Mode" to simplify the UI as requested.

## 👥 Agent Assignments
| Agent | Role | Responsibilities |
|-------|------|------------------|
| `frontend-specialist` | UI Simplification | Remove Dark Mode toggles, lock `ThemeContext` to Light, clean up `Colors`. |
| `backend-specialist` | Database Integrity | Debug `toggle_save_deal` RPC, Verify RLS policies, Check `deal_votes` constraints. |
| `mobile-developer` | Data Consistency | Ensure `CourseCard` optimistic state matches Server state. Add "toast" error if sync fails. |

## 📋 Task Breakdown

### Phase 1: Remove Dark Mode
- [ ] **Lock Theme**: Modify `src/context/ThemeContext.tsx` to always return `light`.
- [ ] **Clean Header**: Remove the "Moon/Sun" toggle from `src/components/CustomHeader.tsx`.
- [ ] **Simplify Colors**: (Optional) Remove dark variant checks if they clutter code, but locking Context is faster/safer.

### Phase 2: Deep Database Fix
- [ ] **Verify `toggle_save_deal`**: Execute SQL to check the function definition. Is it correctly inserting/deleting?
- [ ] **Verify RLS**: Ensure the `anon` role has permission to `INSERT/DELETE` on `deal_saves` (or whatever the table is).
- [ ] **Check `deal_votes`**: Confirm unique constraints vs logic.

### Phase 3: Robust Synchronization
- [ ] **Global Refresh Event**: Use `DeviceEventEmitter` to trigger a refresh on "Saved" screen when a deal is toggled in "Feed".
- [ ] **Error Handling**: If `toggleSaveDeal` API call fails, *immediately* revert the UI change and show an alert.

## 🛑 Verification Criteria
- App is always Light Mode.
- Tapping "Love" on Feed -> Immediately appears in Saved tab (without manual refresh).
- Tapping "Unlove" on Saved -> Immediately disappears.
- Database `deal_saves` count matches UI.
