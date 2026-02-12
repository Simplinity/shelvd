#!/usr/bin/env npx tsx
// E2E test — CERL HPB Provider
// Tests against live SRU at sru.k10plus.de/hpb

import { cerlHpb } from './cerl-hpb'

const PASS = '✅'
const FAIL = '❌'
let passed = 0
let failed = 0

function assert(condition: boolean, msg: string, detail?: string) {
  if (condition) {
    console.log(`  ${PASS} ${msg}`)
    passed++
  } else {
    console.log(`  ${FAIL} ${msg}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

async function test1_searchByFields_Erasmus() {
  console.log('\n━━━ Test 1: searchByFields — Erasmus, title "Adagia" ━━━')
  const res = await cerlHpb.searchByFields!({
    author: 'Erasmus',
    title: 'Adagia',
    limit: 5,
  })
  assert(res.items.length > 0, `Got ${res.items.length} results (expected >0)`)
  assert(res.total > 0, `Total: ${res.total}`)
  assert(res.provider === 'cerl_hpb', `Provider: ${res.provider}`)
  assert(!res.error, `No error`, res.error)

  if (res.items.length > 0) {
    const first = res.items[0]
    assert(!!first.title, `Title present: "${first.title}"`)
    assert(!!first.authors && first.authors.length > 0, `Authors: ${first.authors?.join(', ')}`)
    assert(!!first.edition_key, `Edition key (PPN): ${first.edition_key}`)
    assert(!!first.publication_year, `Year: ${first.publication_year}`)
  }
}

async function test2_searchByFields_Shakespeare_exactYear() {
  console.log('\n━━━ Test 2: searchByFields — Shakespeare, exact year 1623 (First Folio era) ━━━')
  const res = await cerlHpb.searchByFields!({
    author: 'Shakespeare',
    yearFrom: '1623',
    yearTo: '1623',
    limit: 5,
  })
  assert(res.items.length >= 0, `Got ${res.items.length} results`)
  assert(res.provider === 'cerl_hpb', `Provider: ${res.provider}`)
  assert(!res.error, `No error`, res.error)
  console.log(`  ℹ️  Total hits: ${res.total}`)

  if (res.items.length > 0) {
    const first = res.items[0]
    console.log(`  ℹ️  First result: "${first.title}" by ${first.authors?.join(', ')} (${first.publication_year})`)
  }
}

async function test3_searchByFields_titleOnly() {
  console.log('\n━━━ Test 3: searchByFields — title "Biblia sacra" ━━━')
  const res = await cerlHpb.searchByFields!({
    title: 'Biblia sacra',
    limit: 5,
  })
  assert(res.items.length > 0, `Got ${res.items.length} results (expected >0)`)
  assert(res.total > 0, `Total: ${res.total}`)
  assert(!res.error, `No error`, res.error)

  if (res.items.length > 0) {
    const first = res.items[0]
    assert(!!first.title, `Title: "${first.title}"`)
    console.log(`  ℹ️  Publisher: ${first.publisher || '(none)'}`)
    console.log(`  ℹ️  Year: ${first.publication_year || '(none)'}`)
  }
}

async function test4_getDetails() {
  console.log('\n━━━ Test 4: getDetails — fetch full record by PPN ━━━')
  // First find a PPN via search
  const search = await cerlHpb.searchByFields!({ author: 'Erasmus', title: 'Adagia', limit: 1 })
  const ppn = search.items[0]?.edition_key

  if (!ppn) {
    console.log(`  ⚠️  Skipped — no PPN from search`)
    return
  }

  console.log(`  ℹ️  Using PPN: ${ppn}`)
  const res = await cerlHpb.getDetails!(ppn)

  assert(res.success, `Success: ${res.success}`)
  assert(res.provider === 'cerl_hpb', `Provider: ${res.provider}`)
  assert(!!res.source_url, `Source URL: ${res.source_url}`)

  if (res.data) {
    assert(!!res.data.title, `Title: "${res.data.title}"`)
    assert(!!res.data.authors && res.data.authors.length > 0, `Authors: ${res.data.authors?.join(', ')}`)
    assert(!!res.data.publication_year, `Year: ${res.data.publication_year}`)

    // Rich data checks (valuable for rare books)
    console.log(`  ℹ️  Publisher: ${res.data.publisher || '(none)'}`)
    console.log(`  ℹ️  Place: ${res.data.publication_place || '(none)'}`)
    console.log(`  ℹ️  Language: ${res.data.language || '(none)'}`)
    console.log(`  ℹ️  Pagination: ${res.data.pagination_description || '(none)'}`)
    console.log(`  ℹ️  Format/dimensions: ${res.data.format || '(none)'}`)
    console.log(`  ℹ️  Edition: ${res.data.edition || '(none)'}`)
    console.log(`  ℹ️  Series: ${res.data.series || '(none)'}`)

    if (res.data.notes) {
      const noteLines = res.data.notes.split('\n')
      console.log(`  ℹ️  Notes (${noteLines.length} lines):`)
      for (const line of noteLines.slice(0, 5)) {
        console.log(`       ${line}`)
      }
      if (noteLines.length > 5) console.log(`       ... (${noteLines.length - 5} more)`)
    }
  }
}

async function test5_search_isbn() {
  console.log('\n━━━ Test 5: search (ISBN) — unlikely for HPB but test the path ━━━')
  // Using a random ISBN that likely won't be in HPB
  const res = await cerlHpb.search('9780140449136')
  // We just check it doesn't crash
  assert(res.provider === 'cerl_hpb', `Provider: ${res.provider}`)
  console.log(`  ℹ️  Success: ${res.success}, Error: ${res.error || '(none)'}`)
  if (res.data) {
    console.log(`  ℹ️  Found: "${res.data.title}" by ${res.data.authors?.join(', ')}`)
  }
}

async function test6_searchByFields_empty() {
  console.log('\n━━━ Test 6: searchByFields — empty params (should error gracefully) ━━━')
  const res = await cerlHpb.searchByFields!({})
  assert(res.items.length === 0, `No items returned`)
  assert(!!res.error, `Error message: "${res.error}"`)
}

async function test7_searchByFields_publisher() {
  console.log('\n━━━ Test 7: searchByFields — publisher "Plantin" (Antwerp printer) ━━━')
  const res = await cerlHpb.searchByFields!({
    publisher: 'Plantin',
    limit: 5,
  })
  assert(res.items.length > 0, `Got ${res.items.length} results (expected >0)`)
  assert(res.total > 0, `Total: ${res.total}`)
  assert(!res.error, `No error`, res.error)

  if (res.items.length > 0) {
    for (const item of res.items.slice(0, 3)) {
      console.log(`  ℹ️  "${item.title}" — ${item.publisher || '(no pub)'} (${item.publication_year || '?'})`)
    }
  }
}

// ===================== RUN ALL =====================

async function main() {
  console.log('🏛️  CERL HPB Provider — E2E Tests')
  console.log('═══════════════════════════════════════')

  await test1_searchByFields_Erasmus()
  await test2_searchByFields_Shakespeare_exactYear()
  await test3_searchByFields_titleOnly()
  await test4_getDetails()
  await test5_search_isbn()
  await test6_searchByFields_empty()
  await test7_searchByFields_publisher()

  console.log('\n═══════════════════════════════════════')
  console.log(`📊 Results: ${passed} passed, ${failed} failed (${passed + failed} total)`)
  if (failed > 0) process.exit(1)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
