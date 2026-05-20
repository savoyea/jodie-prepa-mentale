// v3 - testEmail configurable depuis le BO
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
    const { to, toName, subject, body, fromName, replyTo, testEmail } = await req.json();

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

    // En mode test, rediriger vers testEmail (config BO) ou replyTo (email admin)
    const isTestMode = !Deno.env.get('RESEND_VERIFIED_DOMAIN');
    const redirectTo = testEmail || replyTo || null;
    const actualTo = isTestMode && redirectTo ? redirectTo : to;
    const isRedirected = isTestMode && redirectTo && redirectTo !== to;

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
        subject: isRedirected ? `[TEST → ${toName || to}] ${subject}` : subject,
        text: isRedirected ? `[MODE TEST — destinataire réel : ${toName || ''} <${to}>]\n\n${body}` : body,
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
