import React, { useState, useEffect } from 'react';
import { LogOut, Lock, Home, Check } from 'lucide-react';
import { storage, DEFAULT_CONTENT, DEFAULT_SERVICES, DEFAULT_BOOKINGS, generateDefaultSlots } from './data.js';
import PublicSite from './components/PublicSite.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminPanel from './components/AdminPanel.jsx';

export default function App() {
  const [view, setView] = useState('public');
  const [page, setPage] = useState('home');
  const [adminPage, setAdminPage] = useState('planning');
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState(DEFAULT_BOOKINGS);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState(null);

  const SLOTS_VERSION = 2;
  useEffect(() => {
    (async () => {
      const c = await storage.get('content', DEFAULT_CONTENT);
      const s = await storage.get('services', DEFAULT_SERVICES);
      const b = await storage.get('bookings', DEFAULT_BOOKINGS);
      const slVersion = await storage.get('slotsVersion', 1);
      let sl = slVersion >= SLOTS_VERSION ? await storage.get('slots', null) : null;
      if (!sl || !sl.length) {
        sl = generateDefaultSlots();
        storage.set('slots', sl);
      }
      if (slVersion < SLOTS_VERSION) storage.set('slotsVersion', SLOTS_VERSION);
      setContent(c);
      setServices(s);
      setSlots(sl);
      setBookings(b);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => {
    if (!content.favicon) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = content.favicon;
  }, [content.favicon]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updateContent = (c) => { setContent(c); storage.set('content', c); };
  const updateServices = (s) => { setServices(s); storage.set('services', s); };
  const updateSlots = (s) => { setSlots(s); storage.set('slots', s); };
  const updateBookings = (b) => { setBookings(b); storage.set('bookings', b); };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-sm tracking-widest uppercase" style={{ color: 'var(--sage-dark)' }}>chargement…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --cream: #fcf7f8;
          --cream-light: #fff9fa;
          --sage: #e6bfc2;
          --sage-light: #f3dfe1;
          --sage-dark: #a31621;
          --terracotta: #e6bfc2;
          --terracotta-dark: #a31621;
          --ochre: #c8989c;
          --olive: #7d1019;
          --ink: #1a0f10;
          --ink-soft: #5a3a3e;
          --line: #ead6d8;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .font-display { font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }
        .font-body { font-family: 'Inter', -apple-system, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .grain { position: relative; }
        .grain::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
          mix-blend-mode: multiply;
        }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .stagger > * { animation: fadeIn 0.5s ease-out both; }
        .stagger > *:nth-child(1) { animation-delay: 0.05s; }
        .stagger > *:nth-child(2) { animation-delay: 0.15s; }
        .stagger > *:nth-child(3) { animation-delay: 0.25s; }
        .stagger > *:nth-child(4) { animation-delay: 0.35s; }
        .stagger > *:nth-child(5) { animation-delay: 0.45s; }
        .leaf-divider {
          width: 60px; height: 1px; background: var(--sage-dark); position: relative; margin: 1.5rem auto;
        }
        .leaf-divider::before, .leaf-divider::after {
          content: ''; position: absolute; top: 50%; width: 6px; height: 6px;
          background: var(--sage-dark); border-radius: 50%; transform: translateY(-50%);
        }
        .leaf-divider::before { left: -10px; }
        .leaf-divider::after { right: -10px; }
      `}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />

      <div className="font-body" style={{ background: 'var(--cream)', color: 'var(--ink)', minHeight: '100vh' }}>
        {/* Top switcher */}
        <div className="fixed top-3 right-3 z-50 flex gap-2">
          {view === 'admin' && adminAuth && (
            <button
              onClick={() => { setAdminAuth(false); setView('public'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-mono rounded-full border transition-all hover:opacity-80"
              style={{ background: 'var(--cream-light)', borderColor: 'var(--line)', color: 'var(--ink-soft)' }}
            >
              <LogOut size={12} /> Quitter
            </button>
          )}
          <button
            onClick={() => setView(view === 'public' ? 'admin' : 'public')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-mono rounded-full transition-all hover:opacity-90"
            style={{ background: view === 'public' ? 'var(--ink)' : 'var(--terracotta-dark)', color: 'var(--cream)' }}
          >
            {view === 'public' ? <><Lock size={12} /> Admin</> : <><Home size={12} /> Site public</>}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm flex items-center gap-2 fade-in"
            style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
            <Check size={14} /> {toast}
          </div>
        )}

        {view === 'public' ? (
          <PublicSite
            page={page} setPage={setPage}
            content={content} services={services} slots={slots}
            bookings={bookings} updateBookings={updateBookings}
            updateSlots={updateSlots}
            menuOpen={menuOpen} setMenuOpen={setMenuOpen}
            showToast={showToast}
          />
        ) : adminAuth ? (
          <AdminPanel
            adminPage={adminPage} setAdminPage={setAdminPage}
            content={content} updateContent={updateContent}
            services={services} updateServices={updateServices}
            slots={slots} updateSlots={updateSlots}
            bookings={bookings} updateBookings={updateBookings}
            showToast={showToast}
          />
        ) : (
          <AdminLogin
            authInput={authInput} setAuthInput={setAuthInput}
            authError={authError} setAuthError={setAuthError}
            onSuccess={() => setAdminAuth(true)}
          />
        )}
      </div>
    </>
  );
}
