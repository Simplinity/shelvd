import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' })

  // Get ALL activity entries for this user
  const { data: all, error: allErr } = await supabase
    .from('activity_log')
    .select('id, created_at, action, category, entity_label')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get ONLY collection entries
  const { data: collections, error: colErr } = await supabase
    .from('activity_log')
    .select('id, created_at, action, category, entity_label')
    .eq('user_id', user.id)
    .eq('category', 'collection')
    .order('created_at', { ascending: false })
    .limit(20)

  // Try a test insert
  const { error: insertErr } = await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'debug.test_collection_log',
    category: 'collection',
    entity_type: 'collection',
    entity_label: 'DEBUG TEST',
    metadata: {},
    source: 'app',
  })

  return NextResponse.json({
    userId: user.id,
    totalEntries: all?.length ?? 0,
    collectionEntries: collections?.length ?? 0,
    allCategories: [...new Set((all ?? []).map(e => e.category))],
    allError: allErr?.message ?? null,
    colError: colErr?.message ?? null,
    testInsertError: insertErr?.message ?? null,
    testInsertSuccess: !insertErr,
    recentAll: all?.slice(0, 10),
    recentCollections: collections,
  })
}
