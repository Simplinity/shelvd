const SB_TOKEN = 'REDACTED_SUPABASE_TOKEN'
const REF = 'euieagntkbhzkyzvnllx'

// Try all approaches for port
const attempts = [
  { smtp_port: 587 },
  { smtp_port: '587' },
]

for (const body of attempts) {
  console.log('Trying:', JSON.stringify(body))
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  console.log('  Result smtp_port:', data.smtp_port, '\n')
}

// Re-set full config with port as number
console.log('--- Full re-config ---')
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${SB_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    smtp_admin_email: 'hello@shelvd.org',
    smtp_sender_name: 'Shelvd',
    smtp_host: 'smtp.resend.com',
    smtp_port: '465',
    smtp_user: 'resend',
    smtp_pass: 'REDACTED_RESEND_KEY',
  }),
})
const data = await res.json()
console.log('smtp_host:', data.smtp_host)
console.log('smtp_port:', data.smtp_port)
console.log('smtp_user:', data.smtp_user)
console.log('smtp_admin_email:', data.smtp_admin_email)
