import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';

const NAV_LEFT = [
  { to: '/',         labelKey: 'navHomeLabel',     fallback: 'Accueil' },
  { to: '/a-propos', labelKey: 'navAboutLabel',     fallback: 'Qui suis-je ?' },
  { to: '/contact',  labelKey: 'navContactLabel',   fallback: 'Contact' },
];
const NAV_RIGHT = [
  { to: '/demarche', labelKey: 'navWhatLabel',      fallback: "C'est quoi et pour qui ?" },
  { to: '/services', labelKey: 'navServicesLabel',  fallback: 'Services' },
];

const linkStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(252,247,248,0.55)',
  transition: 'opacity 0.2s',
};

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6rem',
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'rgba(252,247,248,0.35)',
  marginBottom: '1rem',
  display: 'block',
};

export default function Footer() {
  const { content, pages } = useSite();
  const social = content.socialLinks || {};
  const footerPages = pages.filter(p => p.nav_position === 'footer');
  const year = new Date().getFullYear();

  return (
    <>
      <footer
        className="py-12 px-6"
        style={{ background: 'var(--color-ink)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Col 1 — Logo + tagline + social */}
            <div>
              <div className="inline-block rounded-xl p-3 mb-4" style={{ background: '#fff' }}>
                <img
                  src={content.logoFooter || content.logo || '/logo-crop.png'}
                  alt={content.siteName || 'Logo'}
                  style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
              {(content.footerTagline || content.tagline) && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(252,247,248,0.45)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  {content.footerTagline || content.tagline}
                </p>
              )}
              <div className="flex gap-4">
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(252,247,248,0.55)' }} className="hover:opacity-100 transition-opacity">
                    <Instagram size={18} />
                  </a>
                )}
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(252,247,248,0.55)' }} className="hover:opacity-100 transition-opacity">
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Col 2 — Navigation */}
            <div>
              <span style={labelStyle}>Navigation</span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-3">
                  {NAV_LEFT.map(({ to, labelKey, fallback }) => (
                    <div key={to}>
                      <Link to={to} className="hover:opacity-100 transition-opacity" style={linkStyle}>
                        {content[labelKey] || fallback}
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {NAV_RIGHT.map(({ to, labelKey, fallback }) => (
                    <div key={to}>
                      <Link to={to} className="hover:opacity-100 transition-opacity" style={linkStyle}>
                        {content[labelKey] || fallback}
                      </Link>
                    </div>
                  ))}
                  {footerPages.map(p => (
                    <div key={p.id}>
                      <Link to={`/${p.slug}`} className="hover:opacity-100 transition-opacity" style={linkStyle}>
                        {p.nav_label || p.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 3 — Contact */}
            <div>
              <span style={labelStyle}>Contact</span>
              <div className="space-y-3">
                {content.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone size={14} style={{ color: 'rgba(252,247,248,0.35)', flexShrink: 0 }} />
                    <span style={{ ...linkStyle, textTransform: 'none', letterSpacing: 0 }}>
                      {content.contactPhone}
                    </span>
                  </div>
                )}
                {content.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail size={14} style={{ color: 'rgba(252,247,248,0.35)', flexShrink: 0 }} />
                    <span style={{ ...linkStyle, textTransform: 'none', letterSpacing: 0 }}>
                      {content.contactEmail}
                    </span>
                  </div>
                )}
                {content.contactLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin size={14} style={{ color: 'rgba(252,247,248,0.35)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ ...linkStyle, textTransform: 'none', letterSpacing: 0 }}>
                      {content.contactLocation}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(252,247,248,0.35)' }}>
              © {year} {content.siteName || 'Jodie Peltier'} — Tous droits réservés
            </p>
            <div className="flex gap-5">
              {[
                { to: '/mentions-legales',           label: 'Mentions légales' },
                { to: '/cookies',                    label: 'Cookies' },
                { to: '/politique-confidentialite',  label: 'Confidentialité' },
                { to: '/cgu',                        label: 'CGU' },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(252,247,248,0.35)' }}
                  className="hover:opacity-70 transition-opacity"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Bouton Réserver flottant */}
      {(content.bookingUrl || true) && (
        <Link
          to={content.bookingUrl || '/contact'}
          className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full"
          style={{
            background: 'var(--color-sage-dark)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Réserver
        </Link>
      )}
    </>
  );
}
