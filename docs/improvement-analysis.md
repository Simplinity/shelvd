# Shelvd — App Improvement Analysis (2026-02-14)

> 25 low-hanging fruit improvements. Each rated on effort and risk.

---

## SEO & Web Standards

### 1. Favicon ✅ DONE
### 2. No robots.txt — Google doesn't know what to crawl. Add app/robots.ts.
### 3. No sitemap.xml — blog/wiki/marketing not discoverable. Add app/sitemap.ts.
### 4. No OpenGraph / Twitter Card — links shared on social media have no preview.

## Error Handling & Resilience

### 5. No global error page — unhandled errors show ugly Next.js default.
### 6. No global 404 — /random-url shows bare default page.
### 7. No global loading state — route transitions appear frozen.
### 8. 12+ alert() calls — blocking popups instead of toast notifications.

## UX Polish

### 9. No save confirmation after edit — silent redirect, no "Saved!" feedback.
### 10. Prev/Next on detail always follows title order, not active sort.
### 11. No unsaved changes indicator in browser tab title.
### 12. No keyboard shortcuts (Cmd+K search, Cmd+S save, Cmd+N add).
### 13. Search results don't highlight where the match was found.

## Data Quality & Convenience

### 14. No duplicate warning when adding a new book.
### 15. No "recently added/edited" quick filter on books list.
### 16. Empty fields show "—" but don't nudge user to fill them.

## Technical Debt

### 17. books/page.tsx is 2300+ lines — split into focused components.
### 18. (book: any) everywhere — stricter TypeScript types for Supabase queries.

## Accessibility & Standards

### 19. No skip-to-content link for screen readers.
### 20. Empty alt text on cover images — should be book title.

## Marketing & Growth

### 21. No JSON-LD structured data on marketing pages (only blog has it).
### 22. No email capture / newsletter signup for visitors not ready to register.
### 23. No "share with a friend" mechanism (invite code infra exists but no UI).

## Minor Polish

### 24. Static browser tab titles — should show book count, book title, page name.
### 25. No scroll-to-top button on long book lists.
