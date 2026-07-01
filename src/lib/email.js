export async function sendEmail({ to, subject, body }) {
  window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  return { ok: true };
}

export function fillTemplate(tpl = '', vars = {}) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v ?? ''), tpl);
}
