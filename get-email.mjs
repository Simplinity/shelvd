const RESEND_KEY = 're_C9F668Sw_GL9FgaWQDLXTbpDiE9EKyuMc'

// Get recent emails from Resend
const res = await fetch('https://api.resend.com/emails', {
  headers: { 'Authorization': `Bearer ${RESEND_KEY}` }
})
const data = await res.json()
console.log(JSON.stringify(data, null, 2))
