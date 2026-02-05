# Claude Session Log

## COMPLETED FEATURES

### Admin Dashboard ✅
- `/admin` — stats bar + user management table on single page
- Book counts via `get_book_counts_for_admin()` RPC (bypasses RLS)
- Admin nav link (red, only visible to admin users)
- User delete via `admin_delete_user()` SECURITY DEFINER (no service_role key needed)

### User Settings ✅
- `/settings` — two tabs: Account + Configuration
- **Account tab:** Profile, Security (password), Address, Subscription (read-only), Danger Zone (delete account)
- **Configuration tab:** Currency, Date Format, Items Per Page (list/grid split)

### Database functions
- `is_admin()` — SECURITY DEFINER, used by RLS policies
- `get_users_for_admin()` — returns auth.users data
- `get_book_counts_for_admin()` — book counts per user (bypasses RLS)
- `get_total_books_for_admin()` — total books count (bypasses RLS)
- `admin_delete_user(target_user_id)` — cascade delete user + auth.users

### Latest Git Commits
- `713a4b4` — admin nav link, delete route via RPC, project.md update
- `7c8e3f4` — items_per_page split into list/grid
- `fbff10c` — configuration tab (currency, date format, items per page)

---

## EXTERNAL LINKS FEATURE — ✅ COMPLETE

### Database (migrations 006-008)
- `external_link_types` — 55 system types + user custom types
- `user_active_link_types` — which types each user has activated
- `book_external_links` — actual links per book
- `update_updated_at_column()` trigger on books table

### Settings > External Links Tab
- Collapsible categories with activate/deactivate toggles per type
- "Activate all" / "Deactivate all" per category
- All types active by default for new users (lazy initialization)
- Add custom link types (auto-activated)
- Delete custom types
- Google Favicon API for icons

### Book Add/Edit Pages
- External Links section with unlimited links
- Dropdown shows only user's active link types
- Auto-fill URL with `https://{domain}/` when selecting type
- URL updates when changing type (if no path added yet)
- Open-in-new-tab button to search external site

### Book Detail Page
- Display links with favicons
- Links open in new tab
- Dates formatted per user preference

### 55 Built-in Link Types (8 categories)
Bibliographic & Authority (7), Short Title Catalogs (9), National & Regional (12), Digital Libraries (8), Provenance & Specialized (4), Antiquarian Markets (6), Auction Houses & Pricing (5), Community (2), Free-form (2)

### Key Commits
- `65e9772` — external links as third settings tab, migration 006
- `10eb6c7` — activate/deactivate toggles, migration 007
- `3db11d5` — all active by default for new users
- `9daaad5` — books updated_at trigger, migration 008
- `2f6bafa` — date formatting per user preference
- `fc2cc98` — auto-fill URL with domain
- `4eed856` — open-in-new-tab button

---

## DUPLICATE DETECTION — ✅ COMPLETE

### Database (migration 009)
- `find_isbn13_duplicates()` — groups books by ISBN-13
- `find_isbn10_duplicates()` — groups books by ISBN-10
- `find_title_duplicates()` — groups books by exact title (normalized)
- `find_fuzzy_title_duplicates()` — placeholder for pg_trgm

### UI: `/books/duplicates`
- Instant server-side scan (SQL functions)
- Grouped results: ISBN-13 > ISBN-10 > Exact Title
- Collapse/expand groups
- Select all/deselect all per group
- Checkbox per book
- Bulk delete selected
- View book in new tab
- Access via "Duplicates" button in books toolbar

### Key Commits
- `da069f4` — initial duplicate detection page
- `ef01ca1` — server-side SQL functions for instant scan
