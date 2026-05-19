import React, { useState, useEffect } from 'react';
import { Calendar, Users, Settings, FileText, Home, Heart, Compass, User, Mail, Menu, X, Plus, Trash2, Edit2, Save, Check, Clock, Euro, Phone, MapPin, ChevronLeft, ChevronRight, LogOut, Lock } from 'lucide-react';

// ============================================================================
// DEFAULT DATA — used on first load, then overridden by persistent storage
// ============================================================================

const DEFAULT_CONTENT = {
  siteName: "Jodie Peltier",
  tagline: "Préparation mentale",
  heroTitle: "Deviens enfin\nvraiment toi",
  heroSubtitle: "Accompagnement en préparation mentale pour reconnecter à soi, gagner en confiance et avancer avec clarté.",
  heroQuote: "« Le mental ne se muscle pas dans l'urgence, il se cultive dans la patience. »",
  aboutShort: "Préparatrice mentale certifiée, j'accompagne sportifs, étudiants et particuliers à révéler leur plein potentiel.",
  aboutLong: "Passionnée par l'humain et son potentiel, j'ai choisi de me former à la préparation mentale après plusieurs années d'expérience auprès de personnes en quête de mieux-être et de performance. Mon approche est bienveillante, structurée et personnalisée. Chaque accompagnement est unique car chaque personne l'est aussi.",
  whatIsTitle: "La préparation mentale, qu'est-ce que c'est ?",
  whatIsText: "La préparation mentale est un accompagnement qui vise à développer les ressources mentales et émotionnelles d'une personne pour qu'elle puisse atteindre ses objectifs, surmonter ses blocages et s'épanouir. Elle s'appuie sur des techniques validées scientifiquement : visualisation, respiration, gestion du stress, fixation d'objectifs, dialogue interne, routines de performance.",
  forWhomTitle: "Pour qui ?",
  forWhomItems: [
    { title: "Sportifs", text: "Amateurs ou compétiteurs, pour gérer la pression, optimiser la performance et préparer les échéances importantes." },
    { title: "Étudiants", text: "Pour aborder examens et concours avec confiance, gérer le stress et structurer le travail." },
    { title: "Particuliers", text: "Pour traverser une période de changement, reprendre confiance, ou retrouver du sens et de l'élan." },
    { title: "Entreprises", text: "Interventions de groupe pour cohésion d'équipe, gestion du stress et bien-être au travail." }
  ],
  ethicsTitle: "Éthique et déontologie",
  ethicsText: "Mon accompagnement repose sur un cadre clair et respectueux. La préparation mentale n'est ni de la psychothérapie ni du coaching de vie : elle s'inscrit dans une démarche complémentaire et orientée vers l'objectif.",
  ethicsPrinciples: [
    { title: "Confidentialité", text: "Tout ce qui est partagé en séance reste strictement confidentiel. Aucune information n'est transmise sans accord explicite." },
    { title: "Bienveillance", text: "Un espace sans jugement, où chaque personne avance à son rythme et selon ses propres ressources." },
    { title: "Compétence", text: "Une formation continue et l'orientation vers un professionnel adapté quand la situation dépasse mon champ d'intervention." },
    { title: "Respect", text: "Respect de la personne, de ses choix, de ses valeurs et de son intégrité physique et morale." },
    { title: "Transparence", text: "Objectifs, méthodes, durée et tarifs sont clairement annoncés dès le premier échange." }
  ],
  contactPhone: "07 83 15 70 30",
  contactEmail: "jodie.prepa.mentale@gmail.com",
  contactLocation: "Pays de la Loire — en présentiel ou en visio",
};

const DEFAULT_SERVICES = [
  { id: 's1', name: "Appel découverte", duration: 30, price: 0, priceLabel: "Gratuit", description: "Un premier échange pour comprendre vos besoins, présenter ma méthode et voir si nous sommes alignés pour avancer ensemble.", color: "sage" },
  { id: 's2', name: "Séance individuelle", duration: 60, price: 55, priceLabel: "À partir de 55 €", description: "Accompagnement personnalisé en présentiel ou en visio. Objectifs précis, outils concrets, suivi sur mesure.", color: "terracotta" },
  { id: 's3', name: "Pack 5 séances", duration: 60, price: 250, priceLabel: "250 €", description: "Cinq séances individuelles à tarif préférentiel pour un accompagnement en profondeur sur un objectif structurant.", color: "ochre" },
  { id: 's4', name: "Intervention de groupe", duration: 90, price: 0, priceLabel: "Sur devis", description: "Atelier collectif pour équipes, clubs sportifs ou établissements. Thématiques sur mesure.", color: "olive" },
];

// Generate 14 days of slots starting today
const generateDefaultSlots = () => {
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dow = date.getDay();
    if (dow === 0) continue; // closed Sunday
    const dateStr = date.toISOString().split('T')[0];
    const hours = dow === 6 ? ['09:00', '10:30'] : ['09:00', '10:30', '14:00', '15:30', '17:00'];
    hours.forEach(h => {
      slots.push({ id: `${dateStr}-${h}`, date: dateStr, time: h, available: true });
    });
  }
  return slots;
};

