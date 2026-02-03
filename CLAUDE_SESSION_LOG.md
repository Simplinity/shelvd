# Claude Session Log

## COMPLETED FEATURES

### Admin Dashboard ✅ (2025-02-03)
- `/admin` — single page with stats bar + user management table
- Stats: Total Users, Active, Total Books, Signups (7d)
- User table with search, filter by status, book counts
- User actions: Suspend, Ban, Reactivate, Delete
- RLS fixed with `is_admin()` SECURITY DEFINER function
- Book counts via `get_book_counts_for_admin()` RPC (bypasses RLS)
- Total books via `get_total_books_for_admin()` RPC
- Admin guard: non-admins redirected to /books
- Files: admin/layout.tsx, admin/page.tsx, admin/users/user-actions.tsx, api/admin/users/delete/route.ts

### Database: user_profiles ✅
- Columns: id, display_name, avatar_url, default_currency, default_size_unit, membership_tier, is_lifetime_free, status, status_reason, is_admin, admin_role, signup_source, notes, created_at, updated_at
- RLS policies: users read/update own, admins read/update all (via is_admin())
- Trigger: auto-creates profile on signup
- Membership tiers: free, lifetime free, bronze, silver, gold, platinum

### Admin accounts
| Email | is_admin | role |
|-------|----------|------|
| bruno@simplinity.co | true | super_admin |
| bruno@vanbranden.be | false | user |

---

## KNOWN ISSUES (admin)

1. **Delete route** uses `auth.admin.deleteUser()` — may need service_role key
2. **No nav link** to /admin — only accessible via direct URL
3. **User detail page** `/admin/users/[id]` — not yet built

---

## CURRENT TASK: User Settings Page

### Overview
Standard SaaS user settings page at `/settings`. Accessible to all logged-in users.

### TODO List

#### 1. Profile Settings
- [ ] Display name (edit)
- [ ] Avatar upload (Supabase Storage)
- [ ] Email (read-only, shown for reference)

#### 2. Security
- [ ] Change password (via Supabase auth)
- [ ] Current email display
- [ ] Last sign-in info

#### 3. Preferences
- [ ] Default currency (dropdown: EUR, USD, GBP, CHF, etc.)
- [ ] Default size unit (cm / inches)

#### 4. Address / Billing Info
- [ ] Full name
- [ ] Street + number
- [ ] City
- [ ] Postal code
- [ ] Country
- [ ] VAT number (optional, for EU businesses)
- [ ] NOTE: store in new `user_billing` table or extend user_profiles?

#### 5. Subscription
- [ ] Current tier (read-only badge)
- [ ] Lifetime free badge if applicable
- [ ] Upgrade CTA (placeholder for now — no payment integration yet)

#### 6. Data & Privacy
- [ ] Export my data (trigger full export)
- [ ] Delete my account (with confirmation, deletes all books + profile)

#### 7. Technical
- [ ] Database: decide on billing info storage (new table vs extend user_profiles)
- [ ] Create /settings route + layout
- [ ] Add Settings link to app navigation
- [ ] Password reset via Supabase `updateUser()`
- [ ] Avatar upload via Supabase Storage bucket

---

### Implementation Plan (order)
1. Create `/settings` page with tabbed or sectioned layout
2. Profile section (name, email display)
3. Security section (password change)
4. Preferences section (currency, size unit)
5. Address/billing section (new fields)
6. Subscription section (read-only tier display)
7. Data section (export, delete account)
8. Add Settings link to navigation

---

## NEXT STEPS
- [x] Bruno: bevestig TODO lijst ✅
- [x] DB: added billing columns to user_profiles (full_name, street_address, city, postal_code, country, vat_number)
- [x] Updated database.types.ts with 6 new columns
- [x] Created lib/actions/settings.ts (updateProfile, updatePassword, updatePreferences, updateAddress, deleteAccount)
- [x] Created /settings/page.tsx (server component, loads profile)
- [x] Created /settings/settings-form.tsx (client component, all 6 sections)
  - [x] Profile: display name, full name, email (read-only)
  - [x] Security: change password (min 8 chars, confirm)
  - [x] Preferences: currency dropdown, size unit
  - [x] Address: street, postal code, city, country, VAT
  - [x] Subscription: tier badge, lifetime badge (read-only)
  - [x] Danger Zone: delete account (double confirmation)
- [x] Added Settings link to app navigation (layout.tsx)
- [x] TypeScript check: 0 errors ✅
- [ ] Commit + push
- [ ] Test on Vercel
