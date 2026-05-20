// v2 - test mode redirects to admin email
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, toName, subject, body, fromName, replyTo } = await req.json();

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ success: false, error: 'Champs manquants : to, subject, body' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'RESEND_API_KEY non configurée' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // En mode test (onboarding@resend.dev), Resend n'autorise l'envoi qu'à
    // l'email vérifié du compte. On redirige vers l'admin avec une note.
    const adminEmail = replyTo || to;
    const isTestMode = !Deno.env.get('RESEND_VERIFIED_DOMAIN');
    const actualTo = isTestMode ? adminEmail : to;
    const actualBody = isTestMode && adminEmail !== to
      ? `[MODE TEST — destinataire réel : ${toName || ''} <${to}>]\n\n${body}`
      : body;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${fromName || 'Jodie Peltier'} <onboarding@resend.dev>`,
        reply_to: replyTo || undefined,
        to: [actualTo],
        subject: isTestMode && adminEmail !== to ? `[TEST] ${subject}` : subject,
        text: actualBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data?.message || data?.name || JSON.stringify(data);
      return new Response(JSON.stringify({ success: false, error: `Resend ${res.status}: ${detail}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
