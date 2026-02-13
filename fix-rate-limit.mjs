const SB_TOKEN = 'REDACTED_SUPABASE_TOKEN'
const REF = 'euieagntkbhzkyzvnllx'

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${SB_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rate_limit_email_sent: 30,
    smtp_max_frequency: 10,
  }),
})

if (res.ok) {
  const d = await res.json()
  console.log('✅ rate_limit_email_sent:', d.rate_limit_email_sent)
  console.log('✅ smtp_max_frequency:', d.smtp_max_frequency)
} else {
  console.log('❌', res.status, await res.text())
}
