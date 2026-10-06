import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';

const MONTHS_FR = ['JAN.','FÉV.','MAR.','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-4">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: accent ? '#f0fdf4' : 'var(--color-sage-light)' }}
        >
          <Icon size={16} style={{ color: accent ? '#166534' : 'var(--color-sage-dark)' }} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 400, color: accent ? '#166534' : 'var(--color-sage-dark)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)', marginTop: '0.5rem' }}>
        {sub}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, confirmed: 0, slots: 0, messages: 0 });
  const [chart, setChart] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    Promise.all([
      pb.collection('bookings').getList(1, 1, { filter: 'status="pending"' }).catch(() => ({ totalItems: 0 })),
      pb.collection('bookings').getList(1, 1, { filter: 'status="confirmed"' }).catch(() => ({ totalItems: 0 })),
      pb.collection('slots').getList(1, 1, { filter: `available=true && date>="${today}"` }).catch(() => ({ totalItems: 0 })),
      pb.collection('contacts').getList(1, 1, { filter: 'read=false' }).catch(() => ({ totalItems: 0 })),
      pb.collection('bookings').getFullList({ sort: '-created', filter: `created>="${getMonthsAgo(6)}"` }).catch(() => []),
      pb.collection('services').getFullList({ sort: 'sort_order' }).catch(() => []),
      pb.collection('bookings').getFullList({ sort: 'date', filter: `date>="${today}" && status="confirmed"`, expand: 'service_id' }).catch(() => []),
    ]).then(([pending, confirmed, slots, msgs, allBookings, services, upcomingBookings]) => {
      setStats({
        bookings: pending.totalItems,
        confirmed: confirmed.totalItems,
        slots: slots.totalItems,
        messages: msgs.totalItems,
      });

      // Chart 6 derniers mois
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { month: MONTHS_FR[d.getMonth()], year: d.getFullYear(), m: d.getMonth(), y: d.getFullYear(), count: 0 };
      });
      allBookings.forEach(b => {
        const d = new Date(b.created);
        const mi = months.findIndex(m => m.m === d.getMonth() && m.y === d.getFullYear());
        if (mi >= 0) months[mi].count++;
      });
      setChart(months);

      // Top services
      const svcMap = {};
      allBookings.forEach(b => { svcMap[b.service_name] = (svcMap[b.service_name] || 0) + 1; });
      setTopServices(services.map(s => ({ name: s.name, count: svcMap[s.name] || 0 })));

      setUpcoming(upcomingBookings.slice(0, 5));
    });
  }, []);

  const getMonthsAgo = (n) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const maxCount = Math.max(...chart.map(c => c.count), 1);
  const totalBookings = chart.reduce((s, c) => s + c.count, 0);
  const confirmRate = stats.confirmed > 0 && stats.bookings + stats.confirmed > 0
    ? Math.round((stats.confirmed / (stats.confirmed + stats.bookings)) * 100) : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Dashboard</h1>
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Réservations" value={stats.bookings}  sub={`${stats.bookings} en attente`}  icon={Calendar} />
        <StatCard label="Confirmées"   value={stats.confirmed} sub={`Taux ${confirmRate}%`}           icon={CheckCircle2} accent />
        <StatCard label="Créneaux libres" value={stats.slots}  sub="à venir"                          icon={Clock} />
        <StatCard label="Messages"     value={stats.messages}  sub={`${stats.messages} au total`}     icon={MessageSquare} />
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
        <h2 className="mb-6" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
          Réservations — 6 derniers mois
        </h2>
        <div className="flex items-end gap-4 h-24">
          {chart.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${(m.count / maxCount) * 80}px`,
                  minHeight: 4,
                  background: m.count > 0 ? 'var(--color-sage-dark)' : 'var(--color-line)',
                  transition: 'height 0.5s ease',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--color-ink-soft)' }}>
                {m.month}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink)' }}>
                {m.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
            Services les plus demandés
          </h2>
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-ink)' }}>{s.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)' }}>{s.count} rés.</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'var(--color-line)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: totalBookings > 0 ? `${(s.count / totalBookings) * 100}%` : '0%', background: 'var(--color-sage-dark)', transition: 'width 0.5s ease' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prochains RDV */}
        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
              Prochains rendez-vous confirmés
            </h2>
            <Link
              to="/admin/planning"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sage-dark)' }}
            >
              Voir planning →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucun rendez-vous à venir</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--color-cream-light)' }}>
                  <div className="flex-1">
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', fontWeight: 500 }}>{b.client_name}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)' }}>
                      {b.service_name} · {b.date} {b.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
