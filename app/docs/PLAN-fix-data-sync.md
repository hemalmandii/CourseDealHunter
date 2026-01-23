# PLAN-fix-data-sync.md

> **Goal**: Fix data synchronization issues, specifically "Love/Save" state persistence and Voting limitations, ensuring the UI accurately reflects the Database state.

## 👥 Agent Assignments
| Agent | Role | Responsibilities |
|-------|------|------------------|
| `debugger` | Diagnosis | Trace API calls for Toggle Save and Vote. Check Supabase RLS logs. |
| `mobile-developer` | Implementation | Fix Optimistic Updates in `CourseCard` and `SavedScreen`. Implement `useFocusEffect` or Context for refreshing lists. |
| `backend-specialist` | Verification | Validate `toggle_save_deal` and `vote` RPC logic and database constraints. |

## 📋 Task Breakdown

### Phase 1: Diagnosis (Debugger)
- [ ] **Analyze Save Logic**: Check `src/services/api.ts` -> `toggleSaveDeal`. verify if it returns the new state.
- [ ] **Analyze Vote Logic**: Check `vote` RPC endpoint. Confirm if "vote once" is a DB constraint violation (expected?) or a bug.
- [ ] **Check State Management**: Review how `SavedScreen` fetches data. Does it reload on focus?

### Phase 2: Implementation (Mobile Developer)
- [ ] **Fix Saved Screen**: Implement `useFocusEffect` (Expo Router) to refetch saved deals when the screen becomes active.
- [ ] **Fix Heart Interaction**: Ensure `CourseCard` updates its parent list if necessary (or simply relying on Refetch).
- [ ] **Fix Vote Feedback**: Improve UI to show "Already Voted" or handle the error gracefully if the limitation is intended.

### Phase 3: Verification (Backend Specialist)
- [ ] **API Validation**: Verify `deals` and `deal_votes` tables are updating in Supabase.
- [ ] **End-to-End Test**: Save -> Check DB -> Unsave -> Check DB.

## 🛑 Verification Criteria
- Un-hearting a deal in "Saved" screen removes it from the list (immediately or on refresh).
- Voting works, and subsequent votes provide clear feedback (or are prevented UI-side).
- Database state matches UI state 1:1.
