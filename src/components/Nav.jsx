import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';

const NAV_LINKS = [
  { to: '/',          labelKey: 'navHomeLabel',     fallback: 'Accueil' },
  { to: '/demarche',  labelKey: 'navWhatLabel',     fallback: "C'est quoi et pour qui ?" },
  { to: '/charte',    labelKey: 'navEthicsLabel',   fallback: 'Les principes éthiques et déontologique' },
  { to: '/a-propos',  labelKey: 'navAboutLabel',    fallback: 'Qui suis-je ?' },
  { to: '/services',  labelKey: 'navServicesLabel', fallback: 'Services' },
  { to: '/contact',   labelKey: 'navContactLabel',  fallback: 'Contact' },
];

export default function Nav() {
  const { content, pages } = useSite();
  const navPages = pages.filter(p => p.nav_position === 'header');
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) { setVisible(true); lastY.current = y; return; }
      setVisible(y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.97)',
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      {content.announcement && (
        <div
          className="w-full text-center py-2 px-4 text-xs font-mono uppercase tracking-widest"
          style={{ background: 'var(--color-ink)', color: 'rgba(252,247,248,0.8)', letterSpacing: '0.15em' }}
        >
          {content.announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0">
          {content.logo
            ? <img src={content.logo} alt={content.siteName || 'Logo'} style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            : <img src="/logo-crop.png" alt={content.siteName || 'Logo'} style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          }
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, labelKey, fallback }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to}
                className="relative px-4 py-2 transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: active ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)',
                }}
              >
                {content[labelKey] || fallback}
                {active && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--color-sage-dark)' }}
                  />
                )}
              </Link>
            );
          })}
          {navPages.map(p => {
            const active = isActive(`/${p.slug}`);
            return (
              <Link key={p.id} to={`/${p.slug}`}
                className="relative px-4 py-2 transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: active ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)',
                }}
              >
                {p.nav_label || p.title}
                {active && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--color-sage-dark)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          style={{ color: 'var(--color-ink)' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-1"
          style={{ borderColor: 'var(--color-line)', background: 'rgba(255,255,255,0.98)' }}
        >
          {NAV_LINKS.map(({ to, labelKey, fallback }) => (
            <Link key={to} to={to}
              className="block py-3 border-b"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isActive(to) ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)',
                borderColor: 'var(--color-line)',
              }}
            >
              {content[labelKey] || fallback}
            </Link>
          ))}
          {navPages.map(p => (
            <Link key={p.id} to={`/${p.slug}`}
              className="block py-3 border-b"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isActive(`/${p.slug}`) ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)',
                borderColor: 'var(--color-line)',
              }}
            >
              {p.nav_label || p.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
