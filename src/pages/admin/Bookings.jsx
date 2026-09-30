import { useState, useEffect } from 'react';
import { Trash2, Mail, X } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { loadBookings, saveBookings, loadSlots, saveSlots, loadAppSettings } from '../../lib/storage.js';
import { sendEmail, fillTemplate } from '../../lib/email.js';
import { addMinutes } from '../../utils.js';

const STATUS_COLOR = { 'en attente': 'var(--color-ochre)', 'confirmé': 'var(--color-sage-dark)', 'annulé': '#6b7280' };

function BookingResponseModal({ action, booking, service, content, appSettings, onConfirm, onClose }) {
  const vars = { service: service?.name || '', date: booking?.date || '', heure: booking?.time || '', nom: booking?.clientName || '', prenom: (booking?.clientName || '').split(' ')[0], email: booking?.clientEmail || '', tel: booking?.clientPhone || '', message: booking?.note || '' };
  const tpls = { confirmé: { s: appSettings?.emailSubjectConfirm, b: appSettings?.emailTemplateConfirm }, annulé: { s: appSettings?.emailSubjectCancel, b: appSettings?.emailTemplateCancel }, supprimé: { s: appSettings?.emailSubjectDelete, b: appSettings?.emailTemplateDelete } };
  const tpl = tpls[action] || {};
  const [subject, setSubject] = useState(fillTemplate(tpl.s || '', vars));
  const [body, setBody] = useState(fillTemplate(tpl.b || '', vars));
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const colors = { confirmé: 'var(--color-sage-dark)', annulé: 'var(--color-ochre)', supprimé: 'var(--color-sage-dark)' };
  const labels = { confirmé: 'Confirmer', annulé: 'Annuler', supprimé: 'Supprimer' };
  const sendAndAct = async () => {
    setSending(true); setErr(null);
    try {
      const res = await sendEmail({ to: booking.clientEmail, toName: booking.clientName, subject, body, fromName: content?.siteName || 'Jodie Peltier', replyTo: content?.contactEmail, testEmail: appSettings?.testEmail });
      if (!res.ok) throw new Error(res.error);
      onConfirm();
    } catch (e) { setErr("Erreur : " + e.message); } finally { setSending(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--color-cream)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--color-sage-dark)' }}>
          <div className="font-serif text-xl" style={{ color: 'var(--color-cream)' }}>Répondre à {booking?.clientName}</div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)' }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-xs font-mono px-3 py-2 rounded-lg flex items-center justify-between" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)' }}>
            <span>À : <strong>{booking?.clientEmail}</strong></span>
          </div>
          <div><div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Sujet</div><input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} /></div>
          <div><div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Message</div><textarea value={body} onChange={e => setBody(e.target.value)} rows={7} className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none" style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} /></div>
          {err && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{err}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={sendAndAct} disabled={sending} className="flex-1 px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: colors[action], color: 'var(--color-cream)' }}>
              <Mail size={12} />{sending ? 'Envoi…' : `Envoyer + ${labels[action]}`}
            </button>
            <button onClick={onConfirm} className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>{labels[action]} sans message</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Bookings() {
  const { services, content } = useSite();
  const { showToast } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appSettings, setAppSettings] = useState({});
  const [filter, setFilter] = useState('all');
  const [pending, setPending] = useState(null);

  useEffect(() => {
    Promise.all([loadBookings(), loadSlots(), loadAppSettings()]).then(([b, s, as]) => {
      setBookings(b); setSlots(s); setAppSettings(as);
    });
  }, []);

  const askAction = (booking, action) => {
    setPending({ booking, action, service: services.find(s => s.id === booking.serviceId) });
  };

  const doStatus = (id, status) => {
    const nb = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(nb); saveBookings(nb);
    showToast(`Statut : ${status}`);
    setPending(null);
  };

  const doRemove = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) { const ns = slots.map(s => (s.date === booking.date && s.time === booking.time) ? { ...s, available: true } : s); setSlots(ns); saveSlots(ns); }
    const nb = bookings.filter(b => b.id !== id);
    setBookings(nb); saveBookings(nb);
    showToast("Réservation supprimée");
    setPending(null);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <h1 className="font-serif text-4xl mb-2" style={{ color: 'var(--color-ink)' }}>Réservations</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>Suivez et gérez les demandes de vos clients.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'en attente', 'confirmé', 'annulé'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all"
            style={{ background: filter === f ? 'var(--color-ink)' : 'transparent', color: filter === f ? 'var(--color-cream)' : 'var(--color-ink-soft)', border: filter !== f ? '1px solid var(--color-line)' : 'none' }}>
            {f === 'all' ? 'Toutes' : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0
          ? <div className="p-8 text-center rounded-2xl text-sm" style={{ background: 'var(--color-cream)', color: 'var(--color-ink-soft)' }}>Aucune réservation</div>
          : filtered.map(b => {
            const service = services.find(s => s.id === b.serviceId);
            const endTime = service && b.time ? addMinutes(b.time, service.duration) : null;
            return (
              <div key={b.id} className="p-5 rounded-2xl flex flex-col md:flex-row gap-4 md:items-center" style={{ background: 'var(--color-cream)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <div className="font-serif text-xl" style={{ color: 'var(--color-ink)' }}>{b.clientName}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: STATUS_COLOR[b.status], color: 'var(--color-cream)' }}>{b.status}</div>
                  </div>
                  <div className="text-xs font-mono mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                    {service?.name} · {b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'} à {b.time}{endTime ? ` → ${endTime}` : ''}
                  </div>
                  <div className="text-xs space-y-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                    <div>{b.clientEmail}</div>
                    {b.clientPhone && <div>{b.clientPhone}</div>}
                    {b.note && <div className="mt-2 italic">« {b.note} »</div>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.status !== 'confirmé' && <button onClick={() => askAction(b, 'confirmé')} className="px-3 py-1.5 text-xs rounded-full font-mono uppercase tracking-widest" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>Confirmer</button>}
                  {b.status !== 'annulé' && <button onClick={() => askAction(b, 'annulé')} className="px-3 py-1.5 text-xs rounded-full font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>Annuler</button>}
                  <button onClick={() => askAction(b, 'supprimé')} className="p-1.5 rounded-full" style={{ color: 'var(--color-sage-dark)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
      </div>

      {pending && (
        <BookingResponseModal
          action={pending.action}
          booking={pending.booking}
          service={pending.service}
          content={content}
          appSettings={appSettings}
          onConfirm={() => { if (pending.action === 'supprimé') doRemove(pending.booking.id); else doStatus(pending.booking.id, pending.action); }}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
}
