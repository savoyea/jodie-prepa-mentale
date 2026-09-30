import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';

const SOCIAL = [
  { key: 'facebook', label: 'Facebook', svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
  { key: 'instagram', label: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
  { key: 'youtube', label: 'YouTube', svg: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></> },
  { key: 'twitter', label: 'X / Twitter', svg: <path d="M18 6 6 18M6 6l12 12"/> },
  { key: 'linkedin', label: 'LinkedIn', svg: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></> },
];

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/demarche', label: "C'est quoi ?" },
  { to: '/charte', label: 'Éthique' },
  { to: '/a-propos', label: 'Qui suis-je' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

const LEGAL = [
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/politique-cookies', label: 'Politique cookies' },
  { to: '/confidentialite', label: 'Confidentialité' },
  { to: '/conditions', label: "Conditions d'utilisation" },
];

export default function Footer() {
  const { content } = useSite();
  const social = SOCIAL.filter(p => content.socialLinks?.[p.key]);

  return (
    <footer className="mt-20 py-12 bg-sage-dark">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-sm">
        {/* Col 1 — brand */}
        <div>
          {content.logoFooter ? (
            <img src={content.logoFooter} alt={content.siteName} className="h-14 object-contain mb-3" />
          ) : content.logo ? (
            <div className="inline-block bg-white rounded-lg p-1 mb-3">
              <img src={content.logo} alt={content.siteName} className="h-12 object-contain" />
            </div>
          ) : (
            <span className="font-serif text-2xl text-cream block mb-3">{content.siteName}</span>
          )}
          <p className="text-xs mb-4" style={{ color: 'rgba(252,247,248,0.6)' }}>{content.tagline}</p>
          {social.length > 0 && (
            <div className="flex items-center gap-4">
              {social.map(p => (
                <a key={p.key} href={content.socialLinks[p.key]} target="_blank" rel="noopener noreferrer" title={p.label}
                  className="transition-colors" style={{ color: 'rgba(255,255,255,0.65)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {p.svg}
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 — contact */}
        <div>
          <div className="text-xs uppercase tracking-widest mb-4 font-mono text-sage">Contact</div>
          <div className="space-y-2" style={{ color: 'rgba(252,247,248,0.85)' }}>
            {content.contactPhone && <div className="flex items-center gap-2 text-xs"><Phone size={12} />{content.contactPhone}</div>}
            {content.contactEmail && <div className="flex items-center gap-2 text-xs"><Mail size={12} />{content.contactEmail}</div>}
            {content.contactLocation && <div className="flex items-center gap-2 text-xs"><MapPin size={12} />{content.contactLocation}</div>}
          </div>
        </div>

        {/* Col 3 — nav */}
        <div>
          <div className="text-xs uppercase tracking-widest mb-4 font-mono text-sage">Navigation</div>
          <div className="grid grid-cols-2 gap-1">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className="text-xs transition-all hover:underline" style={{ color: 'rgba(252,247,248,0.7)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 pt-6" style={{ borderTop: '1px solid rgba(252,247,248,0.15)' }}>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-3">
          {LEGAL.map(({ to, label }) => (
            <Link key={to} to={to} className="text-xs hover:underline transition-all" style={{ color: 'rgba(252,247,248,0.45)' }}>
              {label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: 'rgba(252,247,248,0.3)' }}>
          © {new Date().getFullYear()} {content.siteName} — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
