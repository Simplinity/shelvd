# Image Upload — Complete Plan (Fase 2 + 3)

> Decided 2026-02-13. Builds on Fase 1 (URL-only cover images, ✅ complete).

## Core Decisions

### Format: WebP

WebP is the right format. ~30% smaller than JPEG at equivalent visual quality, universal browser support (97%+), supports transparency. `sharp` converts from any input format (JPEG, PNG, HEIC, TIFF, BMP, GIF, AVIF) to WebP server-side.

AVIF would be ~50% smaller, but encoding is 10x slower and browser support is still patchy on older devices. Not worth it yet. Can switch later — the pipeline is the same.

### Two Generated Versions

| Version | Max longest side | WebP quality | Typical size | Purpose |
|---------|-----------------|-------------|-------------|---------|
| **Full** | 2400px | 85 | 150-400 KB | Detail page, print catalogs, dealer listings |
| **Thumb** | 400px | 80 | 8-25 KB | List/grid views, search results |

**Why 2400px full (not original)?**
- 2400px at 300dpi = 20cm — covers A5 catalogs, most A4 with margins
- AbeBooks, Catawiki, and most platforms recommend/accept 1600-2400px
- A DSLR original (5000px+) would be 5-15MB. For 500 Pro users x 200 photos = potentially 1.5TB of originals
- The 2400px WebP is visually indistinguishable from the original for all practical uses
- If a dealer needs their 50MP original, they have it on their computer

**Why 400px thumb (not 200px)?**
- Modern screens are 2x or 3x density. A 200px CSS thumbnail needs a 400px+ image to look sharp
- 400px at quality 80 is only 8-25KB — negligible cost
- Retina-sharp thumbnails feel professional

### Upload Limits

| Parameter | Limit |
|-----------|-------|
| Max file size | 10 MB per image |
| Max images per book | 20 |
| Accepted formats | JPEG, PNG, WebP, HEIC/HEIF, TIFF, BMP, GIF |
| Min dimensions | 200px (warn if smaller, still accept) |
| Max dimensions | Any (resized to 2400px) |

HEIC support is critical — it's the default camera format on iOS since 2017. Without it, iPhone users can't upload camera photos directly.

### Image Types

Simple string enum, no separate table:

| Type | Usage |
|------|-------|
| `cover` | Front cover (hero image, shown in lists/grids) |
| `spine` | Spine view |
| `back` | Back cover |
| `detail` | Close-up: damage, inscription, binding, bookplate, ex-libris, watermark |
| `page` | Interior: title page, colophon, illustration, plate |

First `cover` image becomes the book's primary display image.

### Tier Limits & Quota

| Tier | Upload allowed | Storage limit | Notes |
|------|---------------|--------------|-------|
| Collector (free) | No | 0 | URL-only (Fase 1 stays) |
| Collector Pro | Yes | 1 GB | ~2,500-6,000 images |
| Dealer | Yes | 25 GB | ~60,000-150,000 images |

Quota = SUM(file_size_bytes) across both full + thumb versions for the user. Checked on each upload. No separate counter — one query is fast enough and can't drift.

### Storage: Vercel Blob

Already configured:
- `@vercel/blob` installed
- `BLOB_READ_WRITE_TOKEN` in .env.local + production
- Store: `shelvd-images` in FRA1

Blob path convention:
```
{user_id}/{book_id}/{image_id}-full.webp
{user_id}/{book_id}/{image_id}-thumb.webp
```

### Cover Image Backward Compatibility

`books.cover_image_url` stays. When a user uploads a `cover` type image:
1. The book's `cover_image_url` is updated to point to the uploaded full version
2. All existing code that reads `cover_image_url` keeps working — zero migration risk
3. Grid/list views can prefer `thumb_blob_url` from `book_images` when available, fall back to `cover_image_url`

---

## Database Migration (068)

**Current `book_images` table** (migration 003, unused, 0 rows):
```sql
book_images (
  id              UUID PRIMARY KEY,
  book_id         UUID NOT NULL REFERENCES books(id),
  storage_path    TEXT NOT NULL,  -- was for Supabase Storage
  original_filename VARCHAR(255),
  mime_type       VARCHAR(50),
  width           INT,
  height          INT,
  file_size_bytes INT,
  book_part_id    UUID REFERENCES book_parts(id),
  caption         TEXT,
  sort_order      INT DEFAULT 0,
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
)
```

**Migration 068 — Additive changes:**
```sql
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS blob_url TEXT;
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS thumb_blob_url TEXT;
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'cover'
  CHECK (image_type IN ('cover', 'spine', 'back', 'detail', 'page'));
ALTER TABLE book_images ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Make storage_path nullable (was NOT NULL, designed for Supabase Storage)
ALTER TABLE book_images ALTER COLUMN storage_path DROP NOT NULL;
```

---

