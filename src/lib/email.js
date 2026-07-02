import { pb } from './pocketbase.js';

export async function sendEmail({ to, toName, subject, body, fromName, replyTo, testEmail }) {
  const recipient = testEmail || to;
  try {
    await pb.send('/api/sendmail', {
      method: 'POST',
      body: { to: recipient, toName: toName || '', subject, html: body, replyTo: replyTo || '' },
    });
    return { ok: true, mode: 'smtp' };
  } catch (err) {
    // SMTP pas encore configuré → fallback mailto
    window.open(
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body || '')}`,
      '_blank'
    );
    return { ok: true, mode: 'mailto' };
  }
}

export function fillTemplate(tpl = '', vars = {}) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v ?? ''), tpl);
}
