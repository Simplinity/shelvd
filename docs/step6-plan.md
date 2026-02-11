# Step 6: User-facing Activity — Subtasks

## 6a: /activity page (personal)
### 6a-1: Server actions — getMyActivity() + getBookActivity()
- Already written in activity-log.ts
- getMyActivity: RLS-scoped, paginated, category filter + search
- getBookActivity: RLS-scoped, per entity_id

### 6a-2: Page + client component  
- File: `apps/www/app/(app)/activity/page.tsx` (server)
- File: `apps/www/app/(app)/activity/activity-client.tsx` (client)
- Same style as admin viewer but no user column
- Category filter tabs, entity search, pagination

### 6a-3: Navigation link
- Add "Activity" to header nav, next to Stats (with Clock/Activity icon)

## 6b: Recent activity on /stats
### 6b-1: Add compact feed to stats page
- Reuse ActivityFeed component from admin
- Last 10 entries, "View all →" link to /activity
- Add below existing stats content

## 6c: Book detail — last modified + timeline
### 6c-1: BookTimeline component
- File: `apps/www/components/book-timeline.tsx`
- "Last modified X ago" header
- Expandable list of changes: added, edited (field names), enriched (source), imported
- Collapsed by default, "Show history" toggle

### 6c-2: Wire into book detail page
- File: `apps/www/app/(app)/books/[id]/page.tsx`
- Add below existing book content
- Fetch via getBookActivity(bookId)

## Status
- [ ] 6a-2: /activity page + client
- [ ] 6a-3: Nav link  
- [ ] 6b-1: Stats feed
- [ ] 6c-1: BookTimeline component
- [ ] 6c-2: Wire into detail
- [ ] Docs + commit
