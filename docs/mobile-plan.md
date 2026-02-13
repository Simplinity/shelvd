# Mobile Responsiveness — Detailed Plan

## Analysis

**Already responsive (no work needed):**
- Grid view books: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` ✅
- Stats metric cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` ✅
- Stats chart sections: `grid-cols-1 lg:grid-cols-2` ✅
- Add/Edit form fields: `grid-cols-2 md:grid-cols-4` (2-col on mobile = acceptable) ✅
- Book detail fields: `grid-cols-2 md:grid-cols-4` ✅
- Search form: `grid-cols-1 md:grid-cols-2` ✅
- Settings form fields: `grid-cols-1 md:grid-cols-2` ✅
- Audit cards: `grid-cols-1 md:grid-cols-2` ✅
- Lookup form: `grid-cols-1 sm:grid-cols-2` ✅
- Activity table: already has `overflow-x-auto` ✅
- Onboarding wizard: no grid issues ✅
- Support page: `grid-cols-2` for form type picker only ✅

**Broken on mobile:**
1. `<nav>` is `hidden md:flex` — NO navigation at all below 768px (CRITICAL)
2. Books list view uses `grid-cols-12` — horizontal overflow, unreadable
3. Books page header: title + buttons on one line, wraps ugly
4. Books page search bar: 3 buttons won't fit
5. Books page selection action bar: 4 buttons in a row
6. Settings page: 6 tab links overflow horizontally
7. Admin sidebar: fixed `w-[200px]`, no mobile layout
8. Book detail header: cover + title side-by-side, cramped on small screens

## Steps

### Phase A: Mobile Navigation (CRITICAL — unlocks mobile use)

**9.1** — Create `components/mobile-nav.tsx` shell
- Client component with hamburger button (Menu icon)
- State: `open` boolean
- Render: button only (no drawer yet)
- File: `components/mobile-nav.tsx` (new, ~25 lines)

**9.2** — Add slide-out drawer to MobileNav
- Full-screen overlay + slide-in panel from left
- Close button (X icon) in panel header
- File: `components/mobile-nav.tsx` (edit, ~30 lines added)

**9.3** — Add nav links to MobileNav drawer
- Same links as desktop: Books, Add, Import, Search, Lookup, Stats, Audit, Activity
- Each with icon + label, larger touch targets (py-3)
- File: `components/mobile-nav.tsx` (edit, ~40 lines added)

**9.4** — Add user section to MobileNav drawer
- Settings, Support, Wiki links
- Admin link (conditional on isAdmin prop)
- Sign Out button at bottom
- File: `components/mobile-nav.tsx` (edit, ~30 lines added)

**9.5** — Add CollectionNav to MobileNav drawer
- Pass collections prop, show collection list with counts
- File: `components/mobile-nav.tsx` (edit, ~15 lines added)

**9.6** — Wire MobileNav into layout.tsx
- Import MobileNav, render with `md:hidden` (visible only on mobile)
- Pass collections, isAdmin, email props
- Desktop nav unchanged
- File: `layout.tsx` (edit, ~5 lines added)

**9.7** — Close drawer on navigation
- Listen to pathname changes via `usePathname()`
- Auto-close drawer when route changes
- File: `components/mobile-nav.tsx` (edit, ~8 lines added)

### Phase B: Books Page (most complex page)

**9.8** — Books page header: stack on mobile
- Change title + buttons row from `flex items-center` to `flex flex-col sm:flex-row`
- Buttons wrap below title on mobile
- File: `books/page.tsx` (~5 lines changed)

**9.9** — Books page search bar: compact on mobile
- Hide "Advanced" text, keep icon only on mobile
- Search button: icon only on mobile
- File: `books/page.tsx` (~10 lines changed)

**9.10** — Books page selection bar: wrap buttons
- Change `flex items-center justify-between` to `flex flex-col sm:flex-row gap-3`
- Buttons wrap to second row on mobile
- File: `books/page.tsx` (~8 lines changed)

**9.11** — Books page value summary: wrap on mobile
- Change `flex items-center gap-6` to `flex flex-wrap gap-x-6 gap-y-1`
- File: `books/page.tsx` (~2 lines changed)

**9.12** — Books list view: mobile card layout
- Below `sm:` breakpoint: hide grid-cols-12 header
- Show each book as a compact card: cover + title + author + year
- Hide columns that don't fit (publisher, condition, price, status)
- File: `books/page.tsx` (~40 lines changed)

**9.13** — Books list view header: hide on mobile
- Column headers only make sense in table layout
- Add `hidden sm:grid` to header row
- File: `books/page.tsx` (~3 lines changed)

### Phase C: Settings & Admin Sidebars

**9.14** — Settings tabs: horizontal scroll on mobile
- Wrap tab container in `overflow-x-auto`
- Add `flex-nowrap whitespace-nowrap` to tab links
- File: `settings/page.tsx` (~5 lines changed)

**9.15** — Admin sidebar: horizontal bar on mobile
- Below `md:`: sidebar becomes horizontal top bar with icons only
- Above `md:`: existing vertical sidebar unchanged
- File: `admin/admin-sidebar.tsx` (~20 lines changed)

**9.16** — Admin layout: stack on mobile
- Change `flex` (side-by-side) to `flex flex-col md:flex-row`
- Sidebar above content on mobile
- File: `admin/layout.tsx` (~5 lines changed)

### Phase D: Book Detail Page

**9.17** — Book detail header: stack on mobile
- Cover image + title block: `flex flex-col sm:flex-row` instead of `flex`
- Cover centered above title on mobile
- File: `books/[id]/page.tsx` (~8 lines changed)

**9.18** — Book detail action buttons: wrap on mobile
- Edit/Delete/Enrich buttons: `flex flex-wrap gap-2`
- File: `books/[id]/page.tsx` (~3 lines changed)

### Phase E: Remaining Pages

**9.19** — Support page form type picker: stack on mobile
- `grid-cols-1 sm:grid-cols-2` instead of `grid-cols-2`
- File: `support/support-client.tsx` (~2 lines changed)

**9.20** — Import page preview table: horizontal scroll
- Ensure `overflow-x-auto` wrapper exists
- File: `books/import/book-import-form.tsx` (~3 lines changed)

**9.21** — Admin tables: horizontal scroll wrappers
- Users list, activity log, support queue, invite codes
- Add `overflow-x-auto` where missing
- Files: admin page files (~2-3 lines each)

### Phase F: Polish

**9.22** — Touch targets: increase tap areas
- Nav links, buttons, checkboxes: ensure min 44px height
- Global: check `py-2` → `py-3` on interactive mobile elements
- File: `components/mobile-nav.tsx` + spot fixes (~10 lines)

**9.23** — Test and fix at 375px (iPhone SE width)
- Manual review of all pages, fix any overflow or cut-off issues
- Multiple small fixes as needed
- Files: various (~5-10 lines each)

## Total: 23 steps, each independently committable
