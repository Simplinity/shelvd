const SB_TOKEN = 'sbp_abd7fd7800e1da94305c38e8bf840d455d45e9aa'
const REF = 'euieagntkbhzkyzvnllx'

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  headers: { 'Authorization': `Bearer ${SB_TOKEN}` }
})
const data = await res.json()

console.log('=== SMTP CONFIG ===')
console.log('smtp_host:', data.smtp_host)
console.log('smtp_port:', data.smtp_port)
console.log('smtp_user:', data.smtp_user)
console.log('smtp_admin_email:', data.smtp_admin_email)
console.log('smtp_sender_name:', data.smtp_sender_name)
console.log('smtp_pass set:', data.smtp_pass ? 'YES (' + data.smtp_pass.substring(0,8) + '...)' : 'NO')
console.log('smtp_max_frequency:', data.smtp_max_frequency)
console.log('rate_limit_email_sent:', data.rate_limit_email_sent)
console.log('site_url:', data.site_url)

console.log('\n=== RECOVERY TEMPLATE (first 200 chars) ===')
console.log(data.mailer_templates_recovery_content?.substring(0, 200))