const DEFAULT_BOOKINGS = [
  { id: 'b1', clientName: "Marie L.", clientEmail: "marie.l@example.com", clientPhone: "06 12 34 56 78", serviceId: 's2', date: "", time: "10:30", status: "confirmé", note: "Première séance — gestion du stress avant concours" },
];

// ============================================================================
// STORAGE HELPERS
// ============================================================================

// Uses localStorage so data persists in the user's browser.
const storage = {
  async get(key, fallback) {
    try {
      const v = localStorage.getItem('jodie_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    try { localStorage.setItem('jodie_' + key, JSON.stringify(value)); } catch {}
  }
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [view, setView] = useState('public'); // 'public' | 'admin'
  const [page, setPage] = useState('home'); // public page
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

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      const c = await storage.get('content', DEFAULT_CONTENT);
      const s = await storage.get('services', DEFAULT_SERVICES);
      const sl = await storage.get('slots', null);
      const b = await storage.get('bookings', DEFAULT_BOOKINGS);
      setContent(c);
      setServices(s);
      setSlots(sl && sl.length ? sl : generateDefaultSlots());
      setBookings(b);
      setLoaded(true);
    })();
  }, []);

  // Toast helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Persist helpers
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
          --cream: #f5efe6;
          --cream-light: #faf6ef;
          --sage: #a8b5a0;
          --sage-light: #c9d3c0;
          --sage-dark: #6b7a64;
          --terracotta: #d4a896;
          --terracotta-dark: #b88670;
          --ochre: #c9a96e;
          --olive: #8a8866;
          --ink: #2a2a26;
          --ink-soft: #4a4a44;
          --line: #e0d8cc;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .font-display { font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }
        .font-body { font-family: 'Inter', -apple-system, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .grain {
          position: relative;
        }
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />

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

// ============================================================================
// ADMIN LOGIN
// ============================================================================

function AdminLogin({ authInput, setAuthInput, authError, setAuthError, onSuccess }) {
  const handle = () => {
    if (authInput === 'jodie') {
      setAuthError('');
      setAuthInput('');
      onSuccess();
    } else {
      setAuthError('Mot de passe incorrect');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'var(--sage-light)' }}>
            <Lock size={20} style={{ color: 'var(--sage-dark)' }} />
          </div>
          <h1 className="font-display text-3xl mb-2">Espace administration</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Connectez-vous pour gérer votre site</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            value={authInput}
            onChange={(e) => setAuthInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handle()}
            placeholder="Mot de passe"
            autoFocus
            className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
            style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}
          />
          {authError && <p className="text-xs" style={{ color: 'var(--terracotta-dark)' }}>{authError}</p>}
          <button
            onClick={handle}
            className="w-full py-3 rounded-lg text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90"
            style={{ background: 'var(--ink)', color: 'var(--cream)' }}
          >
            Entrer
          </button>
          <p className="text-xs text-center mt-4 font-mono" style={{ color: 'var(--ink-soft)' }}>
            Démo : mot de passe = <span style={{ color: 'var(--terracotta-dark)' }}>jodie</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PUBLIC SITE
// ============================================================================

function PublicSite({ page, setPage, content, services, slots, bookings, updateBookings, updateSlots, menuOpen, setMenuOpen, showToast }) {
  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'what', label: "C'est quoi ?" },
    { id: 'ethics', label: 'Éthique' },
    { id: 'about', label: 'Qui suis-je' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: 'rgba(245, 239, 230, 0.85)', borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--sage)' }}>
              <span className="font-display text-lg" style={{ color: 'var(--cream)' }}>J</span>
            </div>
            <div className="text-left">
              <div className="font-display text-lg leading-none">{content.siteName}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--ink-soft)' }}>{content.tagline}</div>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="px-4 py-2 text-sm transition-all relative"
                style={{ color: page === item.id ? 'var(--ink)' : 'var(--ink-soft)' }}
              >
                {item.label}
                {page === item.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--terracotta-dark)' }} />
                )}
              </button>
            ))}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t px-6 py-3" style={{ borderColor: 'var(--line)' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMenuOpen(false); }}
                className="block w-full text-left py-2 text-sm"
                style={{ color: page === item.id ? 'var(--terracotta-dark)' : 'var(--ink-soft)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="fade-in" key={page}>
        {page === 'home' && <HomePage content={content} setPage={setPage} services={services} />}
        {page === 'what' && <WhatIsPage content={content} setPage={setPage} />}
        {page === 'ethics' && <EthicsPage content={content} />}
        {page === 'about' && <AboutPage content={content} setPage={setPage} />}
        {page === 'services' && <ServicesPage content={content} services={services} setPage={setPage} />}
        {page === 'contact' && <ContactPage content={content} services={services} slots={slots} bookings={bookings} updateBookings={updateBookings} updateSlots={updateSlots} showToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-10" style={{ borderColor: 'var(--line)', background: 'var(--cream-light)' }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-display text-xl mb-2">{content.siteName}</div>
            <p style={{ color: 'var(--ink-soft)' }}>{content.tagline}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>Contact</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><Phone size={12} /> {content.contactPhone}</div>
              <div className="flex items-center gap-2"><Mail size={12} /> {content.contactEmail}</div>
              <div className="flex items-center gap-2"><MapPin size={12} /> {content.contactLocation}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>Navigation</div>
            <div className="grid grid-cols-2 gap-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setPage(item.id)} className="text-left hover:underline" style={{ color: 'var(--ink-soft)' }}>{item.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t text-xs text-center" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
          © {new Date().getFullYear()} {content.siteName} — Tous droits réservés
        </div>
      </footer>
    </div>
  );
}

// --- Public pages ---

function HomePage({ content, setPage, services }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden grain" style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--sage-light) 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="stagger relative z-10">
            <div className="text-xs uppercase tracking-[0.3em] mb-6 font-mono" style={{ color: 'var(--sage-dark)' }}>● Préparation mentale</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6" style={{ color: 'var(--ink)' }}>
              {content.heroTitle.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? <em style={{ fontStyle: 'italic', color: 'var(--terracotta-dark)' }}>{line}</em> : line}
                </span>
              ))}
            </h1>
            <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--ink-soft)' }}>{content.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
                Réserver un appel
              </button>
              <button onClick={() => setPage('what')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono transition-all border" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>
                En savoir plus
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[40%_60%_60%_40%/50%_40%_60%_50%] overflow-hidden grain" style={{ background: 'linear-gradient(160deg, var(--terracotta) 0%, var(--ochre) 100%)' }}>
              <svg viewBox="0 0 400 500" className="w-full h-full opacity-40">
                <circle cx="200" cy="250" r="180" fill="none" stroke="var(--cream)" strokeWidth="1" />
                <circle cx="200" cy="250" r="120" fill="none" stroke="var(--cream)" strokeWidth="1" />
                <circle cx="200" cy="250" r="60" fill="none" stroke="var(--cream)" strokeWidth="1" />
                <path d="M 200 70 Q 280 250 200 430 Q 120 250 200 70" fill="none" stroke="var(--cream)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full grain" style={{ background: 'var(--sage)' }}></div>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ background: 'var(--olive)', opacity: 0.7 }}></div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="leaf-divider"></div>
          <p className="font-display italic text-2xl md:text-3xl leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {content.heroQuote}
          </p>
          <div className="leaf-divider"></div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 px-6" style={{ background: 'var(--cream-light)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono" style={{ color: 'var(--sage-dark)' }}>Accompagnement</div>
            <h2 className="font-display text-4xl md:text-5xl">Trouvez la formule qui vous correspond</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => setPage('contact')} />)}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 stagger">
          {[
            { icon: <Heart size={20} />, title: "Bienveillance", text: "Un espace d'écoute sans jugement, à votre rythme." },
            { icon: <Compass size={20} />, title: "Clarté", text: "Des objectifs concrets et un cap clair dès la première séance." },
            { icon: <Users size={20} />, title: "Sur mesure", text: "Chaque parcours est construit autour de votre singularité." }
          ].map((v, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: 'var(--sage-light)', color: 'var(--sage-dark)' }}>
                {v.icon}
              </div>
              <h3 className="font-display text-2xl mb-2">{v.title}</h3>
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, onClick }) {
  const colorMap = {
    sage: 'var(--sage)', terracotta: 'var(--terracotta)', ochre: 'var(--ochre)', olive: 'var(--olive)'
  };
  return (
    <button onClick={onClick} className="text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }}>
      <div className="w-10 h-10 rounded-full mb-4" style={{ background: colorMap[service.color] || 'var(--sage)' }}></div>
      <h3 className="font-display text-xl mb-2">{service.name}</h3>
      <div className="flex items-center gap-3 text-xs mb-3 font-mono" style={{ color: 'var(--ink-soft)' }}>
        <span className="flex items-center gap-1"><Clock size={12} /> {service.duration} min</span>
        <span className="flex items-center gap-1"><Euro size={12} /> {service.priceLabel}</span>
      </div>
      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{service.description}</p>
    </button>
  );
}

