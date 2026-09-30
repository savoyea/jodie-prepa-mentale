import { useState, useEffect } from 'react';
import { Mail, Trash2, X } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { loadContacts, saveContacts, loadAppSettings } from '../../lib/storage.js';
import { sendEmail } from '../../lib/email.js';

function ContactReplyModal({ contact, content, appSettings, onClose, showToast }) {
  const [subject, setSubject] = useState(`Re: ${contact.subject || 'Votre message'}`);
  const [body, setBody] = useState(`Bonjour ${contact.name.split(' ')[0]},\n\n`);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const send = async () => {
    if (!contact.email) { showToast("Pas d'email pour ce contact"); return; }
    setSending(true); setErr(null);
    try {
      const res = await sendEmail({ to: contact.email, toName: contact.name, subject, body, fromName: content?.siteName || 'Jodie Peltier', replyTo: content?.contactEmail, testEmail: appSettings?.testEmail });
      if (!res.ok) throw new Error(res.error);
      showToast("Message envoyé ✓");
      onClose();
    } catch (e) { setErr("Erreur : " + e.message); } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--color-cream)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--color-sage-dark)' }}>
          <div className="font-serif text-xl" style={{ color: 'var(--color-cream)' }}>Répondre à {contact.name}</div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)' }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-xs font-mono px-3 py-2 rounded-lg" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)' }}>À : <strong>{contact.email}</strong></div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Sujet</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Message</div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none" style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
          </div>
          {err && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{err}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={send} disabled={sending} className="flex-1 px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
              <Mail size={12} />{sending ? 'Envoi…' : 'Envoyer'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const { content } = useSite();
  const { showToast } = useAdmin();
  const [contacts, setContacts] = useState([]);
  const [appSettings, setAppSettings] = useState({});
  const [selected, setSelected] = useState(null);
  const [replyModal, setReplyModal] = useState(null);

  useEffect(() => {
    Promise.all([loadContacts(), loadAppSettings()]).then(([c, as]) => {
      setContacts(c); setAppSettings(as);
    });
  }, []);

  const markRead = (id) => {
    const updated = contacts.map(c => c.id === id ? { ...c, read: true } : c);
    setContacts(updated); saveContacts(updated);
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated); saveContacts(updated);
    if (selected?.id === id) setSelected(null);
    showToast("Message supprimé");
  };

  const list = [...contacts].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <div className="space-y-6">
      <div>
        <div className="font-serif text-3xl mb-1" style={{ color: 'var(--color-ink)' }}>Messages</div>
        <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{list.length} message{list.length !== 1 ? 's' : ''} reçu{list.length !== 1 ? 's' : ''}</div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
          <Mail size={32} style={{ color: 'var(--color-line)', margin: '0 auto 12px' }} />
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Aucun message pour le moment</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          {/* Liste */}
          <div className="space-y-2">
            {list.map(c => (
              <button key={c.id} onClick={() => { setSelected(c); markRead(c.id); }} className="w-full text-left p-4 rounded-xl transition-all"
                style={{ background: selected?.id === c.id ? 'var(--color-ink)' : 'var(--color-cream)', color: selected?.id === c.id ? 'var(--color-cream)' : 'var(--color-ink)', border: `1px solid ${selected?.id === c.id ? 'transparent' : 'var(--color-line)'}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{c.name}</span>
                  {!c.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-sage-dark)' }} />}
                </div>
                <div className="text-xs truncate opacity-70">{c.subject || 'Sans sujet'}</div>
                <div className="text-[10px] mt-1 opacity-50 font-mono">
                  {c.date ? new Date(c.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                </div>
              </button>
            ))}
          </div>

          {/* Détail */}
          {selected ? (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-line)', background: 'var(--color-cream)' }}>
              <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: '1px solid var(--color-line)' }}>
                <div>
                  <div className="font-serif text-xl" style={{ color: 'var(--color-ink)' }}>{selected.name}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--color-sage-dark)' }}>{selected.email}</a>
                    {selected.phone && <> · {selected.phone}</>}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
                    {selected.date ? new Date(selected.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setReplyModal(selected)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
                    <Mail size={12} /> Répondre
                  </button>
                  <button onClick={() => deleteContact(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)', border: '1px solid var(--color-line)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {selected.subject && (
                <div className="px-6 py-3 text-sm font-medium" style={{ borderBottom: '1px solid var(--color-line)', color: 'var(--color-ink-soft)' }}>
                  Sujet : {selected.subject}
                </div>
              )}
              <div className="px-6 py-5 text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-ink)' }}>{selected.message}</div>
            </div>
          ) : (
            <div className="rounded-2xl flex items-center justify-center min-h-[200px]" style={{ border: '1px solid var(--color-line)', background: 'var(--color-cream)' }}>
              <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Sélectionnez un message</div>
            </div>
          )}
        </div>
      )}

      {replyModal && (
        <ContactReplyModal
          contact={replyModal}
          content={content}
          appSettings={appSettings}
          onClose={() => setReplyModal(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
