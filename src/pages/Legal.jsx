import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';
import { pb } from '../lib/pocketbase.js';

const LEGAL_MAP = {
  'mentions-legales':           { key: 'legalMentions',  title: 'Mentions légales' },
  'politique-confidentialite':  { key: 'legalPrivacy',   title: 'Politique de confidentialité' },
  'cookies':                    { key: 'legalCookies',   title: 'Cookies' },
  'conditions-utilisation':     { key: 'legalTerms',     title: "Conditions d'utilisation" },
};

export default function Legal() {
  const { slug } = useParams();
  const { content } = useSite();
  const legalEntry = LEGAL_MAP[slug];

  const [page, setPage]       = useState(null);
  const [loading, setLoading] = useState(!legalEntry);

  useEffect(() => {
    if (legalEntry) return;
    setLoading(true);
    pb.collection('pages')
      .getFirstListItem(`slug="${slug}" && status="published"`)
      .then(r => setPage(r))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug, legalEntry]);

  if (legalEntry) {
    if (!content[legalEntry.key]) return <NotFound />;
    return <LegalPage title={legalEntry.title} html={content[legalEntry.key]} />;
  }

  if (loading) return (
    <div className="pt-32 pb-20 px-6 text-center">
      <p style={{ color: 'var(--color-ink-soft)' }}>Chargement…</p>
    </div>
  );

  if (!page) return <NotFound />;

  return <DynamicPage page={page} />;
}

function NotFound() {
  return (
    <div className="pt-32 pb-20 px-6 text-center">
      <h1 style={{ fontFamily: 'var(--color-serif, var(--font-serif))', fontSize: '3rem', color: 'var(--color-ink)' }}>
        Page introuvable
      </h1>
      <Link to="/" className="mt-6 inline-block" style={{ color: 'var(--color-sage-dark)' }}>Retour à l'accueil</Link>
    </div>
  );
}

function LegalPage({ title, html }) {
  return (
    <section className="pt-32 pb-20 px-6" style={{ background: 'var(--color-cream)' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-10" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, color: 'var(--color-ink)' }}>
          {title}
        </h1>
        <div className="legal-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}

function PageHero({ c }) {
  if (!c.heroTitle && !c.heroSubtitle && !c.heroImage) return null;
  return (
    <section className="relative" style={{ background: c.heroImage ? undefined : 'var(--color-sage-dark)', minHeight: c.heroImage ? 280 : 200 }}>
      {c.heroImage && (
        <>
          <img src={c.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,5,5,0.55), rgba(10,5,5,0.65))' }} />
        </>
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        {c.heroTitle && (
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#fff', marginBottom: c.heroSubtitle ? '1rem' : 0 }}>
            {c.heroTitle}
          </h1>
        )}
        {c.heroSubtitle && (
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '50ch', margin: '0 auto' }}>
            {c.heroSubtitle}
          </p>
        )}
      </div>
    </section>
  );
}

function AccordionItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--color-line)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-ink)' }}>{item.title}</span>
        <span style={{ color: 'var(--color-ink-soft)', fontSize: '1.25rem', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none', display: 'inline-block' }}>+</span>
      </button>
      {open && item.text && (
        <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>{item.text}</p>
      )}
    </div>
  );
}

function DynamicPage({ page }) {
  const c = page.content || {};
  const items = Array.isArray(c.items) ? c.items : [];
  const cards = Array.isArray(c.cards) ? c.cards : [];

  return (
    <div>
      <PageHero c={c} />

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Intro */}
        {c.intro && (
          <div className="mb-12">
            <div
              className="legal-prose text-base leading-relaxed"
              style={{ color: 'var(--color-ink-soft)' }}
              dangerouslySetInnerHTML={{ __html: c.intro }}
            />
          </div>
        )}

        {/* blank / hero-text → HTML */}
        {(page.template === 'blank' || page.template === 'hero-text') && c.html && (
          <div
            className="legal-prose"
            dangerouslySetInnerHTML={{ __html: c.html }}
          />
        )}

        {/* cards */}
        {page.template === 'cards' && cards.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
                {card.image && <img src={card.image} alt={card.title} className="w-full rounded-xl mb-4 object-cover" style={{ height: 160 }} />}
                {card.title && <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>{card.title}</h3>}
                {card.text && <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>{card.text}</p>}
              </div>
            ))}
          </div>
        )}

        {/* list */}
        {page.template === 'list' && items.length > 0 && (
          <ol className="space-y-6">
            {items.map((item, i) => (
              <li key={i} className="flex gap-5 items-start">
                <span className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono"
                  style={{ background: 'var(--color-sage-dark)', color: '#fff' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  {item.title && <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.25rem' }}>{item.title}</h3>}
                  {item.text && <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>{item.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* accordion */}
        {page.template === 'accordion' && items.length > 0 && (
          <div className="divide-y" style={{ borderTop: '1px solid var(--color-line)' }}>
            {items.map((item, i) => <AccordionItem key={i} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
