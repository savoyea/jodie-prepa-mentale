import { supabase, isSupabaseConfigured, supabaseAnonKey } from './supabase.js';

export async function sendEmail({ to, toName, subject, body, fromName, replyTo, testEmail }) {
  if (!isSupabaseConfigured) {
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    return { ok: true };
  }
  const { data, error } = await supabase.functions.invoke('send-email', {
    headers: { Authorization: `Bearer ${supabaseAnonKey}` },
    body: { to, toName, subject, body, fromName, replyTo, testEmail },
  });
  if (error) return { ok: false, error: error.message };
  if (data && !data.success) return { ok: false, error: data.error };
  return { ok: true };
}

export function fillTemplate(tpl = '', vars = {}) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v ?? ''), tpl);
}
