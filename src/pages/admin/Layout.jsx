import { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { BarChart2, Calendar, Settings, FileText, Users, Mail, Lock, ExternalLink, LogOut } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useSite } from '../../contexts/SiteContext.jsx';
import { Toast } from '../../components/ui/Toast.jsx';
import { loadBookings, loadSlots } from '../../lib/storage.js';

const NAV = [
  { to: '/admin',              end: true, icon: <BarChart2 size={16} />,  label: 'Dashboard' },
  { to: '/admin/planning',               icon: <Calendar size={16} />,    label: 'Planning' },
  { to: '/admin/services',               icon: <Settings size={16} />,    label: 'Services' },
  { to: '/admin/reservations',           icon: <Users size={16} />,       label: 'Réservations' },
  { to: '/admin/messages',               icon: <Mail size={16} />,        label: 'Messages' },
  { to: '/admin/contenu',                icon: <FileText size={16} />,    label: 'Contenu du site' },
  { to: '/admin/settings',               icon: <Lock size={16} />,        label: 'Paramètres' },
];

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl leading-none" style={{ color: 'var(--color-ink)' }}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-mono mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
    </div>
  );
}

export default function AdminLayout() {
  const { adminAuth, logout, toast } = useAdmin();
  const { services } = useSite();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ bookings: 0, slots: 0 });

  useEffect(() => {
    if (!adminAuth) return;
    Promise.all([loadBookings(), loadSlots()]).then(([b, s]) => {
      const today = new Date(); today.setHours(0,0,0,0);
      setStats({
        bookings: b.filter(x => x.status !== 'annulé').length,
        slots: s.filter(x => x.available && new Date(x.date + 'T12:00:00') >= today).length,
      });
    });
  }, [adminAuth]);

  if (!adminAuth) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream-light)' }}>
      {/* Top bar */}
      <div className="border-b" style={{ borderColor: 'var(--color-line)', background: 'var(--color-cream)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sage-dark)' }}>
              <Settings size={16} style={{ color: 'var(--color-cream)' }} />
            </div>
            <div>
              <div className="font-serif text-xl leading-none" style={{ color: 'var(--color-ink)' }}>Admin · Jodie Peltier</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-mono mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>Tableau de bord</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Stat label="Réservations" value={stats.bookings} />
            <Stat label="Créneaux libres" value={stats.slots} />
            <Stat label="Services" value={services.length} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[200px_1fr] gap-8">
        <aside>
          <nav className="space-y-0.5 sticky top-6">
            {NAV.map(({ to, end, icon, label }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                    isActive
                      ? 'text-cream'
                      : 'hover:opacity-80'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--color-ink)' : 'transparent',
                  color: isActive ? 'var(--color-cream)' : 'var(--color-ink-soft)',
                })}>
                {icon}{label}
              </NavLink>
            ))}
            <div className="pt-4 border-t mt-4 space-y-0.5" style={{ borderColor: 'var(--color-line)' }}>
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all hover:opacity-80"
                style={{ color: 'var(--color-ink-soft)' }}>
                <ExternalLink size={14} />Voir le site
              </a>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all hover:opacity-80"
                style={{ color: 'var(--color-sage-dark)' }}>
                <LogOut size={14} />Déconnexion
              </button>
            </div>
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
