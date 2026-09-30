import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';

const NAV_LINKS = [
  { to: '/',           labelKey: 'navHomeLabel',     default: 'Accueil' },
  { to: '/demarche',   labelKey: 'navWhatLabel',     default: 'Démarche' },
  { to: '/charte',     labelKey: 'navEthicsLabel',   default: 'Charte' },
  { to: '/a-propos',   labelKey: 'navAboutLabel',    default: 'À propos' },
  { to: '/services',   labelKey: 'navServicesLabel', default: 'Services' },
  { to: '/contact',    labelKey: 'navContactLabel',  default: 'Contact' },
];

export default function Nav() {
  const { content } = useSite();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) { setVisible(true); lastScrollY.current = y; return; }
      setVisible(y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      {content.announcement && (
        <div className="w-full text-center py-2 px-4 text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--color-ink)', color: 'rgba(252,247,248,0.8)' }}>
          {content.announcement}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0">
          {content.logo
            ? <img src={content.logo} alt={content.siteName} style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
            : <img src="/logo-crop.png" alt="JOYA" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          }
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, labelKey, default: def }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className="relative px-4 py-2 text-sm font-mono uppercase tracking-widest transition-colors"
                style={{ color: active ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                {content[labelKey] || def}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--color-sage-dark)' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile burger */}
        <button className="md:hidden p-2 rounded-full" onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
          style={{ color: 'var(--color-ink)' }}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-5 space-y-1" style={{ borderColor: 'var(--color-line)', background: 'rgba(252,247,248,0.97)' }}>
          {NAV_LINKS.map(({ to, labelKey, default: def }) => (
            <button key={to} onClick={() => { setMenuOpen(false); }}
              className="block w-full text-left py-3 text-sm font-mono uppercase tracking-widest border-b"
              style={{ color: location.pathname === to ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)', borderColor: 'var(--color-line)', letterSpacing: '0.08em' }}>
              <Link to={to} className="block w-full">{content[labelKey] || def}</Link>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
