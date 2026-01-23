# PLAN-fix-missing-images.md

> **Goal**: Diagnose and fix why some deal images are not loading.

## 👥 Agent Assignments
| Agent | Role | Responsibilities |
|-------|------|------------------|
| `debugger` | Diagnosis | Query DB for empty `thumbnail_url`s, check Edge Function logs. |
| `backend-specialist` | Scraper Fix | Review/update Firecrawl integration to extract images reliably. |
| `mobile-developer` | Frontend Fallback | Implement robust placeholder/fallback for missing images + loading states. |

## 📋 Task Breakdown

### Phase 1: Diagnosis (Debugger)
- [ ] **Query Database**: Count deals with NULL or empty `thumbnail_url`.
- [ ] **Sample Bad Data**: Get 5 example deals without images to trace their source.
- [ ] **Check Logs**: Review Edge Function logs for scraper errors.

### Phase 2: Backend Fix (Backend Specialist)
- [ ] **Review Scraper**: Check `resolve_coursesity_details` Edge Function.
- [ ] **Improve Selector**: Update CSS selector or logic to capture thumbnails correctly.
- [ ] **Re-scrape (Optional)**: Trigger a re-scrape of deals missing images.

### Phase 3: Frontend Resilience (Mobile Developer)
- [ ] **Placeholder Image**: Ensure `CourseCard` shows a styled placeholder if `thumbnail_url` is missing.
- [ ] **Fade-In Loading**: Add a fade-in effect when images load to hide network lag.

## 🛑 Verification Criteria
- All visible deals have either a valid image or a styled placeholder.
- Newly scraped deals have correct `thumbnail_url` populated.
