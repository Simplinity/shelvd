const SB_TOKEN = 'REDACTED_SUPABASE_TOKEN'
const REF = 'euieagntkbhzkyzvnllx'

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  headers: { 'Authorization': `Bearer ${SB_TOKEN}` }
})
const data = await res.json()

// Show ALL keys to find enable/external/custom smtp flag
const keys = Object.keys(data).sort()
for (const k of keys) {
  if (k.includes('smtp') || k.includes('external') || k.includes('enable') || k.includes('custom') || k.includes('rate') || k.includes('freq')) {
    console.log(`${k}: ${data[k]}`)
  }
}
