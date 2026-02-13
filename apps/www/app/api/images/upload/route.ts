import { createClient } from '@/lib/supabase/server'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const FULL_MAX_PX = 2400
const THUMB_MAX_PX = 400
const FULL_QUALITY = 85
const THUMB_QUALITY = 80
const MAX_IMAGES_PER_BOOK = 20

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'image/tiff', 'image/bmp', 'image/gif', 'image/avif',
]
const VALID_IMAGE_TYPES = ['cover', 'spine', 'back', 'detail', 'page']

// Tier storage limits in bytes
const TIER_LIMITS: Record<string, number> = {
  collector_pro: 1 * 1024 * 1024 * 1024,  // 1 GB
  dealer: 25 * 1024 * 1024 * 1024,         // 25 GB
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  // ── Check tier ──
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const tier = (profile as any)?.tier || 'collector'
  const storageLimit = TIER_LIMITS[tier]
  if (!storageLimit) {
    return NextResponse.json({ error: 'Image uploads require a Pro or Dealer account' }, { status: 403 })
  }

  // ── Parse form data ──
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bookId = formData.get('book_id') as string | null
  const imageType = (formData.get('image_type') as string) || 'cover'

  if (!file || !bookId) {
    return NextResponse.json({ error: 'Missing file or book_id' }, { status: 400 })
  }
  if (!VALID_IMAGE_TYPES.includes(imageType)) {
    return NextResponse.json({ error: `Invalid image_type. Must be one of: ${VALID_IMAGE_TYPES.join(', ')}` }, { status: 400 })
  }

  // ── Validate file ──
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `File too large. Maximum is ${MAX_FILE_SIZE / 1024 / 1024} MB` }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
    return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 })
  }

  // ── Verify book ownership ──
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', user.id)
    .single()

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  // ── Check image count per book ──
  const { count: imageCount } = await supabase
    .from('book_images')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', bookId)

  if ((imageCount || 0) >= MAX_IMAGES_PER_BOOK) {
    return NextResponse.json({ error: `Maximum ${MAX_IMAGES_PER_BOOK} images per book` }, { status: 400 })
  }

  // ── Check quota ──
  const { data: quotaData } = await supabase
    .from('book_images')
    .select('file_size_bytes')
    .eq('user_id', user.id)

  const usedBytes = (quotaData || []).reduce((sum, row) => sum + (row.file_size_bytes || 0), 0)
  if (usedBytes + file.size > storageLimit) {
    const usedMB = Math.round(usedBytes / 1024 / 1024)
    const limitMB = Math.round(storageLimit / 1024 / 1024)
    return NextResponse.json({ error: `Storage quota exceeded (${usedMB} MB / ${limitMB} MB)` }, { status: 400 })
  }

  // ── Process with sharp ──
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Generate full version (max 2400px longest side)
    const fullBuffer = await sharp(buffer)
      .rotate() // auto-rotate based on EXIF
      .resize(FULL_MAX_PX, FULL_MAX_PX, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: FULL_QUALITY })
      .toBuffer()

    // Generate thumbnail (max 400px longest side)
    const thumbBuffer = await sharp(buffer)
      .rotate()
      .resize(THUMB_MAX_PX, THUMB_MAX_PX, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer()

    // ── Get sort order ──
    const { data: maxSortRow } = await supabase
      .from('book_images')
      .select('sort_order')
      .eq('book_id', bookId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()
    const nextSort = ((maxSortRow as any)?.sort_order ?? -1) + 1

    // ── Generate ID for paths ──
    const imageId = crypto.randomUUID()

    // ── Upload to Vercel Blob ──
    const fullBlob = await put(
      `${user.id}/${bookId}/${imageId}-full.webp`,
      fullBuffer,
      { access: 'public', contentType: 'image/webp' }
    )
    const thumbBlob = await put(
      `${user.id}/${bookId}/${imageId}-thumb.webp`,
      thumbBuffer,
      { access: 'public', contentType: 'image/webp' }
    )

    // ── Insert into DB ──
    const totalBytes = fullBuffer.length + thumbBuffer.length
    const { data: inserted, error: insertError } = await supabase
      .from('book_images')
      .insert({
        id: imageId,
        book_id: bookId,
        user_id: user.id,
        blob_url: fullBlob.url,
        thumb_blob_url: thumbBlob.url,
        image_type: imageType,
        original_filename: file.name,
        mime_type: 'image/webp',
        width: metadata.width || null,
        height: metadata.height || null,
        file_size_bytes: totalBytes,
        sort_order: nextSort,
        is_primary: imageType === 'cover' && nextSort === 0,
      })
      .select('id, blob_url, thumb_blob_url, image_type, sort_order')
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 })
    }

    // ── Auto-sync cover_image_url if this is a cover ──
    if (imageType === 'cover') {
      await supabase
        .from('books')
        .update({ cover_image_url: fullBlob.url })
        .eq('id', bookId)
    }

    return NextResponse.json(inserted)
  } catch (err: any) {
    console.error('Image processing error:', err)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
