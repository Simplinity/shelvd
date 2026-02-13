const URL = 'https://euieagntkbhzkyzvnllx.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aWVhZ250a2JoemtlenZubGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTc2NDcsImV4cCI6MjA2MzIzMzY0N30.P5moVx2Jfcg3r1It4E12MDFkDOCLDwnRANp8hXL_sEk'

async function rpc(name) {
  const res = await fetch(`${URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  const text = await res.text()
  console.log(`=== ${name} (${res.status}) ===`)
  console.log(text)
  console.log()
}

await rpc('debug_auth_users')
await rpc('debug_user_profiles')