function WhatIsPage({ content, setPage }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Comprendre</div>
      <h1 className="font-display text-5xl md:text-6xl mb-8">{content.whatIsTitle}</h1>
      <p className="text-lg leading-relaxed mb-12" style={{ color: 'var(--ink-soft)' }}>{content.whatIsText}</p>

      <div className="leaf-divider"></div>

      <h2 className="font-display text-4xl mb-8 mt-12">{content.forWhomTitle}</h2>
      <div className="grid md:grid-cols-2 gap-4 stagger">
        {content.forWhomItems.map((item, i) => (
          <div key={i} className="p-6 rounded-2xl border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}>
            <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--terracotta-dark)' }}>0{i+1}</div>
            <h3 className="font-display text-2xl mb-2">{item.title}</h3>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          Échangeons
        </button>
      </div>
    </div>
  );
}

function EthicsPage({ content }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Cadre</div>
      <h1 className="font-display text-5xl md:text-6xl mb-8">{content.ethicsTitle}</h1>
      <p className="text-lg leading-relaxed mb-12" style={{ color: 'var(--ink-soft)' }}>{content.ethicsText}</p>

      <div className="space-y-4 stagger">
        {content.ethicsPrinciples.map((p, i) => (
          <div key={i} className="flex gap-6 p-6 rounded-2xl" style={{ background: 'var(--cream-light)' }}>
            <div className="font-display text-4xl flex-shrink-0" style={{ color: 'var(--terracotta-dark)' }}>0{i+1}</div>
            <div>
              <h3 className="font-display text-2xl mb-1">{p.title}</h3>
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPage({ content, setPage }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="aspect-[3/4] rounded-3xl grain" style={{ background: 'linear-gradient(160deg, var(--sage) 0%, var(--olive) 100%)' }}>
            <svg viewBox="0 0 300 400" className="w-full h-full opacity-30">
              <circle cx="150" cy="150" r="60" fill="none" stroke="var(--cream)" strokeWidth="1.5" />
              <path d="M 90 250 Q 150 320 210 250" fill="none" stroke="var(--cream)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Présentation</div>
          <h1 className="font-display text-5xl md:text-6xl mb-2">Qui suis-je ?</h1>
          <p className="font-display italic text-2xl mb-6" style={{ color: 'var(--terracotta-dark)' }}>Jodie Peltier</p>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-soft)' }}>{content.aboutShort}</p>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--ink-soft)' }}>{content.aboutLong}</p>
          <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
            Réserver un appel découverte
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ content, services, setPage }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Prestations</div>
      <h1 className="font-display text-5xl md:text-6xl mb-12">Mes services</h1>
      <div className="grid md:grid-cols-2 gap-6 stagger">
        {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => setPage('contact')} />)}
      </div>
    </div>
  );
}

