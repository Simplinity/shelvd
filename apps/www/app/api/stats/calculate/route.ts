import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  let allBooks: any[] = [], bookOffset = 0
  while (true) {
    const { data: page } = await supabase.from('books')
      .select('id, status, condition_id, is_signed, has_dust_jacket, language_id, publisher_name, publication_place, cover_type, shelf, estimated_value, acquired_price, action_needed, publication_year, acquired_date')
      .eq('user_id', user.id).range(bookOffset, bookOffset + 999)
    if (!page?.length) break
    allBooks = [...allBooks, ...page]
    if (page.length < 1000) break
    bookOffset += 1000
  }

  const [{ data: conditions }, { data: languages }, { data: roles }] = await Promise.all([
    supabase.from('conditions').select('id, name'),
    supabase.from('languages').select('id, name_en'),
    supabase.from('contributor_roles').select('id, name'),
  ])
  const conditionMap = new Map(conditions?.map(c => [c.id, c.name]) || [])
  const languageMap = new Map(languages?.map(l => [l.id, l.name_en]) || [])
  const authorRoleIds = (roles || []).filter(r => r.name === 'Author').map(r => r.id)

  let allBC: any[] = []
  for (let i = 0; i < allBooks.length; i += 500) {
    const { data } = await supabase.from('book_contributors').select('book_id, role_id, contributor_id').in('book_id', allBooks.slice(i, i + 500).map(b => b.id))
    if (data) allBC = [...allBC, ...data]
  }

  let allContrib: any[] = [], cOffset = 0
  while (true) {
    const { data: page } = await supabase.from('contributors').select('id, canonical_name').range(cOffset, cOffset + 999)
    if (!page?.length) break
    allContrib = [...allContrib, ...page]
    if (page.length < 1000) break
    cOffset += 1000
  }
  const contribMap = new Map(allContrib.map(c => [c.id, c.canonical_name]))

  let totalValue = 0, totalPrice = 0, withValue = 0, withPrice = 0, actionCount = 0, signedCount = 0, djCount = 0
  const statusCounts: Record<string, number> = {}, condCounts: Record<string, number> = {}, pubCounts: Record<string, number> = {}
  const langCounts: Record<string, number> = {}, placeCounts: Record<string, number> = {}, coverCounts: Record<string, number> = {}, shelfCounts: Record<string, number> = {}
  let oldest: number | null = null, newest: number | null = null, latestAcq: string | null = null
  const acqYearCounts: Record<string, number> = {}, authorCounts: Record<string, number> = {}

  allBooks.forEach(b => {
    if (b.estimated_value) { totalValue += Number(b.estimated_value); withValue++ }
    if (b.acquired_price) { totalPrice += Number(b.acquired_price); withPrice++ }
    if (b.action_needed && b.action_needed !== 'none') actionCount++
    if (b.is_signed) signedCount++
    if (b.has_dust_jacket) djCount++
    statusCounts[b.status || 'unknown'] = (statusCounts[b.status || 'unknown'] || 0) + 1
    condCounts[b.condition_id ? conditionMap.get(b.condition_id) || 'Unknown' : 'Not set'] = (condCounts[b.condition_id ? conditionMap.get(b.condition_id) || 'Unknown' : 'Not set'] || 0) + 1
    if (b.publisher_name) pubCounts[b.publisher_name] = (pubCounts[b.publisher_name] || 0) + 1
    langCounts[b.language_id ? languageMap.get(b.language_id) || 'Unknown' : 'Not set'] = (langCounts[b.language_id ? languageMap.get(b.language_id) || 'Unknown' : 'Not set'] || 0) + 1
    if (b.publication_place) placeCounts[b.publication_place] = (placeCounts[b.publication_place] || 0) + 1
    if (b.cover_type) { const n = b.cover_type.split(' ').map((w:string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '); coverCounts[n] = (coverCounts[n] || 0) + 1 }
    if (b.shelf) shelfCounts[b.shelf] = (shelfCounts[b.shelf] || 0) + 1
    if (b.publication_year) { const y = Number(b.publication_year); if (!isNaN(y) && y > 1000 && y < 2100) { if (!oldest || y < oldest) oldest = y; if (!newest || y > newest) newest = y } }
    if (b.acquired_date) { const y = b.acquired_date.substring(0, 4); acqYearCounts[y] = (acqYearCounts[y] || 0) + 1; if (!latestAcq || b.acquired_date > latestAcq) latestAcq = b.acquired_date }
  })
  allBC.forEach(bc => { if (authorRoleIds.includes(bc.role_id)) { const n = contribMap.get(bc.contributor_id) || 'Unknown'; authorCounts[n] = (authorCounts[n] || 0) + 1 } })

  const top = (obj: Record<string, number>, n = 10) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n)

  const stats = {
    totalBooks: allBooks.length, totalEstimatedValue: totalValue, totalAcquiredPrice: totalPrice, booksWithValue: withValue, booksWithPrice: withPrice,
    profitLoss: totalValue - totalPrice, actionNeededCount: actionCount, statusCounts, conditionCounts: condCounts, signedCount, dustJacketCount: djCount,
    topAuthors: top(authorCounts), topPublishers: top(pubCounts), topLanguages: top(langCounts), topPlaces: top(placeCounts),
    topCoverTypes: top(coverCounts), topShelves: top(shelfCounts), topAcquisitionYears: Object.entries(acqYearCounts).sort((a,b) => b[0].localeCompare(a[0])).slice(0,10),
    oldestYear: oldest, newestYear: newest, latestAcquisitionDate: latestAcq,
  }

  await (supabase as any).from('user_stats').upsert({ user_id: user.id, stats, calculated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return NextResponse.json({ success: true, calculated_at: new Date().toISOString(), stats })
}
