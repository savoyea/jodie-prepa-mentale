// Endpoint POST /api/sendmail
// Body: { to, toName?, subject, html?, text?, replyTo? }
// Auth requise : utilisateur connecté (jodie)
routerAdd("POST", "/api/sendmail", (c) => {
  const info = $apis.requestInfo(c);
  const { to, toName, subject, html, text, replyTo } = info.data;

  if (!to || !subject) {
    return c.json(400, { ok: false, error: "Champs requis manquants : to, subject" });
  }

  const settings = $app.settings();
  const fromAddress = settings.meta.senderAddress || "noreply@jodie.arsava.fr";
  const fromName    = settings.meta.senderName    || "Jodie Peltier";

  const message = new MailerMessage({
    from:    { address: fromAddress, name: fromName },
    to:      [{ address: to, name: toName || "" }],
    subject: subject,
    html:    html || text || "",
    text:    text || (html || "").replace(/<[^>]+>/g, ""),
  });

  if (replyTo) {
    message.headers = { "Reply-To": replyTo };
  }

  try {
    $app.newMailClient().send(message);
    return c.json(200, { ok: true });
  } catch (err) {
    return c.json(500, { ok: false, error: err?.message || "Échec d'envoi" });
  }
}, $apis.requireRecordAuth());