function ContactPage({ content, services, slots, bookings, updateBookings, updateSlots, showToast }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [weekOffset, setWeekOffset] = useState(0);

  const availableSlots = slots.filter(s => s.available);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const submitBooking = () => {
    if (!form.name || !form.email) {
      showToast("Veuillez renseigner votre nom et email");
      return;
    }
    const newBooking = {
      id: 'b' + Date.now(),
      clientName: form.name,
      clientEmail: form.email,
      clientPhone: form.phone,
      serviceId: selectedService.id,
      date: selectedSlot.date,
      time: selectedSlot.time,
      status: 'en attente',
      note: form.note
    };
    updateBookings([...bookings, newBooking]);
    updateSlots(slots.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s));
    setStep(4);
    showToast("Réservation enregistrée !");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Réservation</div>
      <h1 className="font-display text-5xl md:text-6xl mb-12">Prenons rendez-vous</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10 text-xs font-mono uppercase tracking-widest">
        {['Service', 'Créneau', 'Vos infos', 'Confirmé'].map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2" style={{ color: step > i ? 'var(--terracotta-dark)' : step === i + 1 ? 'var(--ink)' : 'var(--ink-soft)', opacity: step >= i + 1 ? 1 : 0.4 }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: step > i + 1 ? 'var(--sage-dark)' : step === i + 1 ? 'var(--ink)' : 'transparent', color: step >= i + 1 ? 'var(--cream)' : 'inherit', border: step <= i + 1 ? '1px solid currentColor' : 'none' }}>
                {step > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span className="hidden md:inline">{label}</span>
            </div>
            {i < 3 && <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="fade-in">
          <h2 className="font-display text-3xl mb-6">Quel service vous intéresse ?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map(s => (
              <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}>
                <h3 className="font-display text-2xl mb-1">{s.name}</h3>
                <div className="flex gap-3 text-xs font-mono mb-2" style={{ color: 'var(--ink-soft)' }}>
                  <span>{s.duration} min</span><span>·</span><span>{s.priceLabel}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl">Choisissez un créneau</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="p-2 rounded-full border disabled:opacity-30" style={{ borderColor: 'var(--line)' }}><ChevronLeft size={14} /></button>
              <span className="text-xs font-mono uppercase tracking-widest px-2">Sem. {weekOffset + 1}</span>
              <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-full border" style={{ borderColor: 'var(--line)' }}><ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
            {days.map((d, i) => {
              const dateStr = d.toISOString().split('T')[0];
              const daySlots = availableSlots.filter(s => s.date === dateStr);
              const isPast = d < today;
              return (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background: isPast ? 'transparent' : 'var(--cream-light)', opacity: isPast ? 0.3 : 1 }}>
                  <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                  <div className="font-display text-2xl my-1">{d.getDate()}</div>
                  <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--ink-soft)' }}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                  <div className="mt-2 space-y-1">
                    {daySlots.length === 0 ? (
                      <div className="text-[10px]" style={{ color: 'var(--ink-soft)' }}>—</div>
                    ) : daySlots.map(s => (
                      <button key={s.id} onClick={() => { setSelectedSlot(s); setStep(3); }} className="w-full py-1 text-xs rounded-md transition-all hover:opacity-80" style={{ background: 'var(--sage)', color: 'var(--cream)' }}>
                        {s.time}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep(1)} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--ink-soft)' }}>← Retour</button>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in max-w-2xl">
          <h2 className="font-display text-3xl mb-2">Vos coordonnées</h2>
          <div className="text-sm mb-6 font-mono" style={{ color: 'var(--ink-soft)' }}>
            {selectedService.name} · {new Date(selectedSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedSlot.time}
          </div>
          <div className="space-y-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Prénom & Nom *" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email *" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Un message (optionnel)" rows={3} className="w-full px-4 py-3 rounded-lg border outline-none resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono border" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>← Retour</button>
              <button onClick={submitBooking} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono flex-1" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="fade-in text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'var(--sage-light)' }}>
            <Check size={28} style={{ color: 'var(--sage-dark)' }} />
          </div>
          <h2 className="font-display text-4xl mb-4">Demande envoyée</h2>
          <p className="text-base max-w-md mx-auto mb-6" style={{ color: 'var(--ink-soft)' }}>
            Merci {form.name.split(' ')[0]} ! Je reviens vers vous très vite pour confirmer notre rendez-vous du {new Date(selectedSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedSlot.time}.
          </p>
          <button onClick={() => { setStep(1); setSelectedService(null); setSelectedSlot(null); setForm({ name: '', email: '', phone: '', note: '' }); }} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--ink-soft)' }}>
            Nouvelle réservation
          </button>
        </div>
      )}

      {/* Direct contact */}
      <div className="mt-20 pt-10 border-t grid md:grid-cols-3 gap-6" style={{ borderColor: 'var(--line)' }}>
        <div>
          <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Téléphone</div>
          <div className="font-display text-xl">{content.contactPhone}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Email</div>
          <div className="font-display text-xl break-all">{content.contactEmail}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Lieu</div>
          <div className="font-display text-xl">{content.contactLocation}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN PANEL
// ============================================================================

function AdminPanel({ adminPage, setAdminPage, content, updateContent, services, updateServices, slots, updateSlots, bookings, updateBookings, showToast }) {
  const menu = [
    { id: 'planning', label: 'Planning', icon: <Calendar size={16} /> },
    { id: 'services', label: 'Services', icon: <Settings size={16} /> },
    { id: 'bookings', label: 'Réservations', icon: <Users size={16} /> },
    { id: 'content', label: 'Contenu du site', icon: <FileText size={16} /> },
  ];
  const stats = {
    upcomingBookings: bookings.filter(b => b.status !== 'annulé').length,
    availableSlots: slots.filter(s => s.available).length,
    servicesCount: services.length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-light)' }}>
      <div className="border-b" style={{ borderColor: 'var(--line)', background: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--terracotta-dark)' }}>
              <Settings size={16} style={{ color: 'var(--cream)' }} />
            </div>
            <div>
              <div className="font-display text-xl leading-none">Admin · Jodie Peltier</div>
              <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--ink-soft)' }}>Tableau de bord</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs">
            <Stat label="Réservations" value={stats.upcomingBookings} />
            <Stat label="Créneaux libres" value={stats.availableSlots} />
            <Stat label="Services" value={stats.servicesCount} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[200px_1fr] gap-8">
        <aside>
          <div className="space-y-1 sticky top-6">
            {menu.map(m => (
              <button
                key={m.id}
                onClick={() => setAdminPage(m.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-left"
                style={{
                  background: adminPage === m.id ? 'var(--ink)' : 'transparent',
                  color: adminPage === m.id ? 'var(--cream)' : 'var(--ink-soft)'
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="fade-in" key={adminPage}>
          {adminPage === 'planning' && <AdminPlanning slots={slots} updateSlots={updateSlots} bookings={bookings} updateBookings={updateBookings} services={services} showToast={showToast} />}
          {adminPage === 'services' && <AdminServices services={services} updateServices={updateServices} showToast={showToast} />}
          {adminPage === 'bookings' && <AdminBookings bookings={bookings} updateBookings={updateBookings} services={services} slots={slots} updateSlots={updateSlots} showToast={showToast} />}
          {adminPage === 'content' && <AdminContent content={content} updateContent={updateContent} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-right">
      <div className="font-display text-2xl leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  );
}

// --- Admin: Planning ---

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function BookingDetailModal({ booking, service, onClose, onConfirm, onCancel }) {
  if (!booking) return null;
  const statusColor = { 'en attente': 'var(--ochre)', 'confirmé': 'var(--sage-dark)', 'annulé': 'var(--terracotta-dark)' };
  const endTime = service ? addMinutes(booking.time, service.duration) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,42,38,0.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 fade-in" style={{ background: 'var(--cream)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-display text-3xl mb-1">{booking.clientName}</div>
            <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: statusColor[booking.status] || 'var(--line)', color: 'var(--cream)' }}>
              {booking.status}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-60" style={{ color: 'var(--ink-soft)' }}><X size={16} /></button>
        </div>

        {/* Time block */}
        <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--cream-light)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--terracotta)' }}>
            <Clock size={16} style={{ color: 'var(--cream)' }} />
          </div>
          <div>
            <div className="font-mono text-lg font-semibold" style={{ color: 'var(--ink)' }}>
              {booking.time}{endTime ? ` → ${endTime}` : ''}
            </div>
            <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>
              {booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>

        {/* Service */}
        {service && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--cream-light)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--sage)' }}>
              <FileText size={16} style={{ color: 'var(--cream)' }} />
            </div>
            <div>
              <div className="font-display text-lg">{service.name}</div>
              <div className="text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>{service.duration} min · {service.priceLabel}</div>
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={14} style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
            <span>{booking.clientEmail}</span>
          </div>
          {booking.clientPhone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={14} style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
              <span>{booking.clientPhone}</span>
            </div>
          )}
        </div>

        {/* Note */}
        {booking.note && (
          <div className="p-4 rounded-xl mb-5 text-sm italic" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>
            « {booking.note} »
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
          {booking.status !== 'confirmé' && (
            <button onClick={() => { onConfirm(booking.id); onClose(); }} className="flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
              Confirmer
            </button>
          )}
          {booking.status !== 'annulé' && (
            <button onClick={() => { onCancel(booking.id); onClose(); }} className="flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
              Annuler
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPlanning({ slots, updateSlots, bookings, updateBookings, services, showToast }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const addSlot = () => {
    if (!newSlotDate || !newSlotTime) { showToast("Date et heure requises"); return; }
    const id = `${newSlotDate}-${newSlotTime}`;
    if (slots.find(s => s.id === id)) { showToast("Ce créneau existe déjà"); return; }
    updateSlots([...slots, { id, date: newSlotDate, time: newSlotTime, available: true }]);
    setNewSlotDate(''); setNewSlotTime('');
    showToast("Créneau ajouté");
  };

  const removeSlot = (id) => {
    updateSlots(slots.filter(s => s.id !== id));
    showToast("Créneau supprimé");
  };

  const toggleSlot = (id) => {
    updateSlots(slots.map(s => s.id === id ? { ...s, available: !s.available } : s));
  };

  const setBookingStatus = (id, status) => {
    updateBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Statut mis à jour : ${status}`);
  };

  const selectedService = selectedBooking ? services.find(s => s.id === selectedBooking.serviceId) : null;

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Planning</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>Gérez vos créneaux. Cliquez sur une réservation pour voir les détails, sur un créneau libre pour l'activer/désactiver.</p>

      {/* Add slot */}
      <div className="p-5 rounded-2xl mb-8 grid md:grid-cols-[1fr_1fr_auto] gap-3" style={{ background: 'var(--cream)' }}>
        <input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className="px-4 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
        <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="px-4 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
        <button onClick={addSlot} className="px-5 py-2 rounded-lg text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="p-2 rounded-full border disabled:opacity-30" style={{ borderColor: 'var(--line)' }}><ChevronLeft size={14} /></button>
        <div className="text-sm font-mono uppercase tracking-widest">
          {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </div>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-full border" style={{ borderColor: 'var(--line)' }}><ChevronRight size={14} /></button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const dateStr = d.toISOString().split('T')[0];
          const isToday = d.toISOString().split('T')[0] === today.toISOString().split('T')[0];
          const daySlots = slots.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div key={i} className="p-2 rounded-xl min-h-[200px]" style={{ background: isToday ? 'var(--sage-light)' : 'var(--cream)', border: isToday ? '1.5px solid var(--sage-dark)' : '1.5px solid transparent' }}>
              <div className="text-center mb-2 pb-2 border-b" style={{ borderColor: 'var(--line)' }}>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div className="font-display text-xl" style={{ color: isToday ? 'var(--sage-dark)' : 'var(--ink)' }}>{d.getDate()}</div>
              </div>
              <div className="space-y-1.5">
                {daySlots.length === 0 ? (
                  <div className="text-[10px] text-center py-2" style={{ color: 'var(--ink-soft)' }}>aucun</div>
                ) : daySlots.map(s => {
                  const booking = bookings.find(b => b.date === s.date && b.time === s.time);
                  const svc = booking ? services.find(sv => sv.id === booking.serviceId) : null;
                  const endTime = svc ? addMinutes(s.time, svc.duration) : null;
                  const statusColors = { 'confirmé': 'var(--sage-dark)', 'annulé': 'var(--terracotta-dark)', 'en attente': 'var(--ochre)' };
                  if (booking) {
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full text-left rounded-lg px-2 py-1.5 transition-all hover:opacity-80 hover:shadow-md"
                        style={{ background: statusColors[booking.status] || 'var(--terracotta)', color: 'var(--cream)' }}
                      >
                        <div className="font-mono text-[10px] font-semibold leading-tight">
                          {s.time}{endTime ? ` → ${endTime}` : ''}
                        </div>
                        <div className="text-[10px] font-semibold truncate mt-0.5 leading-tight">{booking.clientName}</div>
                        {svc && <div className="text-[9px] opacity-75 truncate leading-tight">{svc.name}</div>}
                      </button>
                    );
                  }
                  return (
                    <div key={s.id} className="group flex items-center justify-between px-2 py-1.5 rounded-md text-xs"
                      style={{
                        background: s.available ? 'rgba(168,181,160,0.25)' : 'var(--line)',
                        color: 'var(--ink)',
                        opacity: !s.available ? 0.5 : 1
                      }}>
                      <button onClick={() => toggleSlot(s.id)} className="flex-1 text-left font-mono text-[11px]">
                        {s.time}
                        {!s.available && <div className="text-[9px] opacity-60">bloqué</div>}
                      </button>
                      <button onClick={() => removeSlot(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4 text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'rgba(168,181,160,0.4)' }}></div> Libre</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--sage-dark)' }}></div> Confirmé</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--ochre)' }}></div> En attente</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--terracotta-dark)' }}></div> Annulé</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--line)' }}></div> Bloqué</div>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        service={selectedService}
        onClose={() => setSelectedBooking(null)}
        onConfirm={(id) => setBookingStatus(id, 'confirmé')}
        onCancel={(id) => setBookingStatus(id, 'annulé')}
      />
    </div>
  );
}

// --- Admin: Services ---

function AdminServices({ services, updateServices, showToast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 60, price: 0, priceLabel: '', description: '', color: 'sage' });

  const startEdit = (s) => { setEditing(s.id); setForm(s); };
  const startNew = () => { setEditing('new'); setForm({ name: '', duration: 60, price: 0, priceLabel: '', description: '', color: 'sage' }); };

  const save = () => {
    if (!form.name) { showToast("Le nom est requis"); return; }
    if (editing === 'new') {
      updateServices([...services, { ...form, id: 's' + Date.now() }]);
      showToast("Service créé");
    } else {
      updateServices(services.map(s => s.id === editing ? form : s));
      showToast("Service mis à jour");
    }
    setEditing(null);
  };

  const remove = (id) => {
    updateServices(services.filter(s => s.id !== id));
    showToast("Service supprimé");
  };

  const colorMap = { sage: 'var(--sage)', terracotta: 'var(--terracotta)', ochre: 'var(--ochre)', olive: 'var(--olive)' };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl">Services & Tarifs</h1>
        <button onClick={startNew} className="px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          <Plus size={14} /> Nouveau
        </button>
      </div>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>Configurez les prestations proposées à vos clients.</p>

      {editing && (
        <div className="p-6 rounded-2xl mb-6 fade-in" style={{ background: 'var(--cream)', border: '2px solid var(--terracotta-dark)' }}>
          <h3 className="font-display text-2xl mb-4">{editing === 'new' ? 'Nouveau service' : 'Modifier le service'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nom" className="px-3 py-2 rounded-lg border md:col-span-2" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value) || 0})} placeholder="Durée (min)" className="px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <input type="number" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})} placeholder="Prix (€)" className="px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <input value={form.priceLabel} onChange={e => setForm({...form, priceLabel: e.target.value})} placeholder="Affichage du prix (ex: « À partir de 55 € »)" className="px-3 py-2 rounded-lg border md:col-span-2" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={3} className="px-3 py-2 rounded-lg border md:col-span-2 resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Couleur</div>
              <div className="flex gap-2">
                {Object.keys(colorMap).map(c => (
                  <button key={c} onClick={() => setForm({...form, color: c})} className="w-8 h-8 rounded-full transition-transform" style={{ background: colorMap[c], transform: form.color === c ? 'scale(1.2)' : 'scale(1)', boxShadow: form.color === c ? '0 0 0 2px var(--ink)' : 'none' }}></button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
              <Save size={14} /> Enregistrer
            </button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="p-5 rounded-2xl flex gap-4" style={{ background: 'var(--cream)' }}>
            <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: colorMap[s.color] }}></div>
            <div className="flex-1">
              <div className="font-display text-xl">{s.name}</div>
              <div className="text-xs font-mono mb-2" style={{ color: 'var(--ink-soft)' }}>{s.duration} min · {s.priceLabel}</div>
              <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>{s.description}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline"><Edit2 size={10} /> Modifier</button>
                <button onClick={() => remove(s.id)} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={10} /> Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Admin: Bookings ---

function AdminBookings({ bookings, updateBookings, services, slots, updateSlots, showToast }) {
  const [filter, setFilter] = useState('all');

  const getService = (id) => services.find(s => s.id === id);

  const setStatus = (id, status) => {
    updateBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Statut mis à jour : ${status}`);
  };

  const removeBooking = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      // Free the slot back
      updateSlots(slots.map(s => (s.date === booking.date && s.time === booking.time) ? { ...s, available: true } : s));
    }
    updateBookings(bookings.filter(b => b.id !== id));
    showToast("Réservation supprimée");
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColor = {
    'en attente': 'var(--ochre)',
    'confirmé': 'var(--sage-dark)',
    'annulé': 'var(--terracotta-dark)',
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Réservations</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>Suivez et gérez les demandes de vos clients.</p>

      <div className="flex gap-2 mb-6">
        {['all', 'en attente', 'confirmé', 'annulé'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: filter === f ? 'var(--ink)' : 'transparent', color: filter === f ? 'var(--cream)' : 'var(--ink-soft)', border: filter !== f ? '1px solid var(--line)' : 'none' }}>
            {f === 'all' ? 'Toutes' : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl" style={{ background: 'var(--cream)', color: 'var(--ink-soft)' }}>
            Aucune réservation
          </div>
        ) : filtered.map(b => {
          const service = getService(b.serviceId);
          return (
            <div key={b.id} className="p-5 rounded-2xl flex flex-col md:flex-row gap-4 md:items-center" style={{ background: 'var(--cream)' }}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="font-display text-xl">{b.clientName}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: statusColor[b.status], color: 'var(--cream)' }}>
                    {b.status}
                  </div>
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--ink-soft)' }}>
                  {service?.name} · {b.date ? new Date(b.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'} à {b.time}
                </div>
                <div className="text-xs space-y-0.5" style={{ color: 'var(--ink-soft)' }}>
                  <div className="flex items-center gap-2"><Mail size={11} /> {b.clientEmail}</div>
                  {b.clientPhone && <div className="flex items-center gap-2"><Phone size={11} /> {b.clientPhone}</div>}
                  {b.note && <div className="mt-2 italic">« {b.note} »</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.status !== 'confirmé' && <button onClick={() => setStatus(b.id, 'confirmé')} className="px-3 py-1.5 text-xs rounded-full font-mono uppercase tracking-widest" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>Confirmer</button>}
                {b.status !== 'annulé' && <button onClick={() => setStatus(b.id, 'annulé')} className="px-3 py-1.5 text-xs rounded-full font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>Annuler</button>}
                <button onClick={() => removeBooking(b.id)} className="p-1.5 rounded-full" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Admin: Content ---

function AdminContent({ content, updateContent, showToast }) {
  const [draft, setDraft] = useState(content);
  const [section, setSection] = useState('hero');

  useEffect(() => { setDraft(content); }, [content]);

  const sections = [
    { id: 'hero', label: 'Accueil' },
    { id: 'what', label: "C'est quoi" },
    { id: 'ethics', label: 'Éthique' },
    { id: 'about', label: 'Qui suis-je' },
    { id: 'contact', label: 'Contact' },
  ];

  const save = () => {
    updateContent(draft);
    showToast("Modifications enregistrées");
  };

  const updateForWhom = (i, field, value) => {
    const items = [...draft.forWhomItems];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, forWhomItems: items });
  };

  const updatePrinciple = (i, field, value) => {
    const items = [...draft.ethicsPrinciples];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, ethicsPrinciples: items });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl">Contenu du site</h1>
        <button onClick={save} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          <Save size={14} /> Enregistrer
        </button>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>Éditez les textes affichés sur votre site.</p>

      <div className="flex gap-1 mb-6 flex-wrap">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded-full" style={{ background: section === s.id ? 'var(--terracotta-dark)' : 'transparent', color: section === s.id ? 'var(--cream)' : 'var(--ink-soft)', border: section !== s.id ? '1px solid var(--line)' : 'none' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--cream)' }}>
        {section === 'hero' && (
          <>
            <Field label="Nom du site" value={draft.siteName} onChange={v => setDraft({...draft, siteName: v})} />
            <Field label="Sous-titre" value={draft.tagline} onChange={v => setDraft({...draft, tagline: v})} />
            <Field label="Titre principal" value={draft.heroTitle} onChange={v => setDraft({...draft, heroTitle: v})} multiline help="Utilisez Entrée pour un retour à la ligne (la 2ème ligne sera en italique colorée)" />
            <Field label="Sous-titre principal" value={draft.heroSubtitle} onChange={v => setDraft({...draft, heroSubtitle: v})} multiline />
            <Field label="Citation" value={draft.heroQuote} onChange={v => setDraft({...draft, heroQuote: v})} multiline />
          </>
        )}
        {section === 'what' && (
          <>
            <Field label="Titre" value={draft.whatIsTitle} onChange={v => setDraft({...draft, whatIsTitle: v})} />
            <Field label="Texte de présentation" value={draft.whatIsText} onChange={v => setDraft({...draft, whatIsText: v})} multiline />
            <Field label="Titre — Pour qui ?" value={draft.forWhomTitle} onChange={v => setDraft({...draft, forWhomTitle: v})} />
            <div className="text-xs uppercase tracking-widest font-mono pt-4" style={{ color: 'var(--ink-soft)' }}>Publics concernés</div>
            {draft.forWhomItems.map((item, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--cream-light)' }}>
                <Field label={`Titre ${i+1}`} value={item.title} onChange={v => updateForWhom(i, 'title', v)} />
                <Field label="Description" value={item.text} onChange={v => updateForWhom(i, 'text', v)} multiline />
              </div>
            ))}
          </>
        )}
        {section === 'ethics' && (
          <>
            <Field label="Titre" value={draft.ethicsTitle} onChange={v => setDraft({...draft, ethicsTitle: v})} />
            <Field label="Introduction" value={draft.ethicsText} onChange={v => setDraft({...draft, ethicsText: v})} multiline />
            <div className="text-xs uppercase tracking-widest font-mono pt-4" style={{ color: 'var(--ink-soft)' }}>Principes</div>
            {draft.ethicsPrinciples.map((p, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--cream-light)' }}>
                <Field label={`Principe ${i+1}`} value={p.title} onChange={v => updatePrinciple(i, 'title', v)} />
                <Field label="Description" value={p.text} onChange={v => updatePrinciple(i, 'text', v)} multiline />
              </div>
            ))}
          </>
        )}
        {section === 'about' && (
          <>
            <Field label="Présentation courte" value={draft.aboutShort} onChange={v => setDraft({...draft, aboutShort: v})} multiline />
            <Field label="Présentation longue" value={draft.aboutLong} onChange={v => setDraft({...draft, aboutLong: v})} multiline />
          </>
        )}
        {section === 'contact' && (
          <>
            <Field label="Téléphone" value={draft.contactPhone} onChange={v => setDraft({...draft, contactPhone: v})} />
            <Field label="Email" value={draft.contactEmail} onChange={v => setDraft({...draft, contactEmail: v})} />
            <Field label="Lieu" value={draft.contactLocation} onChange={v => setDraft({...draft, contactLocation: v})} />
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, help }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
      )}
      {help && <div className="text-[10px] mt-1" style={{ color: 'var(--ink-soft)' }}>{help}</div>}
    </div>
  );
}
