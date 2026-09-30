import { Link, useParams } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';

const LEGAL_PAGES = {
  'mentions-legales':  { title: 'Mentions légales',            key: 'legalMentions' },
  'politique-cookies': { title: 'Politique cookies',           key: 'legalCookies' },
  'confidentialite':   { title: 'Politique de confidentialité',key: 'legalPrivacy' },
  'conditions':        { title: "Conditions d'utilisation",    key: 'legalTerms' },
};

export default function Legal() {
  const { slug } = useParams();
  const { content } = useSite();
  const page = LEGAL_PAGES[slug];

  if (!page) return (
    <div className="py-32 px-6 text-center">
      <p className="text-ink-soft mb-4">Page introuvable.</p>
      <Link to="/" className="text-xs font-mono uppercase tracking-widest underline text-sage-dark">← Accueil</Link>
    </div>
  );

  return (
    <div>
      <div className="py-16 px-6 bg-sage-dark">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-xs font-mono uppercase tracking-widest mb-6 block hover:underline" style={{ color: 'rgba(255,255,255,0.5)' }}>← Accueil</Link>
          <h1 className="font-serif text-4xl md:text-5xl text-cream">{page.title}</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="legal-prose leading-relaxed text-[0.95rem]"
          dangerouslySetInnerHTML={{ __html: content[page.key] || '<p>Contenu à venir.</p>' }} />
      </div>
    </div>
  );
}