## Implementation Steps

### Fase 2A: Infrastructure (4 steps)

| # | Step | File(s) | What |
|---|------|---------|------|
| 6.2.1 | Install sharp + migration 068 | `package.json`, `migrations/068_*.sql` | `npm install sharp`, add columns to book_images, update RLS |
| 6.2.2 | Upload API route | `app/api/images/upload/route.ts` | POST: validate -> sharp resize -> WebP convert -> Vercel Blob put -> DB insert. Returns { id, blob_url, thumb_blob_url } |
| 6.2.3 | Delete API route | `app/api/images/[id]/route.ts` | DELETE: validate ownership -> Vercel Blob del -> DB delete. Clears cover_image_url if was primary cover. |
| 6.2.4 | Quota utility | `lib/image-quota.ts` | `getUsedStorage(userId)` -> SUM(file_size_bytes). `canUpload(userId, newBytes)` -> checks tier limit. |

### Fase 2B: Single Book Upload UI (4 steps)

| # | Step | File(s) | What |
|---|------|---------|------|
| 6.2.5 | ImageUploadZone component | `components/image-upload-zone.tsx` | Drop zone, file picker, type selector (cover/spine/back/detail/page). Shows upload progress. Accepts multiple files. Client-side validation (size, type). |
| 6.2.6 | Wire into book edit form | `books/[id]/edit/book-edit-form.tsx` | Add ImageUploadZone in Physical Description section. Show existing images with delete button. FeatureGate for Pro+. |
| 6.2.7 | Wire into book add form | `books/add/book-add-form.tsx` | Same UI, but uploads happen after book is saved (need book_id first). Queue files, upload post-save. |
| 6.2.8 | Image gallery on detail page | `components/book-image-gallery.tsx` | Grid of all images for a book. Primary cover badge. Lightbox on click (fullscreen, swipe). Image type labels. |

### Fase 2C: Integration (2 steps)

| # | Step | File(s) | What |
|---|------|---------|------|
| 6.2.9 | Cover image auto-sync | Upload route + edit form | When uploading type=cover: auto-update `books.cover_image_url` to the full blob URL. If deleting the cover image: clear `cover_image_url`. |
| 6.2.10 | Prefer uploaded thumbs in views | `books/page.tsx` | In list/grid views, prefer `thumb_blob_url` from book_images over `cover_image_url`. Single query join or parallel fetch. |

### Fase 3: Polish (4 steps)

| # | Step | File(s) | What |
|---|------|---------|------|
| 6.3.1 | Drag-and-drop reorder | `components/book-image-gallery.tsx` | Drag to reorder images. Updates `sort_order` in DB. First cover-type image = primary. |
| 6.3.2 | Bulk upload to one book | `components/image-upload-zone.tsx` | Select 20 files at once, sequential upload with per-file progress bar, auto-increment sort_order. |
| 6.3.3 | Camera capture on mobile | `components/image-upload-zone.tsx` | `<input accept="image/*" capture="environment">` for rear camera. Separate button with camera icon. |
| 6.3.4 | Pinch-to-zoom lightbox | `components/book-image-gallery.tsx` | Swipe between images, pinch-to-zoom on mobile, keyboard nav on desktop. |

---

## What a Dealer Actually Does

**Scenario 1: Photograph a book at a fair**
1. Take 5 photos with phone (cover, spine, back, title page, damage spot)
2. Open Shelvd on phone -> book detail -> tap "Upload Images"
3. Select all 5 from camera roll -> tag as cover/detail/page
4. Images converted to WebP, uploaded, visible immediately
5. Total upload: ~2MB WebP instead of ~25MB HEIC

**Scenario 2: Desk photography session (20 books)**
1. DSLR or phone, one cover photo per book
2. Desktop: go to each book -> upload -> done

**Scenario 3: Detailed documentation for a valuable item**
1. 15 photos: cover, spine, back, boards, hinges, foxing, inscription, bookplate, title page, colophon, illustrations (x3), slipcase, edges
2. Upload all 15 to one book -> reorder -> set types -> done
3. These images feed into PDF inserts, future catalog generator, future sharing

---

## Cost Impact

| | Avg full size | Avg thumb | Total per image | 200 images/user |
|---|---|---|---|---|
| Storage | 250 KB | 15 KB | 265 KB | 53 MB |
| At 500 Pro users | | | | 26 GB total |
| Cost @ $0.023/GB | | | | $0.60/mo |

Even with 500 Pro users uploading 200 images each, storage cost is $0.60/month. WebP makes image hosting essentially free.

---

## Summary

**14 steps, two phases.** Fase 2 (10 steps): infrastructure, upload API, UI, integration. Fase 3 (4 steps): reorder, bulk, camera, zoom.

All steps follow project rules: one commit per step, additive migrations, build must pass. Desktop untouched. Mobile ready.
