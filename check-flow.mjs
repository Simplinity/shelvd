const SB_TOKEN = 'sbp_abd7fd7800e1da94305c38e8bf840d455d45e9aa'
const REF = 'euieagntkbhzkyzvnllx'

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  headers: { 'Authorization': `Bearer ${SB_TOKEN}` }
})
const data = await res.json()

// Show ALL keys
for (const k of Object.keys(data).sort()) {
  if (k.includes('url') || k.includes('flow') || k.includes('pkce') || k.includes('path') || k.includes('otp') || k.includes('mailer_url')) {
    console.log(`${k}: ${data[k]}`)
  }
}

console.log('\n--- All keys containing "mail" ---')
for (const k of Object.keys(data).sort()) {
  if (k.includes('mail') && !k.includes('template') && !k.includes('subject') && !k.includes('notification')) {
    console.log(`${k}: ${data[k]}`)
  }
}
