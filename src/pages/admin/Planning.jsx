import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, RefreshCw, Lock, User, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DURATIONS = [30, 45, 60, 75, 90, 120];

// Map color name → light background for slot cards
function svcColorBg(colorCode) {
  const map = {
    sage:       '#f3dfe1',
    terracotta: '#fde8e9',
    ochre:      '#fef5e4',
    olive:      '#eef1e8',
  };
  if (!colorCode) return null;
  return map[colorCode] || colorCode;
}

// Map color name → text/dot color
function svcColorFg(colorCode) {
  const map = {
    sage:       '#7a3f46',
    terracotta: '#a31621',
    ochre:      '#7a5c2e',
    olive:      '#4a5c2e',
  };
  if (!colorCode) return null;
  return map[colorCode] || '#1a0f10';
}

function toLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0,0,0,0);
  return d;
}

const inp = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-line)',
  background: 'var(--color-cream-light)',
  fontSize: '0.875rem',
  outline: 'none',
};

// ── Slot modal ─────────────────────────────────────────────────────────────────

function SlotModal({ slot, services, onSave, onClose }) {
  const [form, setForm] = useState({
    date: slot?.date || '',
    time: slot?.time || '09:00',
    duration: slot?.duration || 60,
    service_id: slot?.service_id || '',
    available: slot?.available !== undefined ? slot.available : true,
    notes: slot?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        date: form.date,
        time: form.time,
        duration: Number(form.duration),
        service_id: form.service_id,
        available: form.available,
      };
      if (slot?.id) {
        await pb.collection('slots').update(slot.id, data);
      } else {
        await pb.collection('slots').create(data);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#fff' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
            {slot?.id ? 'Modifier le créneau' : 'Nouveau créneau'}
          </h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ ...inp, width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Heure</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={{ ...inp, width: '100%' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Durée (min)</label>
              <select value={form.duration} onChange={e => set('duration', e.target.value)} style={{ ...inp, width: '100%' }}>
                {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Disponible</label>
              <select value={form.available ? '1' : '0'} onChange={e => set('available', e.target.value === '1')} style={{ ...inp, width: '100%' }}>
                <option value="1">Oui</option>
                <option value="0">Non (bloqué)</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Service associé</label>
            <select value={form.service_id} onChange={e => set('service_id', e.target.value)} style={{ ...inp, width: '100%' }}>
              <option value="">— Tous services —</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-full"
              style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-full"
              style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Booking detail modal ───────────────────────────────────────────────────────

const BOOKING_STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmée' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Annulée' },
  done:      { bg: '#f0fdf4', color: '#166534', label: 'Terminée' },
};

function BookingDetailModal({ booking, services, onClose }) {
  const svc = services.find(s => s.id === booking.service_id);
  const sc = BOOKING_STATUS_COLORS[booking.status] || BOOKING_STATUS_COLORS.confirmed;

  const rows = [
    [<User size={13}/>, 'Client', `${booking.client_name}${booking.client_phone ? ` · ${booking.client_phone}` : ''}`],
    [<Mail size={13}/>, 'Email', booking.client_email],
    [<Clock size={13}/>, 'Durée', booking.duration ? `${booking.duration} min` : '—'],
  ].filter(r => r[2]);

  const price = svc?.sur_devis ? 'Sur devis' : svc?.price_label || (svc?.price ? `${svc.price} €` : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff' }}>
        <div className="px-6 py-4 flex items-start justify-between" style={{ background: 'var(--color-cream-light)', borderBottom: '1px solid var(--color-line)' }}>
          <div>
            <span className="px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {sc.label}
            </span>
            <h3 className="mt-2" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
              {booking.service_name || '—'}
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-sage-dark)', marginTop: '0.25rem' }}>
              {booking.date} {booking.time && `· ${booking.time}`}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {rows.map(([icon, label, value]) => (
              <div key={label} className="flex items-start gap-3">
                <span style={{ color: 'var(--color-sage-dark)', marginTop: '0.1rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-soft)' }}>{label}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {price && (
            <div className="rounded-xl px-4 py-3" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Tarif</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-ink)' }}>{price}</p>
            </div>
          )}

          {booking.note && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} style={{ color: 'var(--color-sage-dark)' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-soft)' }}>Message</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{booking.note}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-3 rounded-full"
            style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Planning() {
  const { showToast } = useAdmin();

  const [slots, setSlots]               = useState([]);
  const [bookings, setBookings]         = useState([]);
  const [services, setServices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [weekStart, setWeekStart]       = useState(getWeekStart(new Date()));
  const [modal, setModal]               = useState(null);
  const [bookingModal, setBookingModal] = useState(null);

  // Ajout ponctuel
  const [pDate, setPDate]         = useState('');
  const [pTime, setPTime]         = useState('09:00');
  const [pDur, setPDur]           = useState(60);
  const [pServiceId, setPServiceId] = useState('');

  // Générateur
  const [showGen, setShowGen]       = useState(false);
  const [genDate, setGenDate]       = useState(toLocalDate(getWeekStart(new Date())));
  const [genWeeks, setGenWeeks]     = useState(1);
  const [genDays, setGenDays]       = useState([0,1,2,3,4]);
  const [genStart, setGenStart]     = useState('09:00');
  const [genEnd, setGenEnd]         = useState('18:00');
  const [genDur, setGenDur]         = useState(60);
  const [genLunch, setGenLunch]     = useState(true);
  const [genLunchS, setGenLunchS]   = useState('12:00');
  const [genLunchE, setGenLunchE]   = useState('13:30');
  const [genServiceId, setGenServiceId] = useState('');
  const [generating, setGenerating] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const load = async () => {
    setLoading(true);
    const start = toLocalDate(weekDays[0]);
    const end   = toLocalDate(weekDays[6]);
    const [s, svc, bkgs] = await Promise.all([
      pb.collection('slots').getFullList({ filter: `date>="${start}" && date<="${end}"`, sort: 'date,time' }).catch(() => []),
      pb.collection('services').getFullList({ sort: 'sort_order' }).catch(() => []),
      pb.collection('bookings').getFullList({ filter: `date>="${start}" && date<="${end}" && status!="cancelled"`, sort: 'date,time' }).catch(() => []),
    ]);
    setSlots(s);
    setServices(svc);
    setBookings(bkgs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [weekStart.toISOString()]);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };
  const goToday  = () => setWeekStart(getWeekStart(new Date()));

  const serviceMap = useMemo(() =>
    Object.fromEntries(services.map(s => [s.id, s])),
    [services]
  );

  const addSlot = async () => {
    if (!pDate || !pTime) { showToast('Date et heure requises'); return; }
    try {
      await pb.collection('slots').create({
        date: pDate, time: pTime, duration: pDur, available: true,
        service_id: pServiceId,
      });
      showToast('Créneau ajouté');
      setPDate(''); setPTime('09:00'); setPServiceId('');
      load();
    } catch {
      showToast('Erreur lors de la création');
    }
  };

  const genPreview = useMemo(() => {
    if (!genDays.length || !genDate) return [];
    const timeToMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
    const minToTime = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
    const startMin = timeToMin(genStart);
    const endMin   = timeToMin(genEnd);
    const lunchS   = genLunch ? timeToMin(genLunchS) : Infinity;
    const lunchE   = genLunch ? timeToMin(genLunchE) : Infinity;

    const slotsPerDay = [];
    let t = startMin;
    while (t + genDur <= endMin) {
      if (genLunch && t < lunchE && t + genDur > lunchS) { t = lunchE; continue; }
      slotsPerDay.push(minToTime(t));
      t += genDur;
    }

    const days = [];
    const base = new Date(genDate + 'T00:00:00');
    for (let w = 0; w < genWeeks; w++) {
      genDays.forEach(dayIdx => {
        const d = new Date(base);
        d.setDate(base.getDate() + w * 7 + dayIdx);
        const dateStr = toLocalDate(d);
        if (slotsPerDay.length > 0) days.push({ date: d, dateStr, slots: slotsPerDay });
      });
    }
    days.sort((a,b) => a.dateStr.localeCompare(b.dateStr));
    return days;
  }, [genDate, genWeeks, genDays, genStart, genEnd, genDur, genLunch, genLunchS, genLunchE]);

  const genTotal = genPreview.reduce((s, d) => s + d.slots.length, 0);

  const runGenerator = async () => {
    if (!genTotal) { showToast('Aucun créneau à créer'); return; }
    setGenerating(true);
    let created = 0, skipped = 0;
    for (const day of genPreview) {
      for (const time of day.slots) {
        try {
          await pb.collection('slots').create({
            date: day.dateStr, time, duration: genDur, available: true,
            service_id: genServiceId,
          });
          created++;
        } catch { skipped++; }
      }
    }
    showToast(`${created} créneau${created > 1 ? 'x' : ''} créé${created > 1 ? 's' : ''}${skipped ? ` (${skipped} ignoré${skipped>1?'s':''})` : ''}`);
    setGenerating(false);
    setShowGen(false);
    load();
  };

  const deleteSlot = async (id) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    await pb.collection('slots').delete(id);
    showToast('Créneau supprimé');
    load();
  };

  const toggleAvailable = async (slot) => {
    await pb.collection('slots').update(slot.id, { available: !slot.available });
    load();
  };

  const today = toLocalDate(new Date());
  const weekLabel = `${weekDays[0].getDate()} – ${weekDays[6].getDate()} ${MONTHS_FR[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;

  const bookingMap = useMemo(() => {
    const map = {};
    bookings.forEach(b => { if (b.date && b.time) map[`${b.date}|${b.time?.slice(0,5)}`] = b; });
    return map;
  }, [bookings]);

  // Dot colors by booking status / slot availability
  const getStatusDot = (slot, booking) => {
    if (booking) {
      if (booking.status === 'confirmed') return '#1e40af';
      if (booking.status === 'pending')   return '#d97706';
      if (booking.status === 'done')      return '#166534';
    }
    if (!slot.available) return '#991b1b';
    return '#16a34a';
  };

  return (
    <div>
      {modal && (
        <SlotModal
          slot={modal}
          services={services}
          onSave={() => { setModal(null); load(); showToast('Créneau enregistré'); }}
          onClose={() => setModal(null)}
        />
      )}
      {bookingModal && (
        <BookingDetailModal
          booking={bookingModal}
          services={services}
          onClose={() => setBookingModal(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Planning</h1>
        <button
          onClick={() => setShowGen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
          <Plus size={14} /> Générer des créneaux
        </button>
      </div>

      {/* ── Ajout ponctuel ── */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.75rem' }}>Ajouter un créneau</p>
        <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Date</label>
            <input type="date" value={pDate} onChange={e => setPDate(e.target.value)} style={{ ...inp, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Heure</label>
            <input type="time" value={pTime} onChange={e => setPTime(e.target.value)} style={{ ...inp, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Durée</label>
            <select value={pDur} onChange={e => setPDur(Number(e.target.value))} style={{ ...inp, width: '100%' }}>
              {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Service</label>
            <select value={pServiceId} onChange={e => setPServiceId(e.target.value)} style={{ ...inp, width: '100%' }}>
              <option value="">Tous services</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={addSlot}
            className="flex items-center gap-2 px-5 py-2 rounded-full self-end"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {/* ── Modal générateur ── */}
      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#fff', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Générateur de créneaux</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}>Créez des plages horaires en quelques clics</p>
              </div>
              <button onClick={() => setShowGen(false)} style={{ color: 'var(--color-ink-soft)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><X size={20} /></button>
            </div>

            <div className="overflow-y-auto px-6 pb-6 space-y-5">
              {/* Service */}
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Service associé</label>
                <select value={genServiceId} onChange={e => setGenServiceId(e.target.value)} style={{ ...inp, width: '100%' }}>
                  <option value="">— Tous services (ouvert à tous) —</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Période */}
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Période de départ</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input type="date" value={genDate} onChange={e => setGenDate(e.target.value)} style={{ ...inp, flex: '0 0 auto' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>pendant</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGenWeeks(w => Math.max(1, w-1))} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--color-line)', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-ink)' }}>−</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-ink)', minWidth: '6rem', textAlign: 'center' }}>{genWeeks} semaine{genWeeks > 1 ? 's' : ''}</span>
                    <button onClick={() => setGenWeeks(w => Math.min(52, w+1))} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--color-line)', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-ink)' }}>+</button>
                  </div>
                </div>
              </div>

              {/* Jours */}
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Jours actifs</label>
                <div className="flex gap-2 flex-wrap">
                  {['LU','MA','ME','JE','VE','SA','DI'].map((d, i) => (
                    <button key={i}
                      onClick={() => setGenDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort())}
                      className="px-3 py-2 rounded-full"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', background: genDays.includes(i) ? 'var(--color-ink)' : 'var(--color-sage-light)', color: genDays.includes(i) ? '#fff' : 'var(--color-ink-soft)' }}>{d}</button>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Horaires</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Début</p>
                    <input type="time" value={genStart} onChange={e => setGenStart(e.target.value)} style={{ ...inp, width: '100%' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Fin</p>
                    <input type="time" value={genEnd} onChange={e => setGenEnd(e.target.value)} style={{ ...inp, width: '100%' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Durée / créneau</p>
                    <select value={genDur} onChange={e => setGenDur(Number(e.target.value))} style={{ ...inp, width: '100%' }}>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>1h</option>
                      <option value={90}>1h30</option>
                      <option value={120}>2h</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pause déjeuner */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => setGenLunch(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <div style={{ width: '2.5rem', height: '1.5rem', borderRadius: '1rem', position: 'relative', transition: 'background 0.2s', background: genLunch ? 'var(--color-sage-dark)' : 'var(--color-line)' }}>
                      <div style={{ position: 'absolute', top: '0.2rem', left: genLunch ? '1.1rem' : '0.2rem', width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                    </div>
                  </button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)' }}>Pause déjeuner</span>
                </div>
                {genLunch && (
                  <div className="flex items-center gap-3">
                    <input type="time" value={genLunchS} onChange={e => setGenLunchS(e.target.value)} style={{ ...inp }} />
                    <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>→</span>
                    <input type="time" value={genLunchE} onChange={e => setGenLunchE(e.target.value)} style={{ ...inp }} />
                  </div>
                )}
              </div>

              {/* Prévisualisation */}
              {genTotal > 0 && (
                <div className="rounded-xl p-4" style={{ background: 'var(--color-sage-light)' }}>
                  {genServiceId && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-sage-dark)', marginBottom: '0.5rem' }}>
                      Service : <strong>{services.find(s => s.id === genServiceId)?.name}</strong>
                    </p>
                  )}
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-sage-dark)', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <strong>{genTotal} créneau{genTotal > 1 ? 'x' : ''}</strong> à créer
                  </p>
                  <div className="space-y-1.5">
                    {genPreview.map(({ date, slots: s }) => (
                      <div key={toLocalDate(date)} className="flex items-baseline gap-3 flex-wrap">
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.875rem', color: 'var(--color-ink)', minWidth: '9rem' }}>
                          {DAYS_FR[(date.getDay()+6)%7]} {date.getDate()} {MONTHS_FR[date.getMonth()].slice(0,3)}.
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {s.map(t => (
                            <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', background: 'rgba(163,22,33,0.12)', color: 'var(--color-sage-dark)', padding: '0.125rem 0.375rem', borderRadius: '0.375rem' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {genDays.length > 0 && genTotal === 0 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)' }}>
                  Aucun créneau ne peut être généré avec ces paramètres
                </p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--color-line)' }}>
              <button onClick={() => setShowGen(false)} className="flex-1 py-3 rounded-full" style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'none', cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={runGenerator} disabled={generating || !genTotal}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-full"
                style={{ background: 'var(--color-ink)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: generating || !genTotal ? 'not-allowed' : 'pointer', opacity: generating || !genTotal ? 0.5 : 1 }}>
                {generating ? <RefreshCw size={14} className="animate-spin" /> : '✓'}
                {generating ? 'Génération…' : `Créer ${genTotal} créneau${genTotal > 1 ? 'x' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav semaine ── */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 rounded-full" style={{ border: '1px solid var(--color-line)' }}><ChevronLeft size={18} /></button>
          <button onClick={goToday} className="px-4 py-1.5 rounded-full" style={{ border: '1px solid var(--color-line)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-ink-soft)' }}>Aujourd'hui</button>
          <button onClick={nextWeek} className="p-2 rounded-full" style={{ border: '1px solid var(--color-line)' }}><ChevronRight size={18} /></button>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-ink)' }}>{weekLabel}</span>
      </div>

      {/* Service legend */}
      {services.length > 0 && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', alignSelf: 'center' }}>Services :</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-sage-light)', border: '1px solid var(--color-line)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>Tous</span>
          </div>
          {services.map(s => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: svcColorBg(s.color) || 'var(--color-sage-light)', border: `1px solid ${svcColorFg(s.color) || 'var(--color-ink-soft)'}40` }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>{s.name}</span>
            </div>
          ))}
          <div style={{ width: '1px', background: 'var(--color-line)', margin: '0 0.25rem' }} />
          {[
            { color: '#16a34a', label: 'Libre' },
            { color: '#d97706', label: 'En attente' },
            { color: '#1e40af', label: 'Confirmé' },
            { color: '#991b1b', label: 'Bloqué' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Grille 7 jours ── */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const dateStr = toLocalDate(day);
          const daySlots = slots.filter(s => s.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
          const isToday = dateStr === today;
          return (
            <div key={i}>
              <div className="text-center mb-2">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: isToday ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)' }}>
                  {DAYS_FR[i]}
                </p>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1" style={{ background: isToday ? 'var(--color-sage-dark)' : 'transparent', color: isToday ? '#fff' : 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-1 min-h-[100px]">
                {daySlots.map(slot => {
                  const svc = slot.service_id ? serviceMap[slot.service_id] : null;
                  const booking = bookingMap[`${slot.date}|${slot.time?.slice(0,5)}`];
                  const hasBooking = !!booking;
                  const cardBg = svc ? (svcColorBg(svc.color) || 'var(--color-sage-light)') : 'var(--color-sage-light)';
                  const cardFg = svc ? (svcColorFg(svc.color) || 'var(--color-ink)') : 'var(--color-ink)';
                  const dotColor = getStatusDot(slot, booking);

                  return (
                    <div
                      key={slot.id}
                      className="rounded-lg p-2 cursor-pointer group relative"
                      style={{ background: cardBg, opacity: !slot.available && !hasBooking ? 0.55 : 1 }}
                      onClick={() => hasBooking ? setBookingModal(booking) : setModal(slot)}
                    >
                      {/* Status dot */}
                      <div style={{
                        position: 'absolute', top: '0.3rem', right: '0.3rem',
                        width: '0.45rem', height: '0.45rem', borderRadius: '50%',
                        background: dotColor, flexShrink: 0,
                      }} />

                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: cardFg, fontWeight: 600, paddingRight: '0.5rem' }}>
                        {slot.time?.slice(0,5)}
                      </p>
                      {hasBooking ? (
                        <>
                          <p style={{ fontSize: '0.6rem', color: cardFg, fontWeight: 500, lineHeight: 1.3, marginTop: '0.1rem' }}>
                            {booking.client_name}
                          </p>
                          <p style={{ fontSize: '0.55rem', color: cardFg, opacity: 0.75 }}>
                            {booking.service_name}
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '0.6rem', color: cardFg, opacity: 0.8 }}>
                            {slot.duration}min
                          </p>
                          {svc && (
                            <p style={{ fontSize: '0.55rem', color: cardFg, opacity: 0.65, marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {svc.name}
                            </p>
                          )}
                        </>
                      )}

                      <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!hasBooking && (
                          <button title={slot.available ? 'Bloquer' : 'Libérer'} onClick={e => { e.stopPropagation(); toggleAvailable(slot); }} style={{ color: cardFg, padding: '1px', opacity: 0.7 }}>
                            <Lock size={9} />
                          </button>
                        )}
                        <button title="Supprimer" onClick={e => { e.stopPropagation(); deleteSlot(slot.id); }} style={{ color: '#ef4444', padding: '1px' }}>
                          <Trash2 size={9} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => setModal({ date: dateStr })}
                  className="w-full rounded-lg py-1 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ border: '1px dashed var(--color-line)', color: 'var(--color-ink-soft)', fontSize: '1rem', lineHeight: 1 }}>
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
