// v4 - HTML email template styled like the site
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildHtml(opts: {
  fromName: string;
  body: string;
  replyTo?: string;
}): string {
  const { fromName, body, replyTo } = opts;
  const bodyHtml = body
    .split('\n')
    .map(l => l.trim() === '' ? '<br>' : `<p style="margin:0 0 14px 0;line-height:1.7;">${l}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Message de ${fromName}</title>
</head>
<body style="margin:0;padding:0;background:#f5eeef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a0f10;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5eeef;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#a31621;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:8px;">Préparation mentale</div>
            <div style="font-size:28px;font-weight:300;color:#fcf7f8;letter-spacing:-0.01em;">${fromName}</div>
            <div style="width:40px;height:1px;background:rgba(255,255,255,0.3);margin:16px auto 0;"></div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#fcf7f8;padding:40px 40px 32px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#fff9fa;border-top:1px solid #ead6d8;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            ${replyTo ? `<p style="margin:0 0 6px;font-size:12px;color:#5a3a3e;">Répondre à : <a href="mailto:${replyTo}" style="color:#a31621;text-decoration:none;">${replyTo}</a></p>` : ''}
            <p style="margin:0;font-size:11px;color:#c8989c;letter-spacing:0.08em;">
              ${fromName} &nbsp;·&nbsp; Pays de la Loire — en présentiel ou en visio
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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

    const isTestMode = !Deno.env.get('RESEND_VERIFIED_DOMAIN');
    const redirectTo = testEmail || replyTo || null;
    const actualTo = isTestMode && redirectTo ? redirectTo : to;
    const isRedirected = isTestMode && redirectTo && redirectTo !== to;

    const finalSubject = isRedirected ? `[TEST → ${toName || to}] ${subject}` : subject;
    const finalBody = isRedirected
      ? `[MODE TEST — destinataire réel : ${toName || ''} <${to}>]\n\n${body}`
      : body;

    const html = buildHtml({ fromName: fromName || 'Jodie Peltier', body: finalBody, replyTo });

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
        subject: finalSubject,
        text: finalBody,
        html,
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
