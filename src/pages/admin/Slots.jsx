import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Lock, Trash2, X, Mail, RefreshCw } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { loadSlots, saveSlots, loadBookings, saveBookings, loadAppSettings } from '../../lib/storage.js';
import { addMinutes, SLOT_DURATIONS, toLocalDateStr } from '../../utils.js';
import { sendEmail, fillTemplate } from '../../lib/email.js';

const STATUS_COLORS = { 'confirmé': 'var(--color-sage-dark)', 'annulé': '#6b7280', 'en attente': 'var(--color-ochre)' };

// ── BookingDetailModal ────────────────────────────────────────────────────────
function BookingDetailModal({ booking, service, onClose, onConfirm, onCancel }) {
  if (!booking) return null;
  const endTime = service ? addMinutes(booking.time, service.duration) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,42,38,0.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--color-cream)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-serif text-3xl mb-1" style={{ color: 'var(--color-ink)' }}>{booking.clientName}</div>
            <div className="inline-flex text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: STATUS_COLORS[booking.status] || 'var(--color-line)', color: 'var(--color-cream)' }}>{booking.status}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-60" style={{ color: 'var(--color-ink-soft)' }}><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl mb-3" style={{ background: 'var(--color-cream-light)' }}>
          <div className="font-mono text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>
            {booking.time}{endTime ? ` → ${endTime}` : ''}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
            · {booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>

        {service && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-3" style={{ background: 'var(--color-cream-light)' }}>
            <div className="font-serif text-lg" style={{ color: 'var(--color-ink)' }}>{service.name}</div>
            <div className="text-xs font-mono" style={{ color: 'var(--color-ink-soft)' }}>{service.duration} min · {service.priceLabel}</div>
          </div>
        )}

        <div className="space-y-2 mb-4 text-sm" style={{ color: 'var(--color-ink)' }}>
          <div>{booking.clientEmail}</div>
          {booking.clientPhone && <div>{booking.clientPhone}</div>}
        </div>

        {booking.note && <div className="p-4 rounded-xl mb-5 text-sm italic" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)' }}>« {booking.note} »</div>}

        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          {booking.status !== 'confirmé' && <button onClick={() => { onConfirm(booking.id); onClose(); }} className="flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>Confirmer</button>}
          {booking.status !== 'annulé' && <button onClick={() => { onCancel(booking.id); onClose(); }} className="flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>Annuler</button>}
          <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)' }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ── NewBookingModal ───────────────────────────────────────────────────────────
function NewBookingModal({ slot, services, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '', serviceId: '', status: 'confirmé' });
  useEffect(() => { if (slot && services[0]) setForm(f => ({ ...f, serviceId: services[0].id })); }, [slot]);
  if (!slot) return null;
  const endTime = slot.duration ? addMinutes(slot.time, slot.duration) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,42,38,0.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--color-cream)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif text-2xl mb-1" style={{ color: 'var(--color-ink)' }}>Nouvelle réservation</h2>
            <div className="font-mono text-sm" style={{ color: 'var(--color-sage-dark)' }}>
              {new Date(slot.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {slot.time}{endTime ? ` → ${endTime}` : ''}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-60" style={{ color: 'var(--color-ink-soft)' }}><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Service</div>
            <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} className="w-full px-3 py-2 rounded-lg border outline-none" style={inp}>
              {services.filter(s => !s.surDevis).map(s => <option key={s.id} value={s.id}>{s.name} — {s.priceLabel}</option>)}
            </select>
          </div>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Prénom & Nom *" className="w-full px-3 py-2 rounded-lg border outline-none" style={inp} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 rounded-lg border outline-none" style={inp} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="w-full px-3 py-2 rounded-lg border outline-none" style={inp} />
          <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Note (optionnel)" rows={2} className="w-full px-3 py-2 rounded-lg border resize-none outline-none" style={inp} />
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Statut</div>
            <div className="flex gap-2">
              {['confirmé', 'en attente'].map(s => (
                <button key={s} onClick={() => setForm({ ...form, status: s })} className="flex-1 py-1.5 text-xs font-mono uppercase tracking-widest rounded-full border transition-all"
                  style={{ background: form.status === s ? 'var(--color-ink)' : 'transparent', color: form.status === s ? 'var(--color-cream)' : 'var(--color-ink-soft)', borderColor: form.status === s ? 'var(--color-ink)' : 'var(--color-line)' }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5 pt-4 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <button onClick={() => form.name && onSubmit({ id: 'b' + Date.now(), clientName: form.name, clientEmail: form.email, clientPhone: form.phone, serviceId: form.serviceId, date: slot.date, time: slot.time, status: form.status, note: form.note })}
            disabled={!form.name} className="flex-1 py-2 rounded-full text-sm font-mono uppercase tracking-widest disabled:opacity-40" style={{ background: 'var(--color-ink)', color: 'var(--color-cream)' }}>
            Enregistrer
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

// ── BookingResponseModal ──────────────────────────────────────────────────────
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
    } catch (e) { setErr("Erreur d'envoi : " + e.message); }
    finally { setSending(false); }
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
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#166534' }}>Envoi automatique</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Sujet</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={inp} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Message</div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={7} className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none" style={inp} />
          </div>
          {err && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{err}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={sendAndAct} disabled={sending} className="flex-1 px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: colors[action], color: 'var(--color-cream)' }}>
              <Mail size={12} />{sending ? 'Envoi…' : `Envoyer + ${labels[action]}`}
            </button>
            <button onClick={onConfirm} className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>
              {labels[action]} sans message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = { background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' };
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ── Main Planning ─────────────────────────────────────────────────────────────
export default function Slots() {
  const { services, content } = useSite();
  const { showToast } = useAdmin();
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [appSettings, setAppSettings] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDur, setNewDur] = useState(60);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [pending, setPending] = useState(null);
  // Récurrence
  const [showRecurring, setShowRecurring] = useState(false);
  const [recDays, setRecDays] = useState([]);
  const [recTime, setRecTime] = useState('09:00');
  const [recDur, setRecDur] = useState(60);
  const [recWeeks, setRecWeeks] = useState(4);

  useEffect(() => {
    Promise.all([loadSlots(), loadBookings(), loadAppSettings()]).then(([s, b, as]) => {
      setSlots(s); setBookings(b); setAppSettings(as);
    });
  }, []);

  const persist = (s, b = bookings) => { setSlots(s); saveSlots(s); if (b !== bookings) { setBookings(b); saveBookings(b); } };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const overlaps = (aS, aD, bS, bD) => aS < bS + bD && bS < aS + aD;

  const addSlot = () => {
    if (!newDate || !newTime) { showToast("Date et heure requises"); return; }
    const id = `${newDate}-${newTime}`;
    if (slots.find(s => s.id === id)) { showToast("Ce créneau existe déjà"); return; }
    const ns = toMin(newTime);
    const conflict = slots.find(s => s.date === newDate && s.id !== id && overlaps(ns, newDur, toMin(s.time), s.duration || 60));
    if (conflict) { showToast(`Conflit : créneau ${conflict.time}`); return; }
    persist([...slots, { id, date: newDate, time: newTime, duration: newDur, available: true }]);
    setNewDate(''); setNewTime('');
    showToast("Créneau ajouté");
  };

  const addRecurring = () => {
    if (!recDays.length || !recTime) { showToast("Sélectionnez au moins un jour"); return; }
    const added = [];
    for (let w = 0; w < recWeeks; w++) {
      recDays.forEach(dayIdx => {
        const d = new Date(today);
        d.setDate(today.getDate() - ((today.getDay() + 6) % 7) + dayIdx + w * 7);
        if (d < today) return;
        const dateStr = toLocalDateStr(d);
        const id = `${dateStr}-${recTime}`;
        if (!slots.find(s => s.id === id) && !added.find(s => s.id === id)) {
          added.push({ id, date: dateStr, time: recTime, duration: recDur, available: true });
        }
      });
    }
    if (!added.length) { showToast("Aucun nouveau créneau à ajouter"); return; }
    persist([...slots, ...added]);
    showToast(`${added.length} créneau${added.length > 1 ? 'x' : ''} ajouté${added.length > 1 ? 's' : ''}`);
    setShowRecurring(false); setRecDays([]);
  };

  const removeSlot = id => { persist(slots.filter(s => s.id !== id)); showToast("Créneau supprimé"); };
  const toggleSlot = id => { persist(slots.map(s => s.id === id ? { ...s, available: !s.available } : s)); };

  const askAction = (booking, action) => {
    setSelectedBooking(null);
    setPending({ booking, action, service: services.find(s => s.id === booking.serviceId) });
  };

  const doStatus = (id, status) => {
    const nb = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(nb); saveBookings(nb);
    showToast(`Statut : ${status}`);
    setPending(null);
  };

  const selectedService = selectedBooking ? services.find(s => s.id === selectedBooking.serviceId) : null;

  return (
    <div>
      <h1 className="font-serif text-4xl mb-2" style={{ color: 'var(--color-ink)' }}>Planning</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>Gérez vos créneaux. Cliquez sur une réservation pour voir les détails, sur un créneau libre pour réserver.</p>

      {/* Ajouter un créneau ponctuel */}
      <div className="p-5 rounded-2xl mb-4 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3" style={{ background: 'var(--color-cream)' }}>
        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="px-4 py-2 rounded-lg border outline-none" style={inp} />
        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="px-4 py-2 rounded-lg border outline-none" style={inp} />
        <select value={newDur} onChange={e => setNewDur(Number(e.target.value))} className="px-4 py-2 rounded-lg border outline-none" style={inp}>
          {SLOT_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <button onClick={addSlot} className="px-5 py-2 rounded-lg text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* Planning récurrent */}
      <div className="mb-6">
        <button onClick={() => setShowRecurring(v => !v)} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--color-ink-soft)' }}>
          <RefreshCw size={13} /> {showRecurring ? 'Masquer le planning récurrent' : 'Ajouter des créneaux récurrents'}
        </button>
        {showRecurring && (
          <div className="p-5 rounded-2xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--color-ink-soft)' }}>Jours de la semaine</div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {DAYS_FR.map((d, i) => (
                <button key={i} onClick={() => setRecDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-all"
                  style={{ background: recDays.includes(i) ? 'var(--color-ink)' : 'transparent', color: recDays.includes(i) ? 'var(--color-cream)' : 'var(--color-ink-soft)', borderColor: recDays.includes(i) ? 'var(--color-ink)' : 'var(--color-line)' }}>
                  {d}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Heure</div>
                <input type="time" value={recTime} onChange={e => setRecTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none" style={inp} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Durée</div>
                <select value={recDur} onChange={e => setRecDur(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border outline-none" style={inp}>
                  {SLOT_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>Semaines</div>
                <select value={recWeeks} onChange={e => setRecWeeks(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border outline-none" style={inp}>
                  {[2,4,6,8,12].map(n => <option key={n} value={n}>{n} semaines</option>)}
                </select>
              </div>
            </div>
            <button onClick={addRecurring} className="px-5 py-2 rounded-lg text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
              <RefreshCw size={14} /> Générer les créneaux
            </button>
          </div>
        )}
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="p-2 rounded-full border disabled:opacity-30" style={{ borderColor: 'var(--color-line)' }}><ChevronLeft size={14} /></button>
        <div className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--color-ink)' }}>
          {days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </div>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-full border" style={{ borderColor: 'var(--color-line)' }}><ChevronRight size={14} /></button>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const dateStr = toLocalDateStr(d);
          const isToday = dateStr === toLocalDateStr(today);
          const daySlots = slots.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div key={i} className="p-2 rounded-xl min-h-[200px]" style={{ background: isToday ? '#f8f0f1' : 'var(--color-cream)', border: isToday ? `1.5px solid var(--color-sage-dark)` : '1.5px solid transparent' }}>
              <div className="text-center mb-2 pb-2 border-b" style={{ borderColor: 'var(--color-line)' }}>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-ink-soft)' }}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div className="font-serif text-xl" style={{ color: isToday ? 'var(--color-sage-dark)' : 'var(--color-ink)' }}>{d.getDate()}</div>
              </div>
              <div className="space-y-1.5">
                {daySlots.length === 0
                  ? <div className="text-[10px] text-center py-2" style={{ color: 'var(--color-ink-soft)' }}>aucun</div>
                  : daySlots.map(s => {
                    const booking = bookings.find(b => b.date === s.date && b.time === s.time);
                    const svc = booking ? services.find(sv => sv.id === booking.serviceId) : null;
                    const endTime = svc ? addMinutes(s.time, svc.duration) : null;
                    if (booking) {
                      return (
                        <button key={s.id} onClick={() => setSelectedBooking(booking)}
                          className="w-full text-left rounded-lg px-2 py-1.5 hover:opacity-80 hover:shadow-md transition-all"
                          style={{ background: STATUS_COLORS[booking.status] || 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
                          <div className="font-mono text-[10px] font-semibold">{s.time}{endTime ? ` → ${endTime}` : ''}</div>
                          <div className="text-[10px] font-semibold truncate mt-0.5">{booking.clientName}</div>
                          {svc && <div className="text-[9px] opacity-75 truncate">{svc.name}</div>}
                        </button>
                      );
                    }
                    const slotEnd = s.duration ? addMinutes(s.time, s.duration) : null;
                    return (
                      <div key={s.id} className="group rounded-md text-xs overflow-hidden"
                        style={{ background: s.available ? 'rgba(168,181,160,0.25)' : 'var(--color-line)', color: 'var(--color-ink)', opacity: !s.available ? 0.6 : 1 }}>
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <span className="font-mono text-[11px] font-semibold">{s.time}{slotEnd ? ` → ${slotEnd}` : ''}{!s.available && <span className="text-[9px] opacity-60 ml-1">bloqué</span>}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleSlot(s.id)} title={s.available ? 'Bloquer' : 'Libérer'} className="p-0.5 rounded hover:opacity-70"><Lock size={9} /></button>
                            <button onClick={() => removeSlot(s.id)} title="Supprimer" className="p-0.5 rounded hover:opacity-70"><Trash2 size={9} /></button>
                          </div>
                        </div>
                        {s.available && (
                          <button onClick={() => setBookingSlot(s)} className="w-full text-center py-1 text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border-t"
                            style={{ borderColor: 'rgba(107,122,100,0.2)', color: 'var(--color-sage-dark)', background: 'rgba(168,181,160,0.2)' }}>
                            + Réserver
                          </button>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="mt-6 flex gap-4 text-xs font-mono flex-wrap" style={{ color: 'var(--color-ink-soft)' }}>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: 'rgba(168,181,160,0.4)' }} /> Libre</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: 'var(--color-sage-dark)' }} /> Confirmé</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: 'var(--color-ochre)' }} /> En attente</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: '#6b7280' }} /> Annulé</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: 'var(--color-line)' }} /> Bloqué</span>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        service={selectedService}
        onClose={() => setSelectedBooking(null)}
        onConfirm={id => askAction(bookings.find(b => b.id === id), 'confirmé')}
        onCancel={id => askAction(bookings.find(b => b.id === id), 'annulé')}
      />

      {pending && (
        <BookingResponseModal
          action={pending.action}
          booking={pending.booking}
          service={pending.service}
          content={content}
          appSettings={appSettings}
          onConfirm={() => doStatus(pending.booking.id, pending.action)}
          onClose={() => setPending(null)}
        />
      )}

      <NewBookingModal
        slot={bookingSlot}
        services={services}
        onClose={() => setBookingSlot(null)}
        onSubmit={booking => {
          const updSlots = slots.map(s => s.id === bookingSlot.id ? { ...s, available: false } : s);
          const svc = services.find(s => s.id === booking.serviceId);
          if (svc && bookingSlot.duration > svc.duration) {
            const newTime = addMinutes(bookingSlot.time, svc.duration);
            const newId = `${bookingSlot.date}-${newTime}`;
            if (!updSlots.find(s => s.id === newId)) {
              updSlots.push({ id: newId, date: bookingSlot.date, time: newTime, duration: bookingSlot.duration - svc.duration, available: true });
            }
          }
          const nb = [...bookings, booking];
          setBookings(nb); saveBookings(nb);
          persist(updSlots);
          setBookingSlot(null);
          showToast("Réservation créée");
        }}
      />
    </div>
  );
}
