'use server'

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

type FeedbackEmailData = {
  type: 'bug' | 'contact' | 'callback'
  subject?: string
  message?: string
  severity?: string
  urgency?: string
  category?: string
  phone?: string
  preferredTime?: string
  userEmail: string
  feedbackId: string
}

const TYPE_LABELS: Record<string, string> = {
  bug: '🐛 Bug Report',
  contact: '✉️ Contact Request',
  callback: '📞 Callback Request',
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  major: '#ea580c',
  minor: '#ca8a04',
  cosmetic: '#6b7280',
}

// ─── Send admin response to user ───

export async function sendAdminResponseEmail(userEmail: string, subject: string, response: string, originalMessage?: string) {
  console.log('[Email] Sending admin response to:', userEmail)
  if (!resend) { console.log('[Email] No RESEND_API_KEY configured'); return }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="border-bottom:3px solid #dc2626;padding:16px 0;">
        <span style="font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">SHELVD</span>
        <span style="font-size:11px;color:#6b7280;margin-left:8px;">Support Response</span>
      </div>
      <div style="padding:24px 0;">
        <p style="font-size:15px;font-weight:600;margin:0 0 16px;">Re: ${subject}</p>
        <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0 0 24px;">${response}</div>
        ${originalMessage ? `
          <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px;">
            <p style="font-size:11px;color:#9ca3af;margin:0 0 8px;">Your original message:</p>
            <div style="font-size:12px;color:#6b7280;line-height:1.5;white-space:pre-wrap;">${originalMessage}</div>
          </div>
        ` : ''}
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:12px 0;font-size:11px;color:#9ca3af;">
        Shelvd Support &middot; <a href="https://shelvd.org/support" style="color:#dc2626;">View your tickets</a>
      </div>
    </div>
  `

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Shelvd <onboarding@resend.dev>',
      to: [userEmail],
      subject: `[Shelvd] Re: ${subject}`,
      html,
    })
    console.log('[Email] Admin response send result:', JSON.stringify(result))
  } catch (err) {
    console.error('[Email] Failed to send admin response:', err)
  }
}

// ─── Send feedback notification to admins ───

export async function sendFeedbackNotification(data: FeedbackEmailData, adminEmails: string[]) {
  console.log('[Email] Attempting to send feedback notification to:', adminEmails)
  if (!resend) { console.log('[Email] No RESEND_API_KEY configured'); return }
  if (adminEmails.length === 0) { console.log('[Email] No admin emails'); return }

  const typeLabel = TYPE_LABELS[data.type] || data.type
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shelvd.org'}/admin/support`

  // Build details section based on type
  let detailsHtml = ''
  if (data.type === 'bug') {
    const severityColor = SEVERITY_COLORS[data.severity || 'minor'] || '#6b7280'
    detailsHtml = `
      <tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">Severity</td>
      <td style="padding:6px 12px;"><span style="color:${severityColor};font-weight:600;text-transform:capitalize;">${data.severity || 'minor'}</span></td></tr>
    `
  } else if (data.type === 'callback') {
    detailsHtml = `
      <tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">Phone</td>
      <td style="padding:6px 12px;">${data.phone || '—'}</td></tr>
      <tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">Preferred time</td>
      <td style="padding:6px 12px;text-transform:capitalize;">${data.preferredTime || '—'}</td></tr>
      ${data.urgency === 'urgent' ? '<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">Urgency</td><td style="padding:6px 12px;color:#dc2626;font-weight:600;">URGENT</td></tr>' : ''}
    `
  } else if (data.type === 'contact') {
    detailsHtml = `
      <tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">Category</td>
      <td style="padding:6px 12px;text-transform:capitalize;">${(data.category || 'general').replace('_', ' ')}</td></tr>
    `
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="border-bottom:3px solid #dc2626;padding:16px 0;">
        <span style="font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">SHELVD</span>
        <span style="font-size:11px;color:#6b7280;margin-left:8px;">Support Notification</span>
      </div>
      <div style="padding:24px 0;">
        <p style="font-size:15px;font-weight:600;margin:0 0 4px;">${typeLabel}</p>
        <p style="font-size:12px;color:#6b7280;margin:0 0 20px;">From ${data.userEmail}</p>
        
        ${data.subject ? `<p style="font-size:14px;font-weight:600;margin:0 0 8px;">${data.subject}</p>` : ''}
        ${data.message ? `<div style="background:#f9fafb;border-left:2px solid #e5e7eb;padding:12px 16px;font-size:13px;line-height:1.5;margin:0 0 16px;white-space:pre-wrap;">${data.message}</div>` : ''}
        
        ${detailsHtml ? `<table style="font-size:13px;border-collapse:collapse;margin:0 0 20px;">${detailsHtml}</table>` : ''}

        <a href="${adminUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:10px 20px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
          View in Admin →
        </a>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:12px 0;font-size:11px;color:#9ca3af;">
        Shelvd Support System · Do not reply to this email
      </div>
    </div>
  `

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Shelvd <onboarding@resend.dev>',
      to: adminEmails,
      subject: `[Shelvd] ${typeLabel}: ${data.subject || 'New submission'}`,
      html,
    })
    console.log('[Email] Send result:', JSON.stringify(result))
  } catch (err) {
    console.error('[Email] Failed to send:', err)
  }
}
