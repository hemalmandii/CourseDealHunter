# Automation & Quality Control Plan

## 🎯 Goal
Automatically send push notifications when *high-quality* new deals are scraped, without spamming users.

## ⚙️ Logic Flow
1.  **Run Scraper** (`scrape-coursesity`).
2.  **Upsert Deals** into Supabase.
3.  **Identify "Notify-Worthy" Deals:**
    *   **Newness:** Must be a *newly inserted* deal (or significantly updated).
    *   **Quality:** Rating > 4.4 OR Discount == "100% OFF" OR "Free".
    *   **Limit:** Max 1 deal per batch run (the "Best" one).
4.  **Send Push:**
    *   Invoke `send-push` Edge Function.

## 🛠️ Implementation Steps

### 1. Refactor `scrape-coursesity`
- [ ] **Track Inserts:** Modify the `upsert` logic to return the inserted rows so we know which IDs are *truly new*.
- [ ] **Scoring Logic:** Sort the new deals by dynamic score:
    *   `Rating` (if available) gets high weight.
    *   `Review Count` (high popularity) gets medium weight.
- [ ] **Trigger:** Pick the top scorer and call `send-push`.

### 2. Update `send-push`
- [ ] No major changes needed, just ensure it handles the payload.

### 3. Verification
- [ ] Deploy functions.
- [ ] Trigger scraper manually via Dashboard/Curl.
- [ ] Verify ONE notification arrives for the best deal.
