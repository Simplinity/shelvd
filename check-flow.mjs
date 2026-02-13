const SB_TOKEN = 'sbp_abd7fd7800e1da94305c38e8bf840d455d45e9aa'
const REF = 'euieagntkbhzkyzvnllx'

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  headers: { 'Authorization': `Bearer ${SB_TOKEN}` }
})
const data = await res.json()

// Show full recovery template
console.log('=== RECOVERY TEMPLATE ===')
console.log(data.mailer_templates_recovery_content)

// Check for flow type
console.log('\n=== FLOW SETTINGS ===')
for (const k of Object.keys(data).sort()) {
  if (k.includes('flow') || k.includes('pkce') || k.includes('otp')) {
    console.log(`${k}: ${data[k]}`)
  }
}
