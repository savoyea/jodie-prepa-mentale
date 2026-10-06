import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, Calendar, Settings2,
  BookOpen, MessageSquare, PenSquare, Lock, Eye, X, Menu, LogOut,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { Toast } from '../../components/Toast.jsx';
import { pb } from '../../lib/pocketbase.js';

const NAV_ITEMS = [
  { to: '/admin',              label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { to: '/admin/clients',      label: 'Clients',         icon: Users },
  { to: '/admin/pages',        label: 'Pages',           icon: FileText },
  { to: '/admin/planning',     label: 'Planning',        icon: Calendar },
  { to: '/admin/services',     label: 'Services',        icon: Settings2 },
  { to: '/admin/reservations', label: 'Réservations',    icon: BookOpen },
  { to: '/admin/messages',     label: 'Messages',        icon: MessageSquare },
  { to: '/admin/contenu',      label: 'Contenu du site', icon: PenSquare },
  { to: '/admin/parametres',   label: 'Paramètres',      icon: Lock },
];

function Badge({ count, active }) {
  if (!count) return null;
  return (
    <span
      className="ml-auto flex items-center justify-center rounded-full"
      style={{
        background: active ? 'rgba(255,255,255,0.9)' : 'var(--color-sage-dark)',
        color: active ? 'var(--color-sage-dark)' : '#fff',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        fontWeight: 700,
        minWidth: '1.1rem',
        height: '1.1rem',
        padding: '0 0.25rem',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function Sidebar({ open, onClose, badges = {} }) {
  const location = useLocation();
  const { logout } = useAdmin();

  const isActive = (item) => item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to);

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, background: 'var(--color-cream)', borderRight: '1px solid var(--color-line)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-sage-dark)' }}
            >
              <Settings2 size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)' }}>Admin · Jodie Peltier</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)' }}>Tableau de bord</div>
            </div>
          </div>
          <button className="md:hidden p-1" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{
                  background: active ? 'var(--color-ink)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-ink-soft)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span className="flex-1">{label}</span>
                <Badge count={badges[to]} active={active} />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--color-line)' }}>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}
          >
            <Eye size={18} /> Voir le site
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full"
            style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const { auth, toast } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({});

  const fetchBadges = useCallback(async () => {
    if (!pb.authStore.isValid) return;
    const [pendingRes, messagesRes] = await Promise.all([
      pb.collection('bookings').getList(1, 1, { filter: 'status="pending"' }).catch(() => ({ totalItems: 0 })),
      pb.collection('contacts').getList(1, 1, { filter: 'read=false' }).catch(() => ({ totalItems: 0 })),
    ]);
    setBadges({
      '/admin/reservations': pendingRes.totalItems || 0,
      '/admin/messages':     messagesRes.totalItems || 0,
    });
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (!auth) return;
    fetchBadges();
    const id = setInterval(fetchBadges, 60_000);
    return () => clearInterval(id);
  }, [auth, fetchBadges, location.pathname]);

  if (!auth) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} badges={badges} />

      <div className="md:pl-[240px]">
        {/* Mobile header */}
        <div
          className="md:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
          style={{ background: 'rgba(252,247,248,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-line)' }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--color-ink)' }}>
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)' }}>Admin</span>
        </div>

        <main className="min-h-screen p-6">
          <Outlet />
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
