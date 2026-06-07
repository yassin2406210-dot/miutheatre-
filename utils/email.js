const https = require('https')

const RESEND_API_URL = 'api.resend.com'

function getFromEmail() {
  return process.env.FROM_EMAIL || 'MIU Theatre <onboarding@resend.dev>'
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || 'admin@miuegypt.edu.eg'
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml(title, lines) {
  const body = lines
    .filter(Boolean)
    .map(line => `<p style="margin:0 0 12px;color:#333;line-height:1.6;">${escapeHtml(line)}</p>`)
    .join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f6f6f6;">
      <div style="background:#111;color:#fff;border-radius:12px;padding:24px;">
        <h1 style="margin:0 0 16px;color:#ff6b6b;font-size:22px;">${escapeHtml(title)}</h1>
        <div style="background:#fff;border-radius:10px;padding:20px;">
          ${body}
          <p style="margin:20px 0 0;color:#777;font-size:13px;">MIU Theatre Club</p>
        </div>
      </div>
    </div>
  `
}

function sendEmail({ to, subject, title, lines }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('Email skipped: RESEND_API_KEY is not set')
    return Promise.resolve()
  }

  const payload = JSON.stringify({
    from: getFromEmail(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html: buildHtml(title || subject, lines || [])
  })

  const options = {
    hostname: RESEND_API_URL,
    path: '/emails',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          reject(new Error(`Email failed (${res.statusCode}): ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

function queueEmail(email) {
  sendEmail(email).catch(err => {
    console.log('Email error:', err.message)
  })
}

module.exports = {
  getAdminEmail,
  queueEmail
}
