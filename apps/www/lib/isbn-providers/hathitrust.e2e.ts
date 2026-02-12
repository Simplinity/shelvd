#!/usr/bin/env npx tsx
// E2E test — HathiTrust Provider
// Tests against live API at catalog.hathitrust.org

import { hathiTrust } from './hathitrust'

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

async function test1_isbn_euclid() {
  console.log('\n━━━ Test 1: ISBN lookup — Euclid\'s Elements (Dover, 0486600890) ━━━')
  const res = await hathiTrust.search('0486600890')
  assert(res.success, `Success: ${res.success}`)
  assert(res.provider === 'hathitrust', `Provider: ${res.provider}`)
  assert(!!res.source_url, `Source URL: ${res.source_url}`)

  if (res.data) {
    assert(!!res.data.title, `Title: "${res.data.title}"`)
    assert(!!res.data.authors && res.data.authors.length > 0, `Authors: ${res.data.authors?.join(', ')}`)
    assert(!!res.data.publication_year, `Year: ${res.data.publication_year}`)
    assert(!!res.data.publisher, `Publisher: ${res.data.publisher}`)
    assert(!!res.data.publication_place, `Place: ${res.data.publication_place}`)
    console.log(`  ℹ️  Edition: ${res.data.edition || '(none)'}`)
    console.log(`  ℹ️  LCCN: ${res.data.lccn || '(none)'}`)
    console.log(`  ℹ️  OCLC: ${res.data.oclc_number || '(none)'}`)
    console.log(`  ℹ️  DDC: ${res.data.ddc || '(none)'}`)
    console.log(`  ℹ️  LCC: ${res.data.lcc || '(none)'}`)
    console.log(`  ℹ️  Language: ${res.data.language || '(none)'}`)
    console.log(`  ℹ️  Pagination: ${res.data.pagination_description || '(none)'}`)
    console.log(`  ℹ️  Subjects: ${res.data.subjects?.join('; ') || '(none)'}`)

    // Check holding library info in notes
    assert(!!res.data.notes && res.data.notes.includes('HathiTrust:'), `Holding library notes present`)
    if (res.data.notes) {
      for (const line of res.data.notes.split('\n').slice(-3)) {
        console.log(`  ℹ️  ${line}`)
      }
    }
  }
}

async function test2_isbn_not_found() {
  console.log('\n━━━ Test 2: ISBN not found — random ISBN ━━━')
  const res = await hathiTrust.search('9999999999999')
  assert(!res.success, `Not found (expected)`)
  assert(res.provider === 'hathitrust', `Provider: ${res.provider}`)
  assert(!!res.error, `Error: "${res.error}"`)
}

async function test3_getDetails() {
  console.log('\n━━━ Test 3: getDetails — Euclid record number 000423505 ━━━')
  const res = await hathiTrust.getDetails!('000423505')
  assert(res.success, `Success: ${res.success}`)
  assert(res.provider === 'hathitrust', `Provider: ${res.provider}`)
  assert(!!res.source_url, `Source URL: ${res.source_url}`)

  if (res.data) {
    assert(!!res.data.title, `Title: "${res.data.title}"`)
    assert(!!res.data.authors && res.data.authors.length > 0, `Authors: ${res.data.authors?.join(', ')}`)
    assert(!!res.data.notes && res.data.notes.includes('HathiTrust:'), `Holding info present`)
  }
}

async function test4_isbn13() {
  console.log('\n━━━ Test 4: ISBN-13 lookup ━━━')
  const res = await hathiTrust.search('9780486600888')
  assert(res.provider === 'hathitrust', `Provider: ${res.provider}`)
  console.log(`  ℹ️  Success: ${res.success}, Title: ${res.data?.title || res.error}`)
}

async function test5_no_searchByFields() {
  console.log('\n━━━ Test 5: No searchByFields (identifier-only API) ━━━')
  assert(!hathiTrust.searchByFields, `searchByFields not implemented (correct — HathiTrust is lookup-only)`)
}

async function main() {
  console.log('📚 HathiTrust Provider — E2E Tests')
  console.log('═══════════════════════════════════════')

  await test1_isbn_euclid()
  await test2_isbn_not_found()
  await test3_getDetails()
  await test4_isbn13()
  await test5_no_searchByFields()

  console.log('\n═══════════════════════════════════════')
  console.log(`📊 Results: ${passed} passed, ${failed} failed (${passed + failed} total)`)
  if (failed > 0) process.exit(1)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
