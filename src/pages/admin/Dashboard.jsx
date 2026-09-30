import { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../../contexts/SiteContext.jsx';
import { loadBookings, loadContacts, loadSlots } from '../../lib/storage.js';
import { addMinutes } from '../../utils.js';

function KpiCard({ label, value, sub, color, icon, onClick }) {
  return (
    <button onClick={onClick}
      className="text-left p-5 rounded-2xl space-y-2 w-full transition-all hover:opacity-90"
      style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)', cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: color + '22' }}>
          {icon && <icon.type {...icon.props} size={15} style={{ color }} />}
        </div>
      </div>
      <div className="font-serif text-4xl" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{sub}</div>}
    </button>
  );
}

export default function Dashboard() {
  const { services } = useSite();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadBookings(), loadContacts(), loadSlots()]).then(([b, c, s]) => {
      setBookings(b); setContacts(c); setSlots(s); setLoading(false);
    });
  }, []);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'confirmé').length;
  const pending = bookings.filter(b => b.status === 'en attente').length;
  const convRate = total ? Math.round((confirmed / total) * 100) : 0;
  const unreadMsg = contacts.filter(c => !c.read).length;
  const freeSlots = slots.filter(s => s.available && new Date(s.date + 'T12:00:00') >= today).length;

  const upcoming = bookings
    .filter(b => b.status === 'confirmé' && b.date && new Date(b.date + 'T12:00:00') >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
    return { label: d.toLocaleDateString('fr-FR', { month: 'short' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
  });
  const byMonth = months.map(m => ({
    ...m,
    total: bookings.filter(b => b.date?.startsWith(m.key)).length,
    confirmed: bookings.filter(b => b.date?.startsWith(m.key) && b.status === 'confirmé').length,
  }));
  const maxMonth = Math.max(...byMonth.map(m => m.total), 1);

  const svcCount = services.map(s => ({
    ...s,
    count: bookings.filter(b => b.serviceId === s.id).length,
  })).sort((a, b) => b.count - a.count);
  const maxSvc = Math.max(...svcCount.map(s => s.count), 1);

  if (loading) return <div className="text-sm py-12 text-center" style={{ color: 'var(--color-ink-soft)' }}>Chargement…</div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="font-serif text-3xl mb-1" style={{ color: 'var(--color-ink)' }}>Dashboard</div>
        <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Réservations" value={total} sub={`${pending} en attente`} color="var(--color-ink)" icon={<Calendar />} onClick={() => navigate('/admin/reservations')} />
        <KpiCard label="Confirmées" value={confirmed} sub={`Taux ${convRate}%`} color="#16a34a" icon={<Check />} />
        <KpiCard label="Créneaux libres" value={freeSlots} sub="à venir" color="var(--color-sage-dark)" icon={<Clock />} onClick={() => navigate('/admin/planning')} />
        <KpiCard label="Messages" value={unreadMsg} sub={`${contacts.length} au total`} color={unreadMsg > 0 ? '#d97706' : 'var(--color-ink-soft)'} icon={<MessageSquare />} onClick={() => navigate('/admin/messages')} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="p-6 rounded-2xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
          <div className="font-serif text-xl mb-4" style={{ color: 'var(--color-ink)' }}>Réservations — 6 derniers mois</div>
          <div className="flex items-end gap-2 h-32">
            {byMonth.map(m => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: 100 }}>
                  <div className="w-full rounded-t-sm" style={{ height: `${(m.confirmed / maxMonth) * 100}%`, background: 'var(--color-sage-dark)', minHeight: m.confirmed ? 4 : 0 }} />
                  <div className="w-full rounded-t-sm" style={{ height: `${((m.total - m.confirmed) / maxMonth) * 100}%`, background: 'var(--color-line)', minHeight: (m.total - m.confirmed) ? 4 : 0 }} />
                </div>
                <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--color-ink-soft)' }}>{m.label}</div>
                <div className="text-xs font-mono font-medium">{m.total}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-ink-soft)' }}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--color-sage-dark)' }} /> Confirmé</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--color-line)' }} /> Autre</span>
          </div>
        </div>

        {/* Services populaires */}
        <div className="p-6 rounded-2xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
          <div className="font-serif text-xl mb-4" style={{ color: 'var(--color-ink)' }}>Services les plus demandés</div>
          <div className="space-y-3">
            {svcCount.map(s => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium truncate" style={{ color: 'var(--color-ink)' }}>{s.name}</span>
                  <span className="font-mono ml-2 flex-shrink-0" style={{ color: 'var(--color-ink-soft)' }}>{s.count} rés.</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / maxSvc) * 100}%`, background: 'var(--color-sage-dark)' }} />
                </div>
              </div>
            ))}
            {svcCount.every(s => s.count === 0) && (
              <div className="text-sm text-center py-4" style={{ color: 'var(--color-ink-soft)' }}>Aucune réservation</div>
            )}
          </div>
        </div>
      </div>

      {/* Prochains RDV */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-serif text-xl" style={{ color: 'var(--color-ink)' }}>Prochains rendez-vous confirmés</div>
          <button onClick={() => navigate('/admin/planning')} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--color-ink-soft)' }}>Voir planning →</button>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-sm text-center py-6" style={{ color: 'var(--color-ink-soft)' }}>Aucun rendez-vous à venir</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(b => {
              const svc = services.find(s => s.id === b.serviceId);
              const dateStr = b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
              const endTime = svc && b.time ? addMinutes(b.time, svc.duration) : null;
              return (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
                  <div className="text-center flex-shrink-0 w-20">
                    <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-ink-soft)' }}>{dateStr}</div>
                    <div className="font-mono text-sm font-medium">{b.time}{endTime ? ` → ${endTime}` : ''}</div>
                  </div>
                  <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--color-line)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{b.clientName}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-ink-soft)' }}>{svc?.name || '—'}</div>
                  </div>
                  {b.clientEmail && (
                    <a href={`mailto:${b.clientEmail}`} className="text-xs font-mono" style={{ color: 'var(--color-sage-dark)' }}>{b.clientEmail}</a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
