const SB_TOKEN = 'sbp_abd7fd7800e1da94305c38e8bf840d455d45e9aa'
const REF = 'euieagntkbhzkyzvnllx'

// Update email templates to use token_hash instead of PKCE code
const confirmTemplate = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Shelvd</h1>
  <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Book Collection Management</p>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Welcome! Click the button below to confirm your email and start cataloging your collection.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/books" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Confirm your email</a>
  <p style="font-size: 12px; color: #999; margin-top: 32px;">If you didn't create a Shelvd account, you can safely ignore this email.</p>
</div>`

const recoveryTemplate = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Shelvd</h1>
  <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Book Collection Management</p>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">We received a request to reset your password. Click the button below to choose a new one.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Reset password</a>
  <p style="font-size: 12px; color: #999; margin-top: 32px;">If you didn't request a password reset, you can safely ignore this email.</p>
</div>`

const magicLinkTemplate = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Shelvd</h1>
  <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Book Collection Management</p>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Click the button below to sign in to your account.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/books" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Sign in to Shelvd</a>
  <p style="font-size: 12px; color: #999; margin-top: 32px;">If you didn't request this link, you can safely ignore this email.</p>
</div>`

const inviteTemplate = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Shelvd</h1>
  <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Book Collection Management</p>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">You've been invited to join Shelvd. Click the button below to accept your invitation.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/books" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Accept invitation</a>
  <p style="font-size: 12px; color: #999; margin-top: 32px;">If you weren't expecting this, you can safely ignore this email.</p>
</div>`

const emailChangeTemplate = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Shelvd</h1>
  <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Book Collection Management</p>
  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Click the button below to confirm your new email address.</p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/books" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Confirm email change</a>
  <p style="font-size: 12px; color: #999; margin-top: 32px;">If you didn't request this change, you can safely ignore this email.</p>
</div>`

console.log('Updating email templates to use token_hash...')
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${SB_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mailer_templates_confirmation_content: confirmTemplate,
    mailer_templates_recovery_content: recoveryTemplate,
    mailer_templates_magic_link_content: magicLinkTemplate,
    mailer_templates_invite_content: inviteTemplate,
    mailer_templates_email_change_content: emailChangeTemplate,
  }),
})

if (res.ok) {
  console.log('✅ All email templates updated to use token_hash')
} else {
  console.log('❌', res.status, await res.text())
}
