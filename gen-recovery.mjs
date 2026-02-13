// Generate a fresh recovery link via Supabase Admin API
const SUPABASE_URL = 'https://euieagntkbhzkyzvnllx.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Read from .env.local
import { readFileSync } from 'fs'
const envFile = readFileSync('/Users/bruno/Developer/shelvd/apps/www/.env.local', 'utf8')
const serviceKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

if (!serviceKey) {
  // Try regular env
  const envFile2 = readFileSync('/Users/bruno/Developer/shelvd/.env.local', 'utf8')
  const sk2 = envFile2.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
  if (!sk2) {
    console.log('No service role key found. Checking .env files...')
    console.log(envFile.substring(0, 200))
    process.exit(1)
  }
}

const key = serviceKey

const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'apikey': key,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'recovery',
    email: 'bvanbranden@icloud.com',
  }),
})

if (res.ok) {
  const data = await res.json()
  console.log('=== RECOVERY LINK ===')
  // The action_link contains the full verification URL
  console.log('Action link:', data.action_link)
  // We need the hashed_token for our custom flow
  console.log('Hashed token:', data.hashed_token) 
  console.log('\nUse this URL:')
  console.log(`https://www.shelvd.org/auth/confirm?token_hash=${data.hashed_token}&type=recovery&next=/reset-password`)
} else {
  console.log('Failed:', res.status, await res.text())
}
