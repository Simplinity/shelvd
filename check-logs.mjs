const SB_TOKEN = 'REDACTED_SUPABASE_TOKEN'
const REF = 'euieagntkbhzkyzvnllx'

// Check Supabase auth logs for SMTP errors
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/analytics/endpoints/logs.all?iso_timestamp_start=${new Date(Date.now() - 600000).toISOString()}&iso_timestamp_end=${new Date().toISOString()}`, {
  headers: { 'Authorization': `Bearer ${SB_TOKEN}` }
})

if (res.ok) {
  const data = await res.json()
  const authLogs = (data.result || data || []).filter(l => {
    const msg = JSON.stringify(l).toLowerCase()
    return msg.includes('smtp') || msg.includes('mail') || msg.includes('email') || msg.includes('error') || msg.includes('reset') || msg.includes('recovery')
  })
  console.log(`Found ${authLogs.length} relevant logs:`)
  authLogs.slice(0, 10).forEach(l => console.log(JSON.stringify(l, null, 2)))
  
  if (authLogs.length === 0) {
    console.log('\nNo filtered logs. Showing last 5 raw logs:')
    ;(data.result || data || []).slice(0, 5).forEach(l => console.log(JSON.stringify(l, null, 2)))
  }
} else {
  console.log('Failed:', res.status, await res.text())
}
