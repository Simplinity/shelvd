import { createClient } from '@/lib/supabase/server'
import { del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  // Fetch image (verify ownership via user_id)
  const { data: image } = await supabase
    .from('book_images')
    .select('id, book_id, blob_url, thumb_blob_url, image_type, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // Delete from Vercel Blob
  try {
    const urls = [image.blob_url, image.thumb_blob_url].filter(Boolean) as string[]
    if (urls.length > 0) {
      await del(urls)
    }
  } catch (err) {
    console.error('Blob delete error:', err)
    // Continue anyway — orphaned blobs are harmless, missing DB record is worse
  }

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('book_images')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete image record' }, { status: 500 })
  }

  // If this was a cover image, clear books.cover_image_url
  // (or replace with next cover image if one exists)
  if (image.image_type === 'cover') {
    const { data: nextCover } = await supabase
      .from('book_images')
      .select('blob_url')
      .eq('book_id', image.book_id)
      .eq('image_type', 'cover')
      .order('sort_order')
      .limit(1)
      .single()

    await supabase
      .from('books')
      .update({ cover_image_url: nextCover?.blob_url || null })
      .eq('id', image.book_id)
  }

  return NextResponse.json({ success: true })
}
