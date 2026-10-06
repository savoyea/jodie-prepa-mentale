import { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import {
  Check, X, Trash2, Mail, ExternalLink, ChevronDown, ChevronUp,
  Calendar, ChevronLeft, ChevronRight, AlertTriangle, Plus, User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { pb } from '../../lib/pocketbase.js';
import { sendEmail } from '../../lib/email.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const STATUS_CFG = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmée' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Annulée' },
  done:      { bg: '#f0fdf4', color: '#166534', label: 'Terminée' },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className="px-2 py-1 rounded-full" style={{ background: c.bg, color: c.color, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

function fmtDate(date, time) {
  if (!date) return '—';
  try {
    const d = new Date(date + 'T00:00:00');
    const day = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return time ? `${day} à ${time}` : day;
  } catch { return date; }
}

function toYMD(d) {
  return d.toISOString().slice(0, 10);
}

function getWeekDays(offset = 0) {
  const now = new Date();
  const dow = now.getDay();
  const mondayDiff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayDiff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  return { start: toYMD(days[0]), end: toYMD(days[6]), days };
}

// ─── Email modal ──────────────────────────────────────────────────────────────

function EmailModal({ modal, onSend, onSkip, onClose }) {
  const [subject, setSubject] = useState(modal.subject);
  const [body, setBody] = useState(modal.body);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'var(--color-sage-dark)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: '#fff' }}>
            Répondre à {modal.booking.client_name}
          </h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
            À : <span style={{ color: 'var(--color-sage-dark)', fontWeight: 600 }}>{modal.booking.client_email}</span>
          </p>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', display: 'block', marginBottom: '0.375rem' }}>
              Sujet
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{ border: '1px solid var(--color-line)', fontSize: '0.875rem', color: 'var(--color-ink)' }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', display: 'block', marginBottom: '0.375rem' }}>
              Message
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={7}
              className="w-full px-3 py-2 rounded-lg border outline-none resize-y"
              style={{ border: '1px solid var(--color-line)', fontSize: '0.875rem', color: 'var(--color-ink)', lineHeight: 1.6 }}
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={() => onSend(subject, body)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            <Mail size={14} /> Envoyer + {modal.actionLabel}
          </button>
          <button
            onClick={onSkip}
            className="px-5 py-3 rounded-full"
            style={{ background: '#fff', color: 'var(--color-ink)', border: '1px solid var(--color-line)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            {modal.actionLabel} sans message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Conflict modal ───────────────────────────────────────────────────────────

function ConflictModal({ booking, conflictWith, onReschedule, onCancelBooking, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} style={{ color: '#92400e' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 400, color: '#92400e' }}>
              Conflit de créneau
            </h2>
          </div>
          <button onClick={onClose} style={{ color: '#92400e' }}><X size={18} /></button>
        </div>
        <div className="p-6">
          <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)', lineHeight: 1.6 }}>
            Le créneau du <strong>{fmtDate(booking.date, booking.time?.slice(0, 5))}</strong> est déjà confirmé pour{' '}
            <strong>{conflictWith.client_name}</strong>.
          </p>
          <p className="mt-3" style={{ fontSize: '0.875rem', color: 'var(--color-ink-soft)' }}>
            Que souhaitez-vous faire pour la demande de <strong>{booking.client_name}</strong> ?
          </p>
        </div>
        <div className="flex flex-col gap-3 px-6 pb-6">
          <button
            onClick={onReschedule}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            <Calendar size={14} /> Choisir un autre créneau
          </button>
          <button
            onClick={onCancelBooking}
            className="px-5 py-3 rounded-full"
            style={{ background: '#fee2e2', color: '#991b1b', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none' }}
          >
            Annuler cette demande
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Slot picker modal ────────────────────────────────────────────────────────

function SlotPickerModal({ booking, allBookings, onSelect, onClose }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const { start, end, days } = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    pb.collection('slots').getFullList({
      filter: `date>="${start}" && date<="${end}" && available=true`,
      sort: 'date,time',
    }).then(list => setSlots(list)).catch(() => setSlots([])).finally(() => setLoading(false));
  }, [start, end]);

  // confirmed bookings (excluding the booking being rescheduled) → block those times
  const confirmedByDate = useMemo(() => {
    const map = {};
    allBookings.forEach(b => {
      if (b.id === booking.id) return;
      if (b.status !== 'confirmed') return;
      if (!b.date || !b.time) return;
      if (!map[b.date]) map[b.date] = new Set();
      map[b.date].add(b.time.slice(0, 5));
    });
    return map;
  }, [allBookings, booking.id]);

  const slotsByDate = useMemo(() => {
    const map = {};
    slots.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [slots]);

  const weekLabel = (() => {
    const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    return `${fmt(days[0])} – ${fmt(days[6])} ${days[0].getFullYear()}`;
  })();

  const hasAnySlots = slots.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.6)' }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background: '#fff', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: 'var(--color-sage-dark)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: '#fff' }}>
              Choisir un créneau
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.125rem' }}>
              pour {booking.client_name} — {booking.service_name}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }}><X size={18} /></button>
        </div>

        {/* Week nav */}
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="flex items-center gap-1 px-3 py-1 rounded-full transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-soft)', background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}
          >
            <ChevronLeft size={12} /> Précédente
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ink)', fontWeight: 600 }}>
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="flex items-center gap-1 px-3 py-1 rounded-full transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-soft)', background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}
          >
            Suivante <ChevronRight size={12} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-4 flex-grow" style={{ minHeight: 0 }}>
          {loading ? (
            <p className="text-center py-8" style={{ color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              Chargement…
            </p>
          ) : !hasAnySlots ? (
            <p className="text-center py-8" style={{ color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              Aucun créneau disponible cette semaine
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {days.map(day => {
                const dateStr = toYMD(day);
                const daySlots = slotsByDate[dateStr] || [];
                const blockedTimes = confirmedByDate[dateStr] || new Set();
                const dayLabel = day.toLocaleDateString('fr-FR', { weekday: 'short' });
                const dayNum = day.getDate();
                return (
                  <div key={dateStr}>
                    {/* Day header */}
                    <div className="text-center mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-line)' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)' }}>
                        {dayLabel}
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                        {dayNum}
                      </p>
                    </div>
                    {/* Slots */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {daySlots.map(s => {
                        const time = s.time.slice(0, 5);
                        const isBlocked = blockedTimes.has(time);
                        const isSel = selected?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            disabled={isBlocked}
                            onClick={() => setSelected(isSel ? null : s)}
                            className="w-full py-1.5 rounded-lg text-center transition-colors"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              fontWeight: isSel ? 700 : 400,
                              background: isSel
                                ? 'var(--color-sage-dark)'
                                : isBlocked
                                  ? '#fee2e2'
                                  : 'var(--color-sage-light)',
                              color: isSel
                                ? '#fff'
                                : isBlocked
                                  ? '#991b1b'
                                  : 'var(--color-ink)',
                              cursor: isBlocked ? 'not-allowed' : 'pointer',
                              opacity: isBlocked ? 0.6 : 1,
                              border: isSel ? '2px solid var(--color-sage-dark)' : '2px solid transparent',
                            }}
                          >
                            {time}
                            {s.duration ? (
                              <span style={{ display: 'block', fontSize: '0.55rem', opacity: 0.7 }}>{s.duration}min</span>
                            ) : null}
                          </button>
                        );
                      })}
                      {daySlots.length === 0 && (
                        <p className="text-center py-2" style={{ fontSize: '0.6rem', color: 'rgba(90,58,62,0.4)' }}>—</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend + footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--color-line)', background: 'var(--color-cream-light)' }}>
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)' }}>
              <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '0.25rem', background: 'var(--color-sage-light)' }} />
              Disponible
            </span>
            <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)' }}>
              <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '0.25rem', background: '#fee2e2' }} />
              Déjà confirmé
            </span>
            <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)' }}>
              <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '0.25rem', background: 'var(--color-sage-dark)' }} />
              Sélectionné
            </span>
          </div>

          {selected ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Créneau sélectionné</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-sage-dark)', fontWeight: 600 }}>
                  {fmtDate(selected.date, selected.time?.slice(0, 5))}
                  {selected.duration ? ` — ${selected.duration} min` : ''}
                </p>
              </div>
              <button
                onClick={() => onSelect(selected)}
                className="flex items-center gap-2 px-5 py-3 rounded-full"
                style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}
              >
                <Check size={14} /> Valider ce créneau
              </button>
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
              Cliquez sur un créneau disponible pour le sélectionner
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New booking modal ────────────────────────────────────────────────────────

function NewBookingModal({ services, allBookings, onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1=infos client, 2=slot picker
  const [form, setForm] = useState({
    client_email: '', client_name: '', client_phone: '',
    service_id: '', note: '', status: 'confirmed',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [saving, setSaving] = useState(false);
  const emailTimeout = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmailChange = (val) => {
    set('client_email', val);
    clearTimeout(emailTimeout.current);
    if (val.length < 2) { setSuggestions([]); return; }
    emailTimeout.current = setTimeout(async () => {
      try {
        const res = await pb.collection('clients').getList(1, 6, {
          filter: `email~"${val}" || name~"${val}"`,
          fields: 'id,name,email,phone',
        });
        setSuggestions(res.items);
      } catch { setSuggestions([]); }
    }, 250);
  };

  const pickClient = (c) => {
    setForm(f => ({ ...f, client_email: c.email, client_name: c.name || f.client_name, client_phone: c.phone || f.client_phone }));
    setSuggestions([]);
  };

  const selectedService = services.find(s => s.id === form.service_id);
  const canSubmit = form.client_name.trim() && form.client_email.trim() && form.service_id;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await pb.collection('bookings').create({
        client_name:  form.client_name.trim(),
        client_email: form.client_email.trim(),
        client_phone: form.client_phone.trim(),
        service_id:   form.service_id,
        service_name: selectedService?.name || '',
        date:         selectedSlot?.date || '',
        time:         selectedSlot?.time || '',
        duration:     selectedSlot?.duration || selectedService?.duration || 0,
        note:         form.note,
        status:       form.status,
      });
      onCreated();
    } catch {
      // fail silently — toast handled by caller
    } finally {
      setSaving(false);
    }
  };

  const inpStyle = {
    width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--color-line)', background: 'var(--color-cream-light)',
    fontSize: '0.875rem', color: 'var(--color-ink)', outline: 'none',
  };
  const label = (text) => (
    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.3rem' }}>
      {text}
    </label>
  );

  if (step === 2) {
    return (
      <SlotPickerModal
        booking={{ id: '__new__', client_name: form.client_name, service_name: selectedService?.name || '' }}
        allBookings={allBookings}
        onSelect={(slot) => { setSelectedSlot(slot); setStep(1); }}
        onClose={() => setStep(1)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'var(--color-sage-dark)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: '#fff' }}>
            Nouvelle réservation
          </h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }}><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Email + autocomplete */}
          <div style={{ position: 'relative' }}>
            {label('Email client *')}
            <input
              type="email"
              value={form.client_email}
              onChange={e => handleEmailChange(e.target.value)}
              placeholder="email@exemple.com"
              style={inpStyle}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 rounded-xl shadow-lg overflow-hidden" style={{ top: '100%', marginTop: '0.25rem', background: '#fff', border: '1px solid var(--color-line)', zIndex: 10 }}>
                {suggestions.map(c => (
                  <button
                    key={c.id}
                    onClick={() => pickClient(c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3"
                    style={{ borderBottom: '1px solid var(--color-line)' }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sage-light)' }}>
                      <User size={12} style={{ color: 'var(--color-sage-dark)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', fontWeight: 500 }}>{c.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>{c.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              {label('Nom complet *')}
              <input value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Prénom Nom" style={inpStyle} />
            </div>
            <div>
              {label('Téléphone')}
              <input value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="06 12 34 56 78" style={inpStyle} />
            </div>
          </div>

          {/* Service */}
          <div>
            {label('Service *')}
            <select value={form.service_id} onChange={e => { set('service_id', e.target.value); setSelectedSlot(null); }} style={inpStyle}>
              <option value="">— Choisir un service —</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Créneau */}
          <div>
            {label('Créneau')}
            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2 rounded-lg" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)', minHeight: '2.25rem' }}>
                {selectedSlot ? (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-sage-dark)', fontWeight: 600 }}>
                    {fmtDate(selectedSlot.date, selectedSlot.time?.slice(0,5))}
                    {selectedSlot.duration ? ` — ${selectedSlot.duration} min` : ''}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', fontStyle: 'italic' }}>Aucun créneau sélectionné</p>
                )}
              </div>
              <button
                onClick={() => form.service_id ? setStep(2) : null}
                disabled={!form.service_id}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: form.service_id ? 'var(--color-sage-light)' : 'var(--color-line)', color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, cursor: form.service_id ? 'pointer' : 'not-allowed' }}
              >
                <Calendar size={13} /> {selectedSlot ? 'Changer' : 'Choisir'}
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            {label('Note interne')}
            <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={2} placeholder="Observations, contexte…" style={{ ...inpStyle, resize: 'vertical' }} />
          </div>

          {/* Statut */}
          <div>
            {label('Statut')}
            <select value={form.status} onChange={e => set('status', e.target.value)} style={inpStyle}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!canSubmit || saving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full"
            style={{ background: canSubmit ? 'var(--color-sage-dark)' : 'var(--color-line)', color: canSubmit ? '#fff' : 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            <Check size={14} /> {saving ? 'Enregistrement…' : 'Créer la réservation'}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-full" style={{ background: '#fff', color: 'var(--color-ink)', border: '1px solid var(--color-line)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Bookings() {
  const { showToast } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [conflictModal, setConflictModal] = useState(null);
  const [slotModal, setSlotModal] = useState(null);
  const [newBookingModal, setNewBookingModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [services, setServices] = useState([]);

  const load = async () => {
    setLoading(true);
    const [list, clients, svcs] = await Promise.all([
      pb.collection('bookings').getFullList({ sort: '-created' }).catch(() => []),
      pb.collection('clients').getFullList({ fields: 'id,email' }).catch(() => []),
      pb.collection('services').getFullList({ sort: 'sort_order' }).catch(() => []),
    ]);
    setBookings(list);
    setClientMap(Object.fromEntries(clients.map(c => [c.email?.toLowerCase(), c.id])));
    setServiceMap(Object.fromEntries(svcs.map(s => [s.id, s])));
    setServices(svcs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Count pending bookings per date+time slot
  const pendingConflicts = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      if (b.status !== 'pending' || !b.date || !b.time) return;
      const key = `${b.date}|${b.time.slice(0, 5)}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [bookings]);

  const getConfirmedConflict = (b) =>
    bookings.find(o =>
      o.id !== b.id &&
      o.status === 'confirmed' &&
      o.date === b.date &&
      o.time?.slice(0, 5) === b.time?.slice(0, 5)
    ) || null;

  const buildConfirmModal = (b) => ({
    booking: b,
    nextStatus: 'confirmed',
    actionLabel: 'Confirmer',
    subject: `Confirmation de votre séance — ${b.service_name}`,
    body: `Bonjour ${b.client_name},\n\nVotre séance de ${b.service_name} est confirmée pour le ${fmtDate(b.date, b.time?.slice(0, 5))}.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nÀ très bientôt,\nJodie`,
  });

  const buildCancelModal = (b) => ({
    booking: b,
    nextStatus: 'cancelled',
    actionLabel: 'Annuler',
    subject: `Annulation de votre séance — ${b.service_name}`,
    body: `Bonjour ${b.client_name},\n\nJe suis au regret de vous informer que votre séance de ${b.service_name} du ${fmtDate(b.date, b.time?.slice(0, 5))} a dû être annulée.\n\nN'hésitez pas à me recontacter pour fixer un nouveau rendez-vous.\n\nCordialement,\nJodie`,
  });

  const openConfirmModal = (b) => {
    const conflict = getConfirmedConflict(b);
    if (conflict) {
      setConflictModal({ booking: b, conflictWith: conflict });
    } else {
      setModal(buildConfirmModal(b));
    }
  };

  const openCancelModal = (b) => setModal(buildCancelModal(b));

  const applyStatus = async (nextStatus, emailSubject, emailBody) => {
    const b = modal.booking;
    if (emailSubject && emailBody) {
      await sendEmail({
        to: b.client_email,
        toName: b.client_name,
        subject: emailSubject,
        body: emailBody.replace(/\n/g, '<br>'),
      }).catch(() => {});
    }
    await pb.collection('bookings').update(b.id, { status: nextStatus });
    showToast('Statut mis à jour');
    setModal(null);
    load();
  };

  const setStatusDirect = async (id, status) => {
    await pb.collection('bookings').update(id, { status });
    showToast('Statut mis à jour');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    await pb.collection('bookings').delete(id);
    showToast('Réservation supprimée');
    load();
  };

  // Called when a new slot is picked in SlotPickerModal
  const handleSlotSelected = async (slot) => {
    const { booking, afterConfirm } = slotModal;
    await pb.collection('bookings').update(booking.id, {
      date: slot.date,
      time: slot.time,
      duration: slot.duration || booking.duration,
    });
    setSlotModal(null);
    showToast('Créneau modifié');
    if (afterConfirm) {
      // Re-open confirm email modal with updated booking data
      const updated = { ...booking, date: slot.date, time: slot.time, duration: slot.duration || booking.duration };
      setModal(buildConfirmModal(updated));
    }
    load();
  };

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter);
  const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
          Réservations
        </h1>
        <button
          onClick={() => setNewBookingModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full mt-2"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}
        >
          <Plus size={14} /> Nouvelle réservation
        </button>
      </div>
      <p className="mb-6" style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>
        Gérez les demandes de séance
      </p>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('all')}
          className="px-4 py-2 rounded-full"
          style={{ background: filter === 'all' ? 'var(--color-ink)' : '#fff', color: filter === 'all' ? '#fff' : 'var(--color-ink-soft)', border: '1px solid var(--color-line)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Toutes ({bookings.length})
        </button>
        {Object.entries(STATUS_CFG).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="px-4 py-2 rounded-full"
            style={{ background: filter === k ? v.bg : '#fff', color: filter === k ? v.color : 'var(--color-ink-soft)', border: `1px solid ${filter === k ? v.bg : 'var(--color-line)'}`, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {v.label} ({counts[k] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p style={{ color: 'var(--color-ink-soft)' }}>Aucune réservation</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-line)', background: 'var(--color-cream-light)' }}>
                  {['', 'Client', 'Service', 'Date & heure', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const isExpanded = expandedId === b.id;
                  const svc = serviceMap[b.service_id];
                  const hasBorder = !isExpanded && i < filtered.length - 1;
                  const slotKey = b.date && b.time ? `${b.date}|${b.time.slice(0, 5)}` : null;
                  const pendingCount = slotKey ? (pendingConflicts[slotKey] || 0) : 0;
                  return (
                    <Fragment key={b.id}>
                      <tr style={{ borderBottom: hasBorder ? '1px solid var(--color-line)' : 'none', background: isExpanded ? 'var(--color-cream-light)' : 'transparent' }}>
                        {/* Toggle expand */}
                        <td style={{ padding: '0.75rem 0.5rem 0.75rem 0.75rem', width: '2rem' }}>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : b.id)}
                            className="p-1 rounded-lg transition-colors"
                            style={{ color: 'var(--color-ink-soft)', background: isExpanded ? 'var(--color-line)' : 'transparent' }}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>

                        {/* Client */}
                        <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.875rem' }}>
                          <p style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{b.client_name}</p>
                          <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.8rem', marginTop: '0.125rem' }}>{b.client_email}</p>
                          {b.client_phone && (
                            <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.75rem' }}>{b.client_phone}</p>
                          )}
                          {clientMap[b.client_email?.toLowerCase()] && (
                            <Link
                              to="/admin/clients"
                              state={{ clientId: clientMap[b.client_email.toLowerCase()] }}
                              className="inline-flex items-center gap-1 mt-1"
                              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage-dark)', textDecoration: 'none' }}
                            >
                              <ExternalLink size={10} /> Voir la fiche
                            </Link>
                          )}
                        </td>

                        {/* Service */}
                        <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.875rem', color: 'var(--color-ink-soft)' }}>{b.service_name || '—'}</td>

                        {/* Date */}
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-ink)' }}>{b.date}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>{b.time}</p>
                          {pendingCount > 1 && (
                            <span
                              className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded"
                              style={{ background: '#fef3c7', color: '#92400e', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
                            >
                              <AlertTriangle size={8} /> {pendingCount} sur ce créneau
                            </span>
                          )}
                        </td>

                        {/* Statut */}
                        <td style={{ padding: '0.875rem 0.75rem' }}><StatusBadge status={b.status} /></td>

                        {/* Actions */}
                        <td style={{ padding: '0.875rem 0.75rem' }}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {b.status === 'pending' && (
                              <>
                                <button onClick={() => openConfirmModal(b)} title="Confirmer" className="p-1.5 rounded-lg" style={{ background: '#dbeafe', color: '#1e40af' }}>
                                  <Check size={14} />
                                </button>
                                <button onClick={() => openCancelModal(b)} title="Annuler" className="p-1.5 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                  <X size={14} />
                                </button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <>
                                <button onClick={() => setStatusDirect(b.id, 'done')} className="px-3 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#166534', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                  Terminée
                                </button>
                                <button onClick={() => openCancelModal(b)} title="Annuler" className="p-1.5 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                  <X size={14} />
                                </button>
                              </>
                            )}
                            {(b.status === 'done' || b.status === 'cancelled') && (
                              <select value={b.status} onChange={e => setStatusDirect(b.id, e.target.value)}
                                className="px-2 py-1 rounded-lg border outline-none"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink)', border: '1px solid var(--color-line)', background: '#fff' }}>
                                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                            )}
                            {/* Edit slot — available for pending and confirmed */}
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                              <button
                                onClick={() => setSlotModal({ booking: b, afterConfirm: false })}
                                title="Modifier le créneau"
                                className="p-1.5 rounded-lg"
                                style={{ background: 'var(--color-sage-light)', color: 'var(--color-ink)' }}
                              >
                                <Calendar size={14} />
                              </button>
                            )}
                            <button onClick={() => handleDelete(b.id)} style={{ color: '#ef4444', padding: '0.25rem' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-line)' : 'none' }}>
                          <td colSpan={6} style={{ padding: '0 0.75rem 1rem', background: 'var(--color-cream-light)' }}>
                            <div className="rounded-xl p-4 grid md:grid-cols-3 gap-4" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
                              <div>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Tarif</p>
                                {svc?.sur_devis
                                  ? <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', fontStyle: 'italic' }}>Sur devis</p>
                                  : svc?.price_label
                                    ? <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)' }}>{svc.price_label}</p>
                                    : svc?.price
                                      ? <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)' }}>{svc.price} €</p>
                                      : <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-soft)' }}>—</p>
                                }
                                {b.duration > 0 && (
                                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}>{b.duration} min</p>
                                )}
                              </div>
                              <div className="md:col-span-2">
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Message / Note</p>
                                {b.note
                                  ? <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{b.note}</p>
                                  : <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-soft)', fontStyle: 'italic' }}>Aucun message</p>
                                }
                              </div>
                              <div>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Demande reçue</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                                  {new Date(b.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Email modal */}
      {modal && (
        <EmailModal
          modal={modal}
          onSend={(subject, body) => applyStatus(modal.nextStatus, subject, body)}
          onSkip={() => applyStatus(modal.nextStatus, null, null)}
          onClose={() => setModal(null)}
        />
      )}

      {/* Conflict modal */}
      {conflictModal && (
        <ConflictModal
          booking={conflictModal.booking}
          conflictWith={conflictModal.conflictWith}
          onReschedule={() => {
            const b = conflictModal.booking;
            setConflictModal(null);
            setSlotModal({ booking: b, afterConfirm: true });
          }}
          onCancelBooking={() => {
            const b = conflictModal.booking;
            setConflictModal(null);
            openCancelModal(b);
          }}
          onClose={() => setConflictModal(null)}
        />
      )}

      {/* Slot picker modal */}
      {slotModal && (
        <SlotPickerModal
          booking={slotModal.booking}
          allBookings={bookings}
          onSelect={handleSlotSelected}
          onClose={() => setSlotModal(null)}
        />
      )}

      {/* New booking modal */}
      {newBookingModal && (
        <NewBookingModal
          services={services}
          allBookings={bookings}
          onClose={() => setNewBookingModal(false)}
          onCreated={() => {
            setNewBookingModal(false);
            showToast('Réservation créée');
            load();
          }}
        />
      )}
    </div>
  );
}
